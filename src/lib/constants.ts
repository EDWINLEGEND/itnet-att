import { User, ShiftType, UserTheme } from "@/types/attendance";

export const USER_THEMES: Record<string, UserTheme> = {
  "emp-shan": {
    name: "Sky Blue",
    pastelBg: "bg-sky-50 dark:bg-sky-950/30",
    pastelWash: "from-sky-100/60 via-background to-background dark:from-sky-950/30",
    badge: "bg-sky-100/90 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
    avatarBg: "bg-sky-200 text-sky-800 dark:bg-sky-900 dark:text-sky-100",
    accentText: "text-sky-700 dark:text-sky-300",
    cardTint: "bg-sky-50/50 dark:bg-sky-950/20",
    indicatorBg: "bg-sky-400",
  },
  "emp-edwin": {
    name: "Periwinkle",
    pastelBg: "bg-indigo-50 dark:bg-indigo-950/30",
    pastelWash: "from-indigo-100/60 via-background to-background dark:from-indigo-950/30",
    badge: "bg-indigo-100/90 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
    avatarBg: "bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
    accentText: "text-indigo-700 dark:text-indigo-300",
    cardTint: "bg-indigo-50/50 dark:bg-indigo-950/20",
    indicatorBg: "bg-indigo-400",
  },
  "emp-able": {
    name: "Sunny Amber",
    pastelBg: "bg-amber-50 dark:bg-amber-950/30",
    pastelWash: "from-amber-100/60 via-background to-background dark:from-amber-950/30",
    badge: "bg-amber-100/90 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200",
    avatarBg: "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
    accentText: "text-amber-800 dark:text-amber-300",
    cardTint: "bg-amber-50/50 dark:bg-amber-950/20",
    indicatorBg: "bg-amber-400",
  },
  "emp-devdath": {
    name: "Lavender",
    pastelBg: "bg-purple-50 dark:bg-purple-950/30",
    pastelWash: "from-purple-100/60 via-background to-background dark:from-purple-950/30",
    badge: "bg-purple-100/90 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
    avatarBg: "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    accentText: "text-purple-700 dark:text-purple-300",
    cardTint: "bg-purple-50/50 dark:bg-purple-950/20",
    indicatorBg: "bg-purple-400",
  },
  "admin-1": {
    name: "Mint Green",
    pastelBg: "bg-emerald-50 dark:bg-emerald-950/40",
    pastelWash: "from-emerald-100/70 via-background to-background dark:from-emerald-950/40",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    avatarBg: "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200",
    accentText: "text-emerald-800 dark:text-emerald-300",
    cardTint: "bg-emerald-50/50 dark:bg-emerald-950/20",
    indicatorBg: "bg-emerald-500",
  },
};

export const USERS: User[] = [
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@itnetai.com",
    password: "admin123",
    role: "admin",
    designation: "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    initials: "AD",
    theme: USER_THEMES["admin-1"],
  },
  {
    id: "emp-shan",
    name: "Shan",
    email: "shan@itnetai.com",
    password: "shan123",
    role: "employee",
    designation: "",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    initials: "SH",
    theme: USER_THEMES["emp-shan"],
  },
  {
    id: "emp-edwin",
    name: "Edwin",
    email: "edwin@itnetai.com",
    password: "edwin123",
    role: "employee",
    designation: "",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    initials: "ED",
    theme: USER_THEMES["emp-edwin"],
  },
  {
    id: "emp-able",
    name: "Able",
    email: "able@itnetai.com",
    password: "able123",
    role: "employee",
    designation: "",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "AB",
    theme: USER_THEMES["emp-able"],
  },
  {
    id: "emp-devdath",
    name: "Devdath",
    email: "devdath@itnetai.com",
    password: "devdath123",
    role: "employee",
    designation: "",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    initials: "DD",
    theme: USER_THEMES["emp-devdath"],
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
