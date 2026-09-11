"use client";

import React, { useMemo, useState } from "react";
import { User, DayAttendance } from "@/types/attendance";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  weeksCount = 24,
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

  const { weeks, monthHeaders } = useMemo(() => {
    const today = startOfDay(new Date());
    // Display past weeks plus 2 weeks into the future for pre-marked planned leaves
    const futureWeeksCount = 2;
    const pastWeeksCount = Math.max(8, selectedRange - futureWeeksCount);
    const startDate = startOfWeek(subWeeks(today, pastWeeksCount - 1), { weekStartsOn: 1 });

    const weeksList: DayAttendance[][] = [];
    const months: { label: string; colIndex: number }[] = [];
    let lastMonth = "";

    for (let w = 0; w < selectedRange; w++) {
      const weekDays: DayAttendance[] = [];
      const currentWeekStart = addDays(startDate, w * 7);

      const monthLabel = format(currentWeekStart, "MMM");
      if (monthLabel !== lastMonth) {
        months.push({ label: monthLabel, colIndex: w });
        lastMonth = monthLabel;
      }

      for (let d = 0; d < 7; d++) {
        const dateObj = addDays(currentWeekStart, d);
        const dateStr = format(dateObj, "yyyy-MM-dd");
        const dayOfWeek = getDay(dateObj);
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
    <TooltipProvider>
      <Card className="border-border">
        {showTitle && (
          <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
                    {user.name} &mdash; Attendance Activity
                  </h3>
                  <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                    Mon&ndash;Sat &bull; 10:00 &ndash; 18:00
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  GitHub-style contribution grid &bull; Left fill (10&ndash;2), Right fill (2&ndash;6), Full fill (10&ndash;6)
                </p>
              </div>

              {/* Range Toggle */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg self-start sm:self-auto text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRange(14)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedRange === 14
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  14 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRange(24)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedRange === 24
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  24 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRange(32)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedRange === 32
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  32 Weeks
                </button>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className="p-4 sm:p-6">
          {/* Key Metrics Header */}
          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Attendance
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.attendancePercentage}%
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {stats.attendedDaysCount} / {stats.totalScheduledWorkDays} days
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Full Shifts
                </div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  {stats.fullDaysCount}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">8h &bull; 10:00 &ndash; 18:00</div>
              </div>

              <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Morning Half
                </div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  {stats.halfMorningCount}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">4h &bull; 10:00 &ndash; 14:00</div>
              </div>

              <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Afternoon Half
                </div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  {stats.halfAfternoonCount}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">4h &bull; 14:00 &ndash; 18:00</div>
              </div>

              <div className="p-3 rounded-lg border border-border/80 bg-muted/20 col-span-2 sm:col-span-1">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Leaves
                </div>
                <div className="text-2xl font-bold font-mono text-rose-500 mt-1">
                  {stats.leaveDaysCount}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">0h scheduled</div>
              </div>
            </div>
          )}

          {/* GitHub Commit Grid */}
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="inline-block min-w-max">
              {/* Months Row */}
              <div className="flex text-[11px] font-medium text-muted-foreground mb-1.5 pl-8 select-none">
                {monthHeaders.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: `${
                        (idx === monthHeaders.length - 1
                          ? selectedRange - m.colIndex
                          : monthHeaders[idx + 1].colIndex - m.colIndex) * 16
                      }px`,
                    }}
                    className="overflow-visible whitespace-nowrap"
                  >
                    {m.label}
                  </div>
                ))}
              </div>

              {/* Grid: Days on Left, Columns on Right */}
              <div className="flex gap-1.5">
                <div className="flex flex-col justify-between py-0.5 text-[10px] text-muted-foreground w-6 select-none font-mono">
                  {dayLabels.map((lbl, idx) => (
                    <span
                      key={idx}
                      className={`h-[13px] flex items-center leading-none ${
                        idx === 6 ? "text-muted-foreground/60" : ""
                      }`}
                    >
                      {idx % 2 === 0 ? lbl : ""}
                    </span>
                  ))}
                </div>

                <div className="flex gap-[3px]">
                  {weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-[3px]">
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

          {/* Authentic GitHub Style Legend */}
          {showLegend && (
            <div className="mt-5 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="text-[11px]">Click any date to log or modify shift</span>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-muted-foreground">Less</span>

                {/* Empty / Leave */}
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-[2px] border border-zinc-300 dark:border-zinc-700 bg-transparent" />
                  <span>Leave</span>
                </div>

                {/* Pre-marked Planned Leave */}
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-[2px] bg-rose-500/10 border border-dashed border-rose-400" />
                  <span>Planned</span>
                </div>

                {/* Left Fill (Morning) */}
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex">
                    <div className="w-1/2 h-full bg-[#30a14e] dark:bg-[#26a641]" />
                    <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-900" />
                  </div>
                  <span>Morning (10-2)</span>
                </div>

                {/* Right Fill (Afternoon) */}
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex">
                    <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-900" />
                    <div className="w-1/2 h-full bg-[#30a14e] dark:bg-[#26a641]" />
                  </div>
                  <span>Afternoon (2-6)</span>
                </div>

                {/* Full Day */}
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-[2px] bg-[#216e39] dark:bg-[#39d353] border border-black/10 dark:border-white/10" />
                  <span className="font-medium text-foreground">Full Day (10-6)</span>
                </div>

                <span className="text-muted-foreground">More</span>

                {/* Sunday Off */}
                <div className="flex items-center gap-1 pl-2 border-l border-border">
                  <div className="w-3 h-3 rounded-[2px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                  <span className="text-muted-foreground/70">Sunday Off</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
