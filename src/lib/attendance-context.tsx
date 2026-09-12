import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  User,
  AttendanceRecord,
  ShiftType,
  UserAttendanceStats,
  OfficialHoliday,
  WorkLocation,
  TeamMemberDayPresence,
} from "@/types/attendance";
import { USERS } from "./constants";
import {
  loadStoredRecords,
  saveStoredRecords,
  clearStoredRecords,
  loadStoredHolidays,
  saveStoredHolidays,
  clearStoredHolidays,
  ATTENDANCE_START_DATE,
} from "./mock-data";
import { format, subDays, addDays, getDay, isAfter, isBefore, startOfDay, parseISO } from "date-fns";

interface AttendanceContextType {
  currentUser: User | null;
  users: User[];
  records: Record<string, AttendanceRecord>;
  holidays: Record<string, OfficialHoliday>;
  addHoliday: (date: string, title: string) => void;
  deleteHoliday: (date: string) => void;
  isOfficialHoliday: (date: string) => OfficialHoliday | undefined;
  login: (email: string, pass: string) => boolean;
  quickLogin: (userId: string) => void;
  logout: () => void;
  markAttendance: (
    userId: string,
    date: string,
    shiftType: ShiftType,
    notes?: string,
    workLocation?: WorkLocation
  ) => void;
  preMarkLeave: (userId: string, startDate: string, endDate?: string, reason?: string) => void;
  preMarkSchedule: (
    userId: string,
    startDate: string,
    endDate?: string,
    shiftType?: ShiftType,
    workLocation?: WorkLocation,
    reason?: string
  ) => void;
  getTeamStatusForDate: (dateStr: string) => TeamMemberDayPresence[];
  getTeamWeekStatus: (referenceDate?: Date) => {
    date: string;
    dateObj: Date;
    dayName: string;
    dayNum: string;
    formattedDate: string;
    isSunday: boolean;
    isToday: boolean;
    isHoliday?: boolean;
    holidayTitle?: string;
    members: TeamMemberDayPresence[];
  }[];
  deleteAttendance: (userId: string, date: string) => void;
  getRecord: (userId: string, date: string) => AttendanceRecord | undefined;
  getUpcomingLeaves: (daysAhead?: number) => { record: AttendanceRecord; user: User; dateObj: Date }[];
  calculateUserStats: (userId: string, daysBack?: number) => UserAttendanceStats;
  resetDemoData: () => void;
  isLoaded: boolean;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const USER_SESSION_KEY = "itnetai_active_user_id";

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
  const [holidays, setHolidays] = useState<Record<string, OfficialHoliday>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const loadedRecords = loadStoredRecords();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecords(loadedRecords);

