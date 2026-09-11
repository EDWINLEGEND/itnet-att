export type Role = "admin" | "employee";

export type ShiftType = "full" | "half_morning" | "half_afternoon" | "leave";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  designation: string;
  avatar: string;
  initials: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  updatedAt: string;
}

export interface OfficialHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
}

export interface DayAttendance {
  date: string; // YYYY-MM-DD
  dateObj: Date;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isSunday: boolean; // Sunday is non-working
  isWorkDay: boolean; // Monday - Saturday
  isFuture: boolean;
  isToday: boolean;
  isHoliday?: boolean;
  holidayTitle?: string;
  isPriorToStart?: boolean;
  record?: AttendanceRecord;
}

export interface UserAttendanceStats {
  totalScheduledWorkDays: number;
  attendedDaysCount: number; // Full (1) + Half (0.5)
  fullDaysCount: number;
  halfMorningCount: number;
  halfAfternoonCount: number;
  leaveDaysCount: number;
  attendancePercentage: number; // (attendedDaysCount / totalScheduledWorkDays) * 100
  totalHoursWorked: number;
  currentStreak: number;
}
