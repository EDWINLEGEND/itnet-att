import { AttendanceRecord, ShiftType, OfficialHoliday } from "@/types/attendance";
import { USERS } from "./constants";
import {
  format,
  getDay,
  isAfter,
  isBefore,
  startOfDay,
  parseISO,
  differenceInDays,
  addDays,
} from "date-fns";

export const ATTENDANCE_START_DATE = "2026-09-07";
const STORAGE_KEY = "itnetai_attendance_records_v4";
const HOLIDAYS_STORAGE_KEY = "itnetai_official_holidays_v2";

export function generateSeedRecords(): Record<string, AttendanceRecord> {
  const records: Record<string, AttendanceRecord> = {};
  const today = startOfDay(new Date());
  const startDate = parseISO(ATTENDANCE_START_DATE);
  const employees = USERS.filter((u) => u.role === "employee");

  const totalDays = Math.max(0, differenceInDays(today, startDate));

  // Initialize records strictly from September 7th up to today as Leave
  for (let d = 0; d <= totalDays; d++) {
    const currentDate = addDays(startDate, d);
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = getDay(currentDate); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Sundays are non-working days
    if (dayOfWeek === 0) continue;

    // For future dates beyond today, do not generate
    if (isAfter(currentDate, today)) continue;

    employees.forEach((emp) => {
      const key = `${emp.id}_${dateStr}`;
      records[key] = {
        id: `rec-${emp.id}-${dateStr}`,
        userId: emp.id,
        date: dateStr,
        shiftType: "leave",
        updatedAt: new Date().toISOString(),
      };
    });
  }

  return records;
}

export function loadStoredRecords(): Record<string, AttendanceRecord> {
  if (typeof window === "undefined") {
    return generateSeedRecords();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load records from localStorage", err);
  }

  const seeded = generateSeedRecords();
  saveStoredRecords(seeded);
  return seeded;
}

export function saveStoredRecords(records: Record<string, AttendanceRecord>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to save records to localStorage", err);
  }
}

export function clearStoredRecords(): Record<string, AttendanceRecord> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  const fresh = generateSeedRecords();
  saveStoredRecords(fresh);
  return fresh;
}

// Official Holidays Persistence Helpers
export function loadStoredHolidays(): Record<string, OfficialHoliday> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.error("Failed to load official holidays from localStorage", err);
  }

  return {};
}

export function saveStoredHolidays(holidays: Record<string, OfficialHoliday>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays));
  } catch (err) {
    console.error("Failed to save official holidays to localStorage", err);
  }
}

export function clearStoredHolidays(): Record<string, OfficialHoliday> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(HOLIDAYS_STORAGE_KEY);
  }
  return {};
}
