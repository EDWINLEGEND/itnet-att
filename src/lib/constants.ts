import { User, ShiftType, UserTheme } from "@/types/attendance";

export const USER_THEMES: Record<string, UserTheme> = {
  "emp-shan": {
    name: "Cyan",
    pastelBg: "bg-cyan-100 hover:bg-cyan-200/90 dark:bg-cyan-950/70 dark:hover:bg-cyan-900/70",
    pastelWash: "from-cyan-200/70 via-cyan-100/30 to-transparent dark:from-cyan-950/60",
    headerBg: "bg-cyan-100/95 dark:bg-cyan-950/80 text-cyan-950 dark:text-cyan-100",
    badge: "bg-cyan-200 text-cyan-950 font-bold dark:bg-cyan-900/90 dark:text-cyan-200",
    avatarBg: "bg-cyan-300 text-cyan-950 font-bold dark:bg-cyan-800 dark:text-cyan-100",
    accentText: "text-cyan-950 dark:text-cyan-300",
    cardTint: "bg-cyan-100/80 dark:bg-cyan-950/50",
    indicatorBg: "bg-cyan-500",
    activeTab: "bg-cyan-200 text-cyan-950 font-bold shadow-2xs dark:bg-cyan-900 dark:text-cyan-100",
  },
  "emp-edwin": {
    name: "Gray",
    pastelBg: "bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800/70 dark:hover:bg-slate-700/70",
    pastelWash: "from-slate-200/70 via-slate-100/30 to-transparent dark:from-slate-900/60",
    headerBg: "bg-slate-100/95 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100",
    badge: "bg-slate-200 text-slate-950 font-bold dark:bg-slate-700 dark:text-slate-200",
    avatarBg: "bg-slate-300 text-slate-950 font-bold dark:bg-slate-600 dark:text-slate-100",
    accentText: "text-slate-950 dark:text-slate-300",
    cardTint: "bg-slate-100/80 dark:bg-slate-800/50",
    indicatorBg: "bg-slate-500",
    activeTab: "bg-slate-200 text-slate-950 font-bold shadow-2xs dark:bg-slate-700 dark:text-slate-100",
  },
  "emp-able": {
    name: "Pink",
    pastelBg: "bg-pink-100 hover:bg-pink-200/90 dark:bg-pink-950/70 dark:hover:bg-pink-900/70",
    pastelWash: "from-pink-200/70 via-pink-100/30 to-transparent dark:from-pink-950/60",
    headerBg: "bg-pink-100/95 dark:bg-pink-950/80 text-pink-950 dark:text-pink-100",
    badge: "bg-pink-200 text-pink-950 font-bold dark:bg-pink-900/90 dark:text-pink-200",
    avatarBg: "bg-pink-300 text-pink-950 font-bold dark:bg-pink-800 dark:text-pink-100",
    accentText: "text-pink-950 dark:text-pink-300",
    cardTint: "bg-pink-100/80 dark:bg-pink-950/50",
    indicatorBg: "bg-pink-500",
    activeTab: "bg-pink-200 text-pink-950 font-bold shadow-2xs dark:bg-pink-900 dark:text-pink-100",
  },
  "emp-devdath": {
    name: "Yellow",
    pastelBg: "bg-yellow-100 hover:bg-yellow-200/90 dark:bg-yellow-950/70 dark:hover:bg-yellow-900/70",
    pastelWash: "from-yellow-200/70 via-yellow-100/30 to-transparent dark:from-yellow-950/60",
    headerBg: "bg-yellow-100/95 dark:bg-yellow-950/80 text-yellow-950 dark:text-yellow-100",
    badge: "bg-yellow-200 text-yellow-950 font-bold dark:bg-yellow-900/90 dark:text-yellow-200",
    avatarBg: "bg-yellow-300 text-yellow-950 font-bold dark:bg-yellow-800 dark:text-yellow-100",
    accentText: "text-yellow-950 dark:text-yellow-300",
    cardTint: "bg-yellow-100/80 dark:bg-yellow-950/50",
    indicatorBg: "bg-yellow-500",
    activeTab: "bg-yellow-200 text-yellow-950 font-bold shadow-2xs dark:bg-yellow-900 dark:text-yellow-100",
  },
  "admin-1": {
    name: "Mint Green",
    pastelBg: "bg-emerald-100 hover:bg-emerald-200/90 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/70",
    pastelWash: "from-emerald-200/70 via-emerald-100/30 to-transparent dark:from-emerald-950/60",
    headerBg: "bg-emerald-100/95 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100",
    badge: "bg-emerald-200 text-emerald-950 font-bold dark:bg-emerald-900/90 dark:text-emerald-200",
    avatarBg: "bg-emerald-300 text-emerald-950 font-bold dark:bg-emerald-800 dark:text-emerald-100",
    accentText: "text-emerald-950 dark:text-emerald-300",
    cardTint: "bg-emerald-100/80 dark:bg-emerald-950/50",
    indicatorBg: "bg-emerald-500",
    activeTab: "bg-emerald-200 text-emerald-950 font-bold shadow-2xs dark:bg-emerald-900 dark:text-emerald-100",
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
