import { User, ShiftType } from "@/types/attendance";

export const USERS: User[] = [
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@itnetai.com",
    password: "admin123",
    role: "admin",
    designation: "Operations & HR Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    initials: "AD",
  },
  {
    id: "emp-shan",
    name: "Shan",
    email: "shan@itnetai.com",
    password: "shan123",
    role: "employee",
    designation: "Senior Software Engineer",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    initials: "SH",
  },
  {
    id: "emp-edwin",
    name: "Edwin",
    email: "edwin@itnetai.com",
    password: "edwin123",
    role: "employee",
    designation: "Full Stack Developer",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    initials: "ED",
  },
  {
    id: "emp-able",
    name: "Able",
    email: "able@itnetai.com",
    password: "able123",
    role: "employee",
    designation: "Backend & Systems Lead",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "AB",
  },
  {
    id: "emp-devdath",
    name: "Devdath",
    email: "devdath@itnetai.com",
    password: "devdath123",
    role: "employee",
    designation: "UI/UX & Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    initials: "DD",
  },
];

export interface ShiftConfig {
  type: ShiftType;
  label: string;
  shortLabel: string;
  timeRange: string;
  hours: number;
  description: string;
  badgeClass: string;
  borderClass: string;
}

export const SHIFT_CONFIGS: Record<ShiftType, ShiftConfig> = {
  full: {
    type: "full",
    label: "Full Day Shift",
    shortLabel: "Full Day",
    timeRange: "10:00 AM – 6:00 PM",
    hours: 8,
    description: "Complete 8-hour workday (10:00 AM – 6:00 PM)",
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    borderClass: "border-emerald-500",
  },
  half_morning: {
    type: "half_morning",
    label: "Half Day (Morning)",
    shortLabel: "Morning Half",
    timeRange: "10:00 AM – 2:00 PM",
    hours: 4,
    description: "Morning 4-hour shift (10:00 AM – 2:00 PM)",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    borderClass: "border-amber-500",
  },
  half_afternoon: {
    type: "half_afternoon",
    label: "Half Day (Afternoon)",
    shortLabel: "Afternoon Half",
    timeRange: "2:00 PM – 6:00 PM",
    hours: 4,
    description: "Afternoon 4-hour shift (2:00 PM – 6:00 PM)",
    badgeClass: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
    borderClass: "border-cyan-500",
  },
  leave: {
    type: "leave",
    label: "On Leave / Absent",
    shortLabel: "On Leave",
    timeRange: "Off Duty",
    hours: 0,
    description: "Not working / Planned leave (0 hours)",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    borderClass: "border-rose-400",
  },
};

export const WORK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEK_DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