    const loadedHolidays = loadStoredHolidays();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHolidays(loadedHolidays);

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
    (
      userId: string,
      date: string,
      shiftType: ShiftType,
      notes?: string,
      workLocation?: WorkLocation
    ) => {
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

        const resolvedLocation: WorkLocation | undefined =
          shiftType === "leave"
            ? undefined
            : workLocation || prev[key]?.workLocation || "office";

        const newRecord: AttendanceRecord = {
          id: prev[key]?.id || `rec-${userId}-${date}`,
          userId,
          date,
          shiftType,
          workLocation: resolvedLocation,
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

  const preMarkSchedule = useCallback(
    (
      userId: string,
      startDate: string,
      endDate?: string,
      shiftType: ShiftType = "leave",
      workLocation: WorkLocation = "remote",
      reason?: string
    ) => {
      setRecords((prev) => {
        const next = { ...prev };
        const start = parseISO(startDate);
        const end = endDate ? parseISO(endDate) : start;
        const isLeave = shiftType === "leave";
        const defaultPrefix = isLeave
          ? "Planned Leave"
          : workLocation === "remote"
          ? "Planned Online (WFH)"
          : "Planned In-Office";

        const noteText = reason?.trim() ? `${defaultPrefix}: ${reason.trim()}` : defaultPrefix;

        let cur = start;
        while (!isAfter(cur, end)) {
          if (getDay(cur) !== 0) {
            const dateStr = format(cur, "yyyy-MM-dd");
            const key = `${userId}_${dateStr}`;
            next[key] = {
              id: prev[key]?.id || `rec-${userId}-${dateStr}`,
              userId,
              date: dateStr,
              shiftType,
              workLocation: isLeave ? undefined : workLocation,
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

  const preMarkLeave = useCallback(
    (userId: string, startDate: string, endDate?: string, reason?: string) => {
      preMarkSchedule(userId, startDate, endDate, "leave", undefined, reason);
    },
    [preMarkSchedule]
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
          if (isAfter(recDate, today) && !isAfter(recDate, maxDate)) {
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

  const addHoliday = useCallback((date: string, title: string) => {
    setHolidays((prev) => {
      const updated = {
        ...prev,
        [date]: { id: `holiday-${date}`, date, title: title.trim() || "Official Holiday" },
      };
      saveStoredHolidays(updated);
      return updated;
    });
  }, []);

  const deleteHoliday = useCallback((date: string) => {
    setHolidays((prev) => {
      const updated = { ...prev };
      delete updated[date];
      saveStoredHolidays(updated);
      return updated;
    });
  }, []);

  const isOfficialHoliday = useCallback((date: string) => {
    return holidays[date];
  }, [holidays]);

  const getTeamStatusForDate = useCallback(
    (dateStr: string): TeamMemberDayPresence[] => {
      const employees = USERS.filter((u) => u.role === "employee");
      let d: Date;
      try {
        d = parseISO(dateStr);
      } catch {
        d = startOfDay(new Date());
      }
      const isSun = getDay(d) === 0;
      const holiday = isOfficialHoliday(dateStr);

      return employees.map((emp) => {
        const rec = records[`${emp.id}_${dateStr}`];
        const isLeave = rec?.shiftType === "leave";
        const isPending = !rec && !isSun && !holiday;

        return {
          user: emp,
          record: rec,
          shiftType: rec?.shiftType,
          workLocation: rec?.workLocation,
          isLeave,
          isHoliday: !!holiday,
          holidayTitle: holiday?.title,
          isSunday: isSun,
          isPending,
        };
      });
    },
    [records, isOfficialHoliday]
  );

  const getTeamWeekStatus = useCallback(
    (referenceDate?: Date) => {
      const base = referenceDate || startOfDay(new Date());
      const dayOfWeek = getDay(base); // 0 is Sun, 1 is Mon...
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = addDays(base, diffToMonday);

      const weekDays = [];
      const todayStr = format(startOfDay(new Date()), "yyyy-MM-dd");

      for (let i = 0; i < 6; i++) {
        const curDate = addDays(monday, i);
        const curStr = format(curDate, "yyyy-MM-dd");
        const isToday = curStr === todayStr;
        const holiday = isOfficialHoliday(curStr);
        const members = getTeamStatusForDate(curStr);

        weekDays.push({
          date: curStr,
          dateObj: curDate,
          dayName: format(curDate, "EEE"),
          dayNum: format(curDate, "d"),
          formattedDate: format(curDate, "MMM d"),
          isSunday: false,
          isToday,
          isHoliday: !!holiday,
          holidayTitle: holiday?.title,
          members,
        });
      }

      return weekDays;
    },
    [getTeamStatusForDate, isOfficialHoliday]
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

      const startDate = parseISO(ATTENDANCE_START_DATE);

      for (let d = 0; d <= daysBack; d++) {
        const checkDate = subDays(today, d);

        // Do not calculate prior to the company attendance tracking start date (Sep 7, 2026)
        if (isBefore(checkDate, startDate)) break;

        const dateStr = format(checkDate, "yyyy-MM-dd");
        const dayOfWeek = getDay(checkDate); // 0 = Sun

        // Skip Sunday & Official Holidays
        if (dayOfWeek === 0 || holidays[dateStr]) continue;

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
    [records, holidays]
  );

  const resetDemoData = useCallback(() => {
    const fresh = clearStoredRecords();
    const freshHolidays = clearStoredHolidays();
    setRecords(fresh);
    setHolidays(freshHolidays);
  }, []);

  return (
    <AttendanceContext.Provider
      value={{
        currentUser,
        users: USERS,
        records,
        holidays,
        addHoliday,
        deleteHoliday,
        isOfficialHoliday,
        login,
        quickLogin,
        logout,
        markAttendance,
        preMarkLeave,
        preMarkSchedule,
        getTeamStatusForDate,
        getTeamWeekStatus,
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
