"use client";

import React, { useState, useMemo, useEffect } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { AttendanceHeatmap } from "../heatmap/AttendanceHeatmap";
import { MarkAttendanceModal } from "../attendance/MarkAttendanceModal";
import { PreMarkLeaveModal } from "../attendance/PreMarkLeaveModal";
import { useAttendance } from "@/lib/attendance-context";
import { SHIFT_CONFIGS, USER_THEMES } from "@/lib/constants";
import {
  format,
  startOfDay,
  getDay,
  subDays,
  parseISO,
  isBefore,
} from "date-fns";
import { ATTENDANCE_START_DATE } from "@/lib/mock-data";
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
  const theme = user.theme || USER_THEMES[user.id] || USER_THEMES["emp-shan"];
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

  // Selection state for Today's shift (defaults to existing record or full shift)
  const [selectedTodayShift, setSelectedTodayShift] = useState<ShiftType>(
    todayRecord?.shiftType || "full"
  );
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    if (todayRecord?.shiftType) {
      setSelectedTodayShift(todayRecord.shiftType);
    }
  }, [todayRecord?.shiftType]);

  const handleChooseShift = (shiftType: ShiftType) => {
    setSelectedTodayShift(shiftType);
    setIsSavedRecently(false);
  };

  const handleMarkTodayAttendance = () => {
    markAttendance(user.id, todayStr, selectedTodayShift);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const handleCellClick = (day: DayAttendance) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const recentLogs = useMemo(() => {
    const list: DayAttendance[] = [];
    const startDate = parseISO(ATTENDANCE_START_DATE);

    for (let i = 0; i < 30; i++) {
      const d = subDays(today, i);
      if (isBefore(d, startDate)) break;

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
      {/* Top Ambient Pastel Header */}
      <div className={`-mx-4 sm:-mx-6 -mt-6 mb-2 p-5 sm:p-6 rounded-b-3xl bg-gradient-to-b ${theme.pastelWash} to-transparent`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${theme.avatarBg} flex items-center justify-center font-bold text-lg shadow-xs`}>
              {user.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {user.name}
                </h1>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                  {theme.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(today, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDay(null);
                setIsModalOpen(true);
              }}
              className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 cursor-pointer rounded-xl bg-background/90 shadow-2xs hover:bg-background"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Past Day</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreMarkOpen(true)}
              className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 cursor-pointer rounded-xl bg-background/90 shadow-2xs hover:bg-background"
            >
              <Plane className="w-3.5 h-3.5 text-rose-500" />
              <span>Leave</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero: Today's Shift Card - Borderless Pastel Tint */}
      <Card className={`shadow-sm border-0 ${theme.cardTint}`}>
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Today
            </h2>

            {todayHoliday ? (
              <Badge variant="amber" className="gap-1 text-xs py-0.5 px-2">
                <Sparkles className="w-3 h-3 text-amber-500" /> Holiday: {todayHoliday.title}
              </Badge>
            ) : todayRecord ? (
              <Badge
                variant={todayRecord.shiftType === "leave" ? "destructive" : "emerald"}
                className="gap-1 text-xs py-0.5 px-2 font-medium"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>
                  {todayRecord.shiftType === "full"
                    ? "Full Day"
                    : todayRecord.shiftType === "half_morning"
                    ? "Morning"
                    : todayRecord.shiftType === "half_afternoon"
                    ? "Afternoon"
                    : "Leave"}
                </span>
              </Badge>
            ) : isSundayToday ? (
              <Badge variant="secondary" className="text-xs py-0.5 px-2">
                Sunday Off
              </Badge>
            ) : (
              <Badge variant="amber" className="gap-1 text-xs py-0.5 px-2">
                <Clock className="w-3 h-3" /> Pending
              </Badge>
            )}
          </div>

          {/* 4 Shift Choice Cards - Borderless & Elevated */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Full Day */}
            <button
              type="button"
              onClick={() => handleChooseShift("full")}
              className={`p-3 sm:p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 shadow-2xs ${
                selectedTodayShift === "full"
                  ? "bg-emerald-500/15 dark:bg-emerald-950/40 ring-2 ring-emerald-600 shadow-sm"
                  : "bg-background/90 dark:bg-zinc-800/80 hover:bg-background"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded-[3px] bg-[#2da44e] dark:bg-[#3fb950] shrink-0" />
                {selectedTodayShift === "full" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[11px] font-mono text-muted-foreground">8h</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-xs sm:text-sm text-foreground">
                  Full Day
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  10:00 &ndash; 18:00
                </div>
              </div>
            </button>

            {/* Morning Half */}
            <button
              type="button"
              onClick={() => handleChooseShift("half_morning")}
              className={`p-3 sm:p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 shadow-2xs ${
                selectedTodayShift === "half_morning"
                  ? "bg-emerald-500/15 dark:bg-emerald-950/40 ring-2 ring-emerald-600 shadow-sm"
                  : "bg-background/90 dark:bg-zinc-800/80 hover:bg-background"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded-[3px] overflow-hidden relative flex shrink-0 bg-zinc-200 dark:bg-zinc-700">
                  <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                </div>
                {selectedTodayShift === "half_morning" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[11px] font-mono text-muted-foreground">4h</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-xs sm:text-sm text-foreground">
                  Morning
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  10:00 &ndash; 14:00
                </div>
              </div>
            </button>

            {/* Afternoon Half */}
            <button
              type="button"
              onClick={() => handleChooseShift("half_afternoon")}
              className={`p-3 sm:p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 shadow-2xs ${
                selectedTodayShift === "half_afternoon"
                  ? "bg-emerald-500/15 dark:bg-emerald-950/40 ring-2 ring-emerald-600 shadow-sm"
                  : "bg-background/90 dark:bg-zinc-800/80 hover:bg-background"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded-[3px] overflow-hidden relative flex shrink-0 bg-zinc-200 dark:bg-zinc-700">
                  <div className="w-1/2 h-full ml-auto bg-[#2da44e] dark:bg-[#3fb950]" />
                </div>
                {selectedTodayShift === "half_afternoon" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[11px] font-mono text-muted-foreground">4h</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-xs sm:text-sm text-foreground">
                  Afternoon
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  14:00 &ndash; 18:00
                </div>
              </div>
            </button>

            {/* Leave */}
            <button
              type="button"
              onClick={() => handleChooseShift("leave")}
              className={`p-3 sm:p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 shadow-2xs ${
                selectedTodayShift === "leave"
                  ? "bg-rose-500/15 dark:bg-rose-950/40 ring-2 ring-rose-500 shadow-sm"
                  : "bg-background/90 dark:bg-zinc-800/80 hover:bg-background"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded-[3px] bg-rose-200 dark:bg-rose-900/50 shrink-0" />
                {selectedTodayShift === "leave" ? (
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <span className="text-[11px] font-mono text-muted-foreground">0h</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-xs sm:text-sm text-foreground">
                  Leave
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Off Duty
                </div>
              </div>
            </button>
          </div>

          {/* Action Footer: Sleek Full-Width Black Save Button (borderless) */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleMarkTodayAttendance}
              className={`w-full h-11 font-medium text-xs sm:text-sm rounded-xl gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] border-0 ${
                isSavedRecently
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-black hover:bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isSavedRecently ? "text-white" : "text-emerald-400"}`} />
              <span>{isSavedRecently ? "Attendance Saved!" : "Mark Attendance"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Planned Leaves Alert */}
      {upcomingLeaves.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Plane className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Upcoming Leaves</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {upcomingLeaves.map((l) => (
                <span
                  key={l.record.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/90 text-foreground text-xs shadow-2xs"
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

      {/* Simple Daily Attendance List - Borderless Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Daily Attendance List
              </CardTitle>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs self-start sm:self-auto">
              <Button
                variant={tableFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("all")}
                className="h-7 px-2.5 text-xs rounded-lg shadow-none"
              >
                All
              </Button>
              <Button
                variant={tableFilter === "full" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("full")}
                className="h-7 px-2.5 text-xs rounded-lg shadow-none"
              >
                Full
              </Button>
              <Button
                variant={tableFilter === "half" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("half")}
                className="h-7 px-2.5 text-xs rounded-lg shadow-none"
              >
                Half
              </Button>
              <Button
                variant={tableFilter === "leave" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("leave")}
                className="h-7 px-2.5 text-xs rounded-lg shadow-none"
              >
                Leave
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-3">
          <div className="space-y-1">
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
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer hover:bg-muted/40 ${
                    isToday ? "bg-muted/30 font-medium" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual Box Graphic */}
                    {day.isSunday ? (
                      <div className="w-5 h-5 rounded-[3px] bg-muted/50 shrink-0" />
                    ) : day.isHoliday ? (
                      <div className="w-5 h-5 rounded-[3px] bg-amber-400 dark:bg-amber-500 flex items-center justify-center shrink-0 shadow-2xs" title={day.holidayTitle}>
                        <Sparkles className="w-3 h-3 text-amber-950" />
                      </div>
                    ) : isFull ? (
                      <div className="w-5 h-5 rounded-[3px] bg-[#2da44e] dark:bg-[#3fb950] shrink-0" />
                    ) : isMorning ? (
                      <div className="w-5 h-5 rounded-[3px] overflow-hidden relative flex shrink-0 bg-zinc-200 dark:bg-zinc-700">
                        <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                      </div>
                    ) : isAfternoon ? (
                      <div className="w-5 h-5 rounded-[3px] overflow-hidden relative flex shrink-0 bg-zinc-200 dark:bg-zinc-700">
                        <div className="w-1/2 h-full ml-auto bg-[#2da44e] dark:bg-[#3fb950]" />
                      </div>
                    ) : isLeave ? (
                      <div className="w-5 h-5 rounded-[3px] bg-rose-200 dark:bg-rose-900/50 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-[3px] bg-muted/60 shrink-0" />
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
                      <Badge variant="secondary" className="text-[10px] text-muted-foreground">
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
                      <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                        Tap to log
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* List Expand / Limit Controller */}
          <div className="pt-2 pb-1 flex items-center justify-center mt-1">
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
          variant="ghost"
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="w-full justify-between h-10 px-4 text-xs font-medium cursor-pointer bg-card shadow-2xs rounded-xl hover:bg-muted/40"
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
