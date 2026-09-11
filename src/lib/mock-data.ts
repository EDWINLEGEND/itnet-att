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
const STORAGE_KEY = "itnetai_attendance_records_v3";
const HOLIDAYS_STORAGE_KEY = "itnetai_official_holidays_v1";

// Simple pseudo-random deterministic generator for consistent demo data
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateSeedRecords(): Record<string, AttendanceRecord> {
  const records: Record<string, AttendanceRecord> = {};
  const today = startOfDay(new Date());
  const startDate = parseISO(ATTENDANCE_START_DATE);
  const employees = USERS.filter((u) => u.role === "employee");

  const totalDays = Math.max(0, differenceInDays(today, startDate));

  // Generate records strictly from September 7th up to today
  for (let d = 0; d <= totalDays; d++) {
    const currentDate = addDays(startDate, d);
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = getDay(currentDate); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Sundays are non-working days
    if (dayOfWeek === 0) continue;

    // For future dates beyond today, do not generate
    if (isAfter(currentDate, today)) continue;

    employees.forEach((emp, empIndex) => {
      const seed = (d + 1) * 23 + empIndex * 149;
      const rand = pseudoRandom(seed);

      let shiftType: ShiftType;
      let checkInTime: string | undefined;
      let checkOutTime: string | undefined;
      let notes: string | undefined;

      // Clean distribution for workdays from Sep 7:
      if (rand < 0.85) {
        shiftType = "full";
        checkInTime = "09:55 AM";
        checkOutTime = "06:05 PM";
      } else if (rand < 0.93) {
        shiftType = "half_morning";
        checkInTime = "09:58 AM";
        checkOutTime = "02:00 PM";
        notes = "Morning shift completed";
      } else {
        shiftType = "half_afternoon";
        checkInTime = "01:55 PM";
        checkOutTime = "06:00 PM";
        notes = "Afternoon shift completed";
      }

      const key = `${emp.id}_${dateStr}`;
      records[key] = {
        id: `rec-${emp.id}-${dateStr}`,
        userId: emp.id,
        date: dateStr,
        shiftType,
        checkInTime,
        checkOutTime,
        notes,
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Object.keys(parsed).length > 0) {
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
