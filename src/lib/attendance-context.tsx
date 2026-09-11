"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, AttendanceRecord, ShiftType, UserAttendanceStats } from "@/types/attendance";
import { USERS } from "./constants";
import { loadStoredRecords, saveStoredRecords, clearStoredRecords } from "./mock-data";
import { format, subDays, addDays, getDay, isAfter, isBefore, startOfDay, parseISO } from "date-fns";

interface AttendanceContextType {
  currentUser: User | null;
  users: User[];
  records: Record<string, AttendanceRecord>;
  login: (email: string, pass: string) => boolean;
  quickLogin: (userId: string) => void;
  logout: () => void;
  markAttendance: (userId: string, date: string, shiftType: ShiftType, notes?: string) => void;
  preMarkLeave: (userId: string, startDate: string, endDate?: string, reason?: string) => void;
  deleteAttendance: (userId: string, date: string) => void;
  getRecord: (userId: string, date: string) => AttendanceRecord | undefined;
  getUpcomingLeaves: (daysAhead?: number) => { record: AttendanceRecord; user: User; dateObj: Date }[];
  calculateUserStats: (userId: string, daysBack?: number) => UserAttendanceStats;
  resetDemoData: () => void;
  isLoaded: boolean;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const USER_SESSION_KEY = "itnet_active_user_id";

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const loadedRecords = loadStoredRecords();
    setRecords(loadedRecords);

    const savedUserId = localStorage.getItem(USER_SESSION_KEY);
    if (savedUserId) {
      const found = USERS.find((u) => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
      } else {
        setCurrentUser(null);
      }
    } else {
      // First visit: Show Bento Login screen first so user can choose who to log in as
      setCurrentUser(null);
    }

