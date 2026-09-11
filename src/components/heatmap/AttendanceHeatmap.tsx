"use client";

import React, { useMemo, useState } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { HeatmapCell } from "./HeatmapCell";
import { useAttendance } from "@/lib/attendance-context";
import {
  format,
  subWeeks,
  startOfWeek,
  addDays,
  isSameDay,
  isAfter,
  startOfDay,
  getDay,
} from "date-fns";
import { Calendar, ChevronRight, Filter } from "lucide-react";

interface AttendanceHeatmapProps {
  user: User;
  onSelectDay?: (day: DayAttendance) => void;
  weeksCount?: number;
  showTitle?: boolean;
  showLegend?: boolean;
  showStats?: boolean;
  compact?: boolean;
}

export function AttendanceHeatmap({
  user,
  onSelectDay,
  weeksCount = 20,
  showTitle = true,
  showLegend = true,
  showStats = true,
  compact = false,
}: AttendanceHeatmapProps) {
  const { records, calculateUserStats } = useAttendance();
  const [selectedRange, setSelectedRange] = useState<number>(weeksCount);

  const stats = useMemo(
    () => calculateUserStats(user.id, selectedRange * 7),
    [user.id, calculateUserStats, selectedRange]
  );

  // Generate grid matrix: columns are weeks, rows are days of week (Mon=0, Tue=1, ..., Sun=6)
  const { weeks, monthHeaders } = useMemo(() => {
    const today = startOfDay(new Date());
    // Start from `selectedRange` weeks ago on Monday (weekStartsOn: 1)
    const startDate = startOfWeek(subWeeks(today, selectedRange - 1), { weekStartsOn: 1 });

    const weeksList: DayAttendance[][] = [];
    const months: { label: string; colIndex: number }[] = [];
    let lastMonth = "";

    for (let w = 0; w < selectedRange; w++) {
      const weekDays: DayAttendance[] = [];
      const currentWeekStart = addDays(startDate, w * 7);

      // Check month change for header label
      const monthLabel = format(currentWeekStart, "MMM");
      if (monthLabel !== lastMonth) {
        months.push({ label: monthLabel, colIndex: w });
        lastMonth = monthLabel;
      }

      for (let d = 0; d < 7; d++) {
        const dateObj = addDays(currentWeekStart, d);
        const dateStr = format(dateObj, "yyyy-MM-dd");
        const dayOfWeek = getDay(dateObj); // 0 = Sun, 1 = Mon ...
        const isSunday = dayOfWeek === 0;
        const isWorkDay = !isSunday;
        const isFuture = isAfter(dateObj, today);
        const isToday = isSameDay(dateObj, today);

        const rec = records[`${user.id}_${dateStr}`];

        weekDays.push({
          date: dateStr,
          dateObj,
          dayOfWeek,
          isSunday,
          isWorkDay,
          isFuture,
          isToday,
          record: rec,
        });
      }
      weeksList.push(weekDays);
    }

    return { weeks: weeksList, monthHeaders: months };
  }, [selectedRange, records, user.id]);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs transition-colors">
      {/* Header with Title and Range Selectors */}
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{user.name}&apos;s Attendance Grid</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-normal">
                  Mon – Sat (10 AM - 6 PM)
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                GitHub-style activity tracking with full shift, morning half, and afternoon half
              </p>
            </div>
          </div>

          {/* Quick Range selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <button
              onClick={() => setSelectedRange(12)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRange === 12
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-semibold"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setSelectedRange(20)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRange === 20
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-semibold"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              5 Months
            </button>
            <button
              onClick={() => setSelectedRange(32)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRange === 32
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-semibold"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              8 Months
            </button>
          </div>
        </div>
      )}

      {/* Metric summary badges */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Attendance Rate
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.attendancePercentage}%
            </div>
            <div className="text-[10px] text-zinc-400">of scheduled Mon-Sat</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Full Shifts (8h)
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {stats.fullDaysCount}
            </div>
            <div className="text-[10px] text-emerald-500 font-medium">10 AM – 6 PM</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Morning Halves (4h)
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {stats.halfMorningCount}
            </div>
            <div className="text-[10px] text-amber-500 font-medium">10 AM – 2 PM (Left fill)</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Afternoon Halves (4h)
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {stats.halfAfternoonCount}
            </div>
            <div className="text-[10px] text-cyan-500 font-medium">2 PM – 6 PM (Right fill)</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Leaves Taken
            </div>
            <div className="text-xl font-bold text-rose-500 mt-0.5">
              {stats.leaveDaysCount}
            </div>
            <div className="text-[10px] text-rose-400/80">No fill (Hollow box)</div>
          </div>
        </div>
      )}

      {/* Heatmap Grid Container (Scrollable on small screens) */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-block min-w-max">
          {/* Month labels row */}
          <div className="flex text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-1.5 pl-8">
            {monthHeaders.map((m, idx) => (
              <div
                key={idx}
                style={{
                  width: `${
                    (idx === monthHeaders.length - 1
                      ? selectedRange - m.colIndex
                      : monthHeaders[idx + 1].colIndex - m.colIndex) * 20
                  }px`,
                }}
                className="overflow-visible whitespace-nowrap"
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Grid Layout: Row headers on left, Week columns on right */}
          <div className="flex gap-1.5">
            {/* Day of Week Labels */}
            <div className="flex flex-col justify-between py-0.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 w-7 select-none">
              {dayLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className={`h-4 flex items-center leading-none ${
                    idx === 6 ? "text-zinc-400/50 italic" : ""
                  }`}
                >
                  {idx % 2 === 0 || idx === 6 ? lbl : ""}
                </span>
              ))}
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <HeatmapCell
                      key={day.date}
                      day={day}
                      size={compact ? "sm" : "md"}
                      onClick={onSelectDay}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      {showLegend && (
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium text-[11px]">
            <span>Click any box to mark/edit shift</span>
          </div>

          {/* Visual Legend items */}
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            {/* Leave: Hollow box */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-[2.5px] border-2 border-rose-300/80 dark:border-rose-500/60 bg-transparent" />
              <span>Leave / Absent</span>
            </div>

            {/* Morning Half: Left Fill */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-[2.5px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex">
                <div className="w-1/2 h-full bg-emerald-500" />
                <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-900" />
              </div>
              <span>Morning Half (10-2)</span>
            </div>

            {/* Afternoon Half: Right Fill */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-[2.5px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex">
                <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-900" />
                <div className="w-1/2 h-full bg-emerald-500" />
              </div>
              <span>Afternoon Half (2-6)</span>
            </div>

            {/* Full Day: Full Fill */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-[2.5px] bg-emerald-500 border border-emerald-600/40" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Full Shift (10-6)</span>
            </div>

            {/* Sunday Off */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-[2.5px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
              <span className="text-zinc-400">Sunday (Off)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
