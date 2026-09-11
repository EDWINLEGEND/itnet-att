import { AttendanceRecord, ShiftType } from "@/types/attendance";
import { USERS } from "./constants";
import { format, subDays, getDay, isAfter, startOfDay } from "date-fns";

const STORAGE_KEY = "itnet_attendance_records_v1";

// Simple pseudo-random deterministic generator for consistent demo data
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateSeedRecords(): Record<string, AttendanceRecord> {
  const records: Record<string, AttendanceRecord> = {};
  const today = startOfDay(new Date());
  const employees = USERS.filter((u) => u.role === "employee");

  // Generate 120 days (~4 months) of historical attendance
  for (let d = 120; d >= 0; d--) {
    const currentDate = subDays(today, d);
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = getDay(currentDate); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Sundays are non-working days
    if (dayOfWeek === 0) continue;

    // For future dates, do not generate
    if (isAfter(currentDate, today)) continue;

    employees.forEach((emp, empIndex) => {
      const seed = d * 17 + empIndex * 131;
      const rand = pseudoRandom(seed);

      let shiftType: ShiftType;
      let checkInTime: string | undefined;
      let checkOutTime: string | undefined;
      let notes: string | undefined;

      // Realistic distribution for Mon-Sat:
      // ~84% Full Shift, ~6% Morning Half, ~5% Afternoon Half, ~5% Leave
      if (rand < 0.84) {
        shiftType = "full";
        checkInTime = "09:55 AM";
        checkOutTime = "06:05 PM";
      } else if (rand < 0.90) {
        shiftType = "half_morning";
        checkInTime = "09:58 AM";
        checkOutTime = "02:00 PM";
        notes = "Personal errand in afternoon";
      } else if (rand < 0.95) {
        shiftType = "half_afternoon";
        checkInTime = "01:55 PM";
        checkOutTime = "06:00 PM";
        notes = "Medical checkup in morning";
      } else {
        shiftType = "leave";
        notes = "Approved casual leave";
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
