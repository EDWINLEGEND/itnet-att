"use client";

import React, { useState, useMemo } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { AttendanceHeatmap } from "../heatmap/AttendanceHeatmap";
import { MarkAttendanceModal } from "../attendance/MarkAttendanceModal";
import { useAttendance } from "@/lib/attendance-context";
import { SHIFT_CONFIGS } from "@/lib/constants";
import {
  format,
  startOfDay,
  getDay,
  subDays,
} from "date-fns";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Briefcase,
  History,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";

interface EmployeeDashboardProps {
  user: User;
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const { records, markAttendance, calculateUserStats } = useAttendance();
  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableFilter, setTableFilter] = useState<string>("all");

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);
  const dayOfWeek = getDay(today);
  const isSundayToday = dayOfWeek === 0;

  const todayRecord = records[`${user.id}_${todayStr}`];
  const stats = useMemo(() => calculateUserStats(user.id, 90), [user.id, calculateUserStats, records]);

  const handleQuickMarkToday = (shiftType: ShiftType) => {
    markAttendance(user.id, todayStr, shiftType);
    if (shiftType !== "leave") {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // silent
      }
    }
  };

  const handleCellClick = (day: DayAttendance) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  // Build 30-day recent logs
  const recentLogs = useMemo(() => {
    const list: DayAttendance[] = [];
    for (let i = 0; i < 30; i++) {
      const d = subDays(today, i);
      const dStr = format(d, "yyyy-MM-dd");
      const dOfWeek = getDay(d);
      const isSun = dOfWeek === 0;
      const rec = records[`${user.id}_${dStr}`];

      list.push({
        date: dStr,
        dateObj: d,
        dayOfWeek: dOfWeek,
        isSunday: isSun,
        isWorkDay: !isSun,
        isFuture: false,
        isToday: i === 0,
        record: rec,
      });
    }

    if (tableFilter === "all") return list;
    if (tableFilter === "full") return list.filter((item) => item.record?.shiftType === "full");
    if (tableFilter === "half")
      return list.filter(
        (item) =>
          item.record?.shiftType === "half_morning" ||
          item.record?.shiftType === "half_afternoon"
      );
    if (tableFilter === "leave")
      return list.filter(
        (item) => !item.isSunday && (!item.record || item.record.shiftType === "leave")
      );
    return list;
  }, [today, records, user.id, tableFilter]);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Today's Punch Card */}
      <div className="bg-gradient-to-r from-emerald-900/20 via-teal-900/10 to-zinc-900/20 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/30">
                Employee Workspace
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {user.designation}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Hello, {user.name} 👋
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                Today is <strong className="text-zinc-900 dark:text-white">{format(today, "EEEE, MMMM d, yyyy")}</strong>
              </span>
            </p>
          </div>

          {/* Today's Shift Status Card */}
          <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-w-[320px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Today&apos;s Status
              </span>
              {todayRecord ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clocked In
                </span>
              ) : isSundayToday ? (
                <span className="text-xs text-zinc-400">Sunday Off</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> Pending Log
                </span>
              )}
            </div>

            {/* Current status display */}
            <div className="mb-3">
              {todayRecord ? (
                <div className="flex items-center gap-3">
                  {/* Status Preview Box */}
                  {todayRecord.shiftType === "full" && (
                    <div className="w-7 h-7 rounded-md bg-emerald-500 border border-emerald-600" />
                  )}
                  {todayRecord.shiftType === "half_morning" && (
                    <div className="w-7 h-7 rounded-md border border-zinc-400 overflow-hidden relative flex">
                      <div className="w-1/2 h-full bg-emerald-500" />
                      <div className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  )}
                  {todayRecord.shiftType === "half_afternoon" && (
                    <div className="w-7 h-7 rounded-md border border-zinc-400 overflow-hidden relative flex">
                      <div className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-800" />
                      <div className="w-1/2 h-full bg-emerald-500" />
                    </div>
                  )}
                  {todayRecord.shiftType === "leave" && (
                    <div className="w-7 h-7 rounded-md border-2 border-rose-400 bg-transparent" />
                  )}

                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      {SHIFT_CONFIGS[todayRecord.shiftType].label}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {SHIFT_CONFIGS[todayRecord.shiftType].timeRange}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Mark your shift for today (10:00 AM – 6:00 PM)
                </div>
              )}
            </div>

            {/* 1-Click Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => handleQuickMarkToday("full")}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  todayRecord?.shiftType === "full"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-emerald-500/20"
                }`}
              >
                <div className="w-3 h-3 rounded-[2px] bg-emerald-500 border border-emerald-600" />
                <span>Full Shift (10-6)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickMarkToday("half_morning")}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  todayRecord?.shiftType === "half_morning"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-amber-500/20"
                }`}
              >
                <div className="w-3 h-3 rounded-[2px] border border-zinc-400 overflow-hidden flex">
                  <div className="w-1/2 h-full bg-emerald-500" />
                  <div className="w-1/2 h-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
                <span>Morning (10-2)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickMarkToday("half_afternoon")}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  todayRecord?.shiftType === "half_afternoon"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-cyan-500/20"
                }`}
              >
                <div className="w-3 h-3 rounded-[2px] border border-zinc-400 overflow-hidden flex">
                  <div className="w-1/2 h-full bg-zinc-300 dark:bg-zinc-700" />
                  <div className="w-1/2 h-full bg-emerald-500" />
                </div>
                <span>Afternoon (2-6)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickMarkToday("leave")}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  todayRecord?.shiftType === "leave"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-rose-500/20"
                }`}
              >
                <div className="w-3 h-3 rounded-[2px] border-2 border-rose-400 bg-transparent" />
                <span>On Leave</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary GitHub Commits Heatmap View */}
      <AttendanceHeatmap
        user={user}
        onSelectDay={handleCellClick}
        weeksCount={24}
        showTitle={true}
        showLegend={true}
        showStats={true}
      />

      {/* Recent Attendance History Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Recent Attendance Log (Past 30 Days)
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg text-xs">
            <button
              onClick={() => setTableFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tableFilter === "all"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTableFilter("full")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tableFilter === "full"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Full Shifts
            </button>
            <button
              onClick={() => setTableFilter("half")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tableFilter === "half"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Half Shifts
            </button>
            <button
              onClick={() => setTableFilter("leave")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tableFilter === "leave"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Leaves
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="pb-2.5 pl-2">Date</th>
                <th className="pb-2.5">Day</th>
                <th className="pb-2.5">Visual Box</th>
                <th className="pb-2.5">Shift Type</th>
                <th className="pb-2.5">Working Hours</th>
                <th className="pb-2.5">Notes</th>
                <th className="pb-2.5 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {recentLogs.map((day) => {
                const shiftType = day.record?.shiftType;
                const config = shiftType ? SHIFT_CONFIGS[shiftType] : null;

                return (
                  <tr
                    key={day.date}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-2.5 pl-2 font-medium text-zinc-900 dark:text-white">
                      {format(day.dateObj, "MMM dd, yyyy")}
                      {day.isToday && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-500 font-bold">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-zinc-500 dark:text-zinc-400">
                      {format(day.dateObj, "EEEE")}
                    </td>

                    {/* Visual Box Cell */}
                    <td className="py-2.5">
                      {day.isSunday ? (
                        <div className="w-5 h-5 rounded-[3px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                      ) : shiftType === "full" ? (
                        <div className="w-5 h-5 rounded-[3px] bg-emerald-500 border border-emerald-600" />
                      ) : shiftType === "half_morning" ? (
                        <div className="w-5 h-5 rounded-[3px] border border-zinc-400 overflow-hidden relative flex">
                          <div className="w-1/2 h-full bg-emerald-500" />
                          <div className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                      ) : shiftType === "half_afternoon" ? (
                        <div className="w-5 h-5 rounded-[3px] border border-zinc-400 overflow-hidden relative flex">
                          <div className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-800" />
                          <div className="w-1/2 h-full bg-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-[3px] border-2 border-rose-400 bg-transparent" />
                      )}
                    </td>

                    <td className="py-2.5">
                      {day.isSunday ? (
                        <span className="text-zinc-400 font-medium">Sunday (Non-Working)</span>
                      ) : config ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-[11px] border ${config.badgeClass}`}
                        >
                          {config.label}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-medium">On Leave / Absent</span>
                      )}
                    </td>

                    <td className="py-2.5 font-mono text-zinc-600 dark:text-zinc-400">
                      {day.isSunday ? (
                        <span className="text-zinc-400">&ndash;</span>
                      ) : config ? (
                        <span>{config.timeRange}</span>
                      ) : (
                        <span className="text-rose-400">0 hrs</span>
                      )}
                    </td>

                    <td className="py-2.5 text-zinc-500 dark:text-zinc-400 max-w-[180px] truncate">
                      {day.record?.notes || <span className="text-zinc-300 dark:text-zinc-600">&ndash;</span>}
                    </td>

                    <td className="py-2.5 text-right pr-2">
                      <button
                        onClick={() => handleCellClick(day)}
                        className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        day={selectedDay}
        targetUser={user}
      />
    </div>
  );
}
