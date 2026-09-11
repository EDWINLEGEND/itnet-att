"use client";

import React, { useState, useMemo } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { AttendanceHeatmap } from "../heatmap/AttendanceHeatmap";
import { MarkAttendanceModal } from "../attendance/MarkAttendanceModal";
import { PreMarkLeaveModal } from "../attendance/PreMarkLeaveModal";
import { useAttendance } from "@/lib/attendance-context";
import { SHIFT_CONFIGS } from "@/lib/constants";
import {
  format,
  startOfDay,
  getDay,
  subDays,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Calendar,
  History,
  Plane,
  Sparkles,
} from "lucide-react";

interface EmployeeDashboardProps {
  user: User;
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const { records, markAttendance, getUpcomingLeaves, deleteAttendance, isOfficialHoliday } = useAttendance();
  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreMarkOpen, setIsPreMarkOpen] = useState(false);
  const [tableFilter, setTableFilter] = useState<string>("all");

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);
  const dayOfWeek = getDay(today);
  const isSundayToday = dayOfWeek === 0;

  const todayRecord = records[`${user.id}_${todayStr}`];
  const todayHoliday = isOfficialHoliday(todayStr);

  // User's upcoming planned leaves in the next 14 days
  const upcomingLeaves = useMemo(() => {
    return getUpcomingLeaves(14).filter((l) => l.user.id === user.id);
  }, [getUpcomingLeaves, user.id]);

  const handleQuickMarkToday = (shiftType: ShiftType) => {
    markAttendance(user.id, todayStr, shiftType);
  };

  const handleCellClick = (day: DayAttendance) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const recentLogs = useMemo(() => {
    const list: DayAttendance[] = [];
    for (let i = 0; i < 30; i++) {
      const d = subDays(today, i);
      const dStr = format(d, "yyyy-MM-dd");
      const dOfWeek = getDay(d);
      const isSun = dOfWeek === 0;
      const rec = records[`${user.id}_${dStr}`];
      const holiday = isOfficialHoliday(dStr);
      const isHoliday = !!holiday;

      list.push({
        date: dStr,
        dateObj: d,
        dayOfWeek: dOfWeek,
        isSunday: isSun,
        isWorkDay: !isSun && !isHoliday,
        isFuture: false,
        isToday: i === 0,
        isHoliday,
        holidayTitle: holiday?.title,
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

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [listLimit, setListLimit] = useState(14);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {user.name}
            </h1>
            <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
              {user.designation}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(today, "EEEE, MMMM d, yyyy")}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDay(null);
              setIsModalOpen(true);
            }}
            className="h-8 gap-1.5 text-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Edit Past Day</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreMarkOpen(true)}
            className="h-8 gap-1.5 text-xs cursor-pointer"
          >
            <Plane className="w-3.5 h-3.5 text-rose-500" />
            <span>Pre-Mark Leave</span>
          </Button>
        </div>
      </div>

      {/* Hero: Today's 1-Tap Attendance */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Today&apos;s Attendance
              </h2>
              <p className="text-xs text-muted-foreground">
                Tap any option below to log or update your shift for today
              </p>
            </div>

            {todayHoliday ? (
              <Badge variant="amber" className="gap-1 text-xs py-1 px-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Holiday: {todayHoliday.title}
              </Badge>
            ) : todayRecord ? (
              <Badge variant="emerald" className="gap-1 text-xs py-1 px-2.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Logged: {SHIFT_CONFIGS[todayRecord.shiftType].label}
              </Badge>
            ) : isSundayToday ? (
              <Badge variant="secondary" className="text-xs py-1 px-2.5">
                Sunday Off
              </Badge>
            ) : (
              <Badge variant="amber" className="gap-1 text-xs py-1 px-2.5">
                <Clock className="w-3.5 h-3.5" /> Pending
              </Badge>
            )}
          </div>

          {/* 4 Big 1-Tap Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Full Day */}
            <button
              type="button"
              onClick={() => handleQuickMarkToday("full")}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 ${
                todayRecord?.shiftType === "full"
                  ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/30 ring-2 ring-emerald-600/80 shadow-xs"
                  : "border-border bg-card hover:border-foreground/40 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-5 h-5 rounded-[2px] bg-[#2da44e] dark:bg-[#3fb950] border border-black/10 shrink-0" />
                <Badge variant="outline" className="text-[10px] font-mono py-0">
                  8h
                </Badge>
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground flex items-center justify-between">
                  <span>Full Shift</span>
                  {todayRecord?.shiftType === "full" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  10:00 &ndash; 18:00
                </div>
              </div>
            </button>

            {/* Morning Half */}
            <button
              type="button"
              onClick={() => handleQuickMarkToday("half_morning")}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 ${
                todayRecord?.shiftType === "half_morning"
                  ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/30 ring-2 ring-emerald-600/80 shadow-xs"
                  : "border-border bg-card hover:border-foreground/40 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex shrink-0">
                  <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                  <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono py-0">
                  4h
                </Badge>
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground flex items-center justify-between">
                  <span>Morning</span>
                  {todayRecord?.shiftType === "half_morning" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  10:00 &ndash; 14:00
                </div>
              </div>
            </button>

            {/* Afternoon Half */}
            <button
              type="button"
              onClick={() => handleQuickMarkToday("half_afternoon")}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 ${
                todayRecord?.shiftType === "half_afternoon"
                  ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/30 ring-2 ring-emerald-600/80 shadow-xs"
                  : "border-border bg-card hover:border-foreground/40 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex shrink-0">
                  <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                  <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono py-0">
                  4h
                </Badge>
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground flex items-center justify-between">
                  <span>Afternoon</span>
                  {todayRecord?.shiftType === "half_afternoon" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  14:00 &ndash; 18:00
                </div>
              </div>
            </button>

            {/* Leave */}
            <button
              type="button"
              onClick={() => handleQuickMarkToday("leave")}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 ${
                todayRecord?.shiftType === "leave"
                  ? "border-rose-500 bg-rose-500/10 dark:bg-rose-950/30 ring-2 ring-rose-500/80 shadow-xs"
                  : "border-border bg-card hover:border-foreground/40 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-5 h-5 rounded-[2px] border border-zinc-400 dark:border-zinc-600 bg-transparent shrink-0" />
                <Badge variant="destructive" className="text-[10px] font-mono py-0">
                  0h
                </Badge>
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground flex items-center justify-between">
                  <span>Leave</span>
                  {todayRecord?.shiftType === "leave" && <CheckCircle2 className="w-4 h-4 text-rose-500" />}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Not scheduled
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Planned Leaves Alert */}
      {upcomingLeaves.length > 0 && (
        <div className="p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-semibold text-foreground">Upcoming Planned Leaves:</span>
              <span className="text-[11px] text-muted-foreground">(Tap to edit or cancel)</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {upcomingLeaves.map((l) => (
                <span
                  key={l.record.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-foreground text-xs shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleCellClick({
                        date: l.record.date,
                        dateObj: l.dateObj,
                        dayOfWeek: getDay(l.dateObj),
                        isSunday: false,
                        isWorkDay: true,
                        isFuture: true,
                        isToday: false,
                        record: l.record,
                      });
                    }}
                    className="font-medium hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{format(l.dateObj, "EEE, MMM d")}</span>
                    <span className="text-muted-foreground">
                      &bull; {l.record.notes?.replace("Planned Leave: ", "") || "Leave"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Cancel planned leave for ${format(l.dateObj, "MMM d")}?`)) {
                        deleteAttendance(user.id, l.record.date);
                      }
                    }}
                    className="text-muted-foreground hover:text-rose-600 p-0.5 rounded cursor-pointer transition-colors font-bold"
                    title="Cancel leave"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreMarkOpen(true)}
            className="h-7 text-xs text-rose-600 hover:text-rose-700 self-start sm:self-auto shrink-0 cursor-pointer"
          >
            + Add Leave
          </Button>
        </div>
      )}

      {/* Simple Daily Attendance List */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Daily Attendance List
              </CardTitle>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs self-start sm:self-auto">
              <Button
                variant={tableFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("all")}
                className="h-7 px-2.5 text-xs"
              >
                All
              </Button>
              <Button
                variant={tableFilter === "full" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("full")}
                className="h-7 px-2.5 text-xs"
              >
                Full
              </Button>
              <Button
                variant={tableFilter === "half" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("half")}
                className="h-7 px-2.5 text-xs"
              >
                Half
              </Button>
              <Button
                variant={tableFilter === "leave" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("leave")}
                className="h-7 px-2.5 text-xs"
              >
                Leave
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-3">
          <div className="divide-y divide-border/60">
            {recentLogs.slice(0, listLimit).map((day) => {
              const isToday = day.isToday;
              const hasRecord = !!day.record;
              const isFull = day.record?.shiftType === "full";
              const isMorning = day.record?.shiftType === "half_morning";
              const isAfternoon = day.record?.shiftType === "half_afternoon";
              const isLeave = day.record?.shiftType === "leave";

              return (
                <div
                  key={day.date}
                  onClick={() => handleCellClick(day)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                    isToday ? "bg-muted/30 font-medium" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual Box Graphic */}
                    {day.isSunday ? (
                      <div className="w-5 h-5 rounded-[2px] border border-dashed border-zinc-400/50 dark:border-zinc-600/50 shrink-0" />
                    ) : day.isHoliday ? (
                      <div className="w-5 h-5 rounded-[2px] bg-amber-400 dark:bg-amber-500 border border-amber-600/30 flex items-center justify-center shrink-0 shadow-2xs" title={day.holidayTitle}>
                        <Sparkles className="w-3 h-3 text-amber-950" />
                      </div>
                    ) : isFull ? (
                      <div className="w-5 h-5 rounded-[2px] bg-[#2da44e] dark:bg-[#3fb950] border border-black/10 shrink-0" />
                    ) : isMorning ? (
                      <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex shrink-0">
                        <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                        <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                      </div>
                    ) : isAfternoon ? (
                      <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex shrink-0">
                        <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                        <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                      </div>
                    ) : isLeave ? (
                      <div className="w-5 h-5 rounded-[2px] border border-zinc-400 dark:border-zinc-600 bg-transparent shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 bg-muted/40 shrink-0" />
                    )}

                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <span>
                          {isToday
                            ? "Today"
                            : format(day.dateObj, "EEE, MMM d")}
                        </span>
                        {isToday && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                            Today
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {day.isSunday
                          ? "Sunday Off"
                          : day.isHoliday
                          ? `Official Holiday: ${day.holidayTitle || "Holiday Off"}`
                          : day.record?.notes
                          ? day.record.notes
                          : hasRecord
                          ? SHIFT_CONFIGS[day.record!.shiftType].timeRange
                          : "Not recorded"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {day.isSunday ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Off
                      </Badge>
                    ) : day.isHoliday ? (
                      <Badge variant="amber" className="text-[10px] font-medium">
                        Holiday Off
                      </Badge>
                    ) : hasRecord ? (
                      <Badge
                        variant={isLeave ? "destructive" : "emerald"}
                        className="text-[11px] font-mono font-medium"
                      >
                        {SHIFT_CONFIGS[day.record!.shiftType].label}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Tap to log
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* List Expand / Limit Controller */}
          <div className="pt-2 pb-1 flex items-center justify-center border-t border-border/40 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setListLimit(listLimit === 14 ? 30 : 14)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {listLimit === 14 ? "Show Past 30 Days ↓" : "Show Recent 14 Days ↑"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Activity Heatmap */}
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="w-full justify-between h-10 px-4 text-xs font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Activity Heatmap (GitHub Commits Style)
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {showHeatmap ? "Hide ▲" : "Show ▼"}
          </span>
        </Button>

        {showHeatmap && (
          <AttendanceHeatmap
            user={user}
            onSelectDay={handleCellClick}
            weeksCount={24}
            showTitle={true}
            showLegend={true}
            showStats={true}
          />
        )}
      </div>

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        day={selectedDay}
        targetUser={user}
      />

      {/* Pre-Mark Planned Leave Modal */}
      <PreMarkLeaveModal
        isOpen={isPreMarkOpen}
        onClose={() => setIsPreMarkOpen(false)}
        defaultUser={user}
      />
    </div>
  );
}