    setIsLoaded(true);
  }, []);

  const login = useCallback((email: string, pass: string): boolean => {
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pass
    );
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(USER_SESSION_KEY, found.id);
      return true;
    }
    return false;
  }, []);

  const quickLogin = useCallback((userId: string) => {
    const found = USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(USER_SESSION_KEY, found.id);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
  }, []);

  const markAttendance = useCallback(
    (userId: string, date: string, shiftType: ShiftType, notes?: string) => {
      setRecords((prev) => {
        const key = `${userId}_${date}`;
        let checkInTime: string | undefined;
        let checkOutTime: string | undefined;

        if (shiftType === "full") {
          checkInTime = "10:00 AM";
          checkOutTime = "06:00 PM";
        } else if (shiftType === "half_morning") {
          checkInTime = "10:00 AM";
          checkOutTime = "02:00 PM";
        } else if (shiftType === "half_afternoon") {
          checkInTime = "02:00 PM";
          checkOutTime = "06:00 PM";
        }

        const newRecord: AttendanceRecord = {
          id: prev[key]?.id || `rec-${userId}-${date}`,
          userId,
          date,
          shiftType,
          checkInTime,
          checkOutTime,
          notes: notes !== undefined ? notes : prev[key]?.notes,
          updatedAt: new Date().toISOString(),
        };

        const updated = {
          ...prev,
          [key]: newRecord,
        };

        saveStoredRecords(updated);
        return updated;
      });
    },
    []
  );

  const preMarkLeave = useCallback(
    (userId: string, startDate: string, endDate?: string, reason?: string) => {
      setRecords((prev) => {
        const next = { ...prev };
        const start = parseISO(startDate);
        const end = endDate ? parseISO(endDate) : start;
        const noteText = reason?.trim() ? `Planned Leave: ${reason.trim()}` : "Planned Leave";

        let cur = start;
        while (!isAfter(cur, end)) {
          if (getDay(cur) !== 0) {
            const dateStr = format(cur, "yyyy-MM-dd");
            const key = `${userId}_${dateStr}`;
            next[key] = {
              id: prev[key]?.id || `rec-${userId}-${dateStr}`,
              userId,
              date: dateStr,
              shiftType: "leave",
              notes: noteText,
              updatedAt: new Date().toISOString(),
            };
          }
          cur = addDays(cur, 1);
        }

        saveStoredRecords(next);
        return next;
      });
    },
    []
  );

  const deleteAttendance = useCallback((userId: string, date: string) => {
    setRecords((prev) => {
      const key = `${userId}_${date}`;
      const next = { ...prev };
      delete next[key];
      saveStoredRecords(next);
      return next;
    });
  }, []);

  const getRecord = useCallback(
    (userId: string, date: string): AttendanceRecord | undefined => {
      return records[`${userId}_${date}`];
    },
    [records]
  );

  const getUpcomingLeaves = useCallback(
    (daysAhead = 14) => {
      const today = startOfDay(new Date());
      const maxDate = addDays(today, daysAhead);
      const results: { record: AttendanceRecord; user: User; dateObj: Date }[] = [];

      Object.values(records).forEach((rec) => {
        if (rec.shiftType === "leave") {
          const recDate = parseISO(rec.date);
          if (!isBefore(recDate, today) && !isAfter(recDate, maxDate)) {
            const u = USERS.find((user) => user.id === rec.userId);
            if (u) {
              results.push({
                record: rec,
                user: u,
                dateObj: recDate,
              });
            }
          }
        }
      });

      return results.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    },
    [records]
  );

  const calculateUserStats = useCallback(
    (userId: string, daysBack = 120): UserAttendanceStats => {
      const today = startOfDay(new Date());
      let totalScheduledWorkDays = 0;
      let fullDaysCount = 0;
      let halfMorningCount = 0;
      let halfAfternoonCount = 0;
      let leaveDaysCount = 0;
      let totalHoursWorked = 0;

      // Current streak calculation
      let currentStreak = 0;
      let streakBroken = false;

      for (let d = 0; d <= daysBack; d++) {
        const checkDate = subDays(today, d);
        const dateStr = format(checkDate, "yyyy-MM-dd");
        const dayOfWeek = getDay(checkDate); // 0 = Sun

        // Skip Sunday
        if (dayOfWeek === 0) continue;

        // Skip future
        if (isAfter(checkDate, today)) continue;

        totalScheduledWorkDays++;

        const rec = records[`${userId}_${dateStr}`];
        if (rec) {
          if (rec.shiftType === "full") {
            fullDaysCount++;
            totalHoursWorked += 8;
            if (!streakBroken) currentStreak++;
          } else if (rec.shiftType === "half_morning") {
            halfMorningCount++;
            totalHoursWorked += 4;
            if (!streakBroken) currentStreak++;
          } else if (rec.shiftType === "half_afternoon") {
            halfAfternoonCount++;
            totalHoursWorked += 4;
            if (!streakBroken) currentStreak++;
          } else if (rec.shiftType === "leave") {
            leaveDaysCount++;
            streakBroken = true;
          }
        } else {
          // If no record logged on a past working day, counts as absent/leave
          leaveDaysCount++;
          streakBroken = true;
        }
      }

      const attendedDaysCount = fullDaysCount + (halfMorningCount + halfAfternoonCount) * 0.5;
      const attendancePercentage =
        totalScheduledWorkDays > 0
          ? Math.round((attendedDaysCount / totalScheduledWorkDays) * 1000) / 10
          : 0;

      return {
        totalScheduledWorkDays,
        attendedDaysCount,
        fullDaysCount,
        halfMorningCount,
        halfAfternoonCount,
        leaveDaysCount,
        attendancePercentage,
        totalHoursWorked,
        currentStreak,
      };
    },
    [records]
  );

  const resetDemoData = useCallback(() => {
    const fresh = clearStoredRecords();
    setRecords(fresh);
  }, []);

  return (
    <AttendanceContext.Provider
      value={{
        currentUser,
        users: USERS,
        records,
        login,
        quickLogin,
        logout,
        markAttendance,
        preMarkLeave,
        deleteAttendance,
        getRecord,
        getUpcomingLeaves,
        calculateUserStats,
        resetDemoData,
        isLoaded,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return ctx;
}
