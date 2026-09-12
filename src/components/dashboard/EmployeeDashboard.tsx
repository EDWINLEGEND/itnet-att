"use client";

import React, { useState, useMemo, useEffect } from "react";
import { User, DayAttendance, ShiftType, WorkLocation } from "@/types/attendance";
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
  addWeeks,
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
  Building2,
  Laptop,
  Users,
} from "lucide-react";

interface EmployeeDashboardProps {
  user: User;
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const theme = user.theme || USER_THEMES[user.id] || USER_THEMES["emp-shan"];
  const {
    records,
    markAttendance,
    getUpcomingLeaves,
    deleteAttendance,
    isOfficialHoliday,
    getTeamStatusForDate,
    getTeamWeekStatus,
  } = useAttendance();
  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreMarkOpen, setIsPreMarkOpen] = useState(false);
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [activeViewTab, setActiveViewTab] = useState<"this_week" | "next_week" | "history">("this_week");

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
  const [todayWorkLocation, setTodayWorkLocation] = useState<WorkLocation>(
    todayRecord?.workLocation || "office"
  );
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    if (todayRecord?.shiftType) {
      setSelectedTodayShift(todayRecord.shiftType);
    }
    if (todayRecord?.workLocation) {
      setTodayWorkLocation(todayRecord.workLocation);
    }
  }, [todayRecord?.shiftType, todayRecord?.workLocation]);

  const handleChooseShift = (shiftType: ShiftType) => {
    setSelectedTodayShift(shiftType);
    setIsSavedRecently(false);
  };

  const handleMarkTodayAttendance = () => {
    markAttendance(
      user.id,
      todayStr,
      selectedTodayShift,
      undefined,
      selectedTodayShift === "leave" ? undefined : todayWorkLocation
    );
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const teamTodayPresence = useMemo(() => {
    return getTeamStatusForDate(todayStr);
  }, [getTeamStatusForDate, todayStr]);

  const teamWeekDays = useMemo(() => {
    if (activeViewTab === "next_week") {
      return getTeamWeekStatus(addWeeks(today, 1));
    }
    return getTeamWeekStatus(today);
  }, [getTeamWeekStatus, activeViewTab, today]);

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
      {/* Top Ambient Pastel Header Card */}
      <div className={`p-4 sm:p-6 rounded-3xl ${theme.headerBg} shadow-xs mb-4 transition-colors`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${theme.avatarBg} flex items-center justify-center font-black text-lg sm:text-xl shadow-xs shrink-0`}>
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-black tracking-tight truncate">
                {user.name}
              </h1>
              <p className="text-xs font-medium opacity-80 mt-0.5">
                {format(today, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDay(null);
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-none h-8 px-3 text-xs gap-1.5 cursor-pointer rounded-xl bg-white/80 dark:bg-black/40 shadow-2xs hover:bg-white dark:hover:bg-black/60 font-semibold"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Past Day</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreMarkOpen(true)}
              className="flex-1 sm:flex-none h-8 px-3 text-xs gap-1.5 cursor-pointer rounded-xl bg-white/80 dark:bg-black/40 shadow-2xs hover:bg-white dark:hover:bg-black/60 font-semibold"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>Plan Ahead</span>
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
                  {todayRecord.shiftType !== "leave" && (
                    <> &bull; {todayRecord.workLocation === "remote" ? "💻 Online" : "🏢 Office"}</>
                  )}
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

          {/* Work Location Mode Selector: In-Office vs Online (WFH) */}
          {selectedTodayShift !== "leave" && (
            <div className="flex items-center justify-between p-1 bg-background/80 dark:bg-zinc-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setTodayWorkLocation("office");
                  setIsSavedRecently(false);
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  todayWorkLocation === "office"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>🏢 In-Office</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTodayWorkLocation("remote");
                  setIsSavedRecently(false);
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  todayWorkLocation === "remote"
                    ? "bg-cyan-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>💻 Online (WFH)</span>
              </button>
            </div>
          )}

          {/* 4 Shift Choice Cards - Borderless & Elevated */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {/* Full Day */}
            <button
              type="button"
              onClick={() => handleChooseShift("full")}
              className={`p-2.5 sm:p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 sm:gap-3 shadow-2xs ${
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
                <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                  10:00 &ndash; 18:00
                </div>
              </div>
            </button>

            {/* Morning Half */}
            <button
              type="button"
              onClick={() => handleChooseShift("half_morning")}
              className={`p-2.5 sm:p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 sm:gap-3 shadow-2xs ${
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
                <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                  10:00 &ndash; 14:00
                </div>
              </div>
            </button>

            {/* Afternoon Half */}
            <button
              type="button"
              onClick={() => handleChooseShift("half_afternoon")}
              className={`p-2.5 sm:p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 sm:gap-3 shadow-2xs ${
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
                <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                  14:00 &ndash; 18:00
                </div>
              </div>
            </button>

            {/* Leave */}
            <button
              type="button"
              onClick={() => handleChooseShift("leave")}
              className={`p-2.5 sm:p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 sm:gap-3 shadow-2xs ${
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
                <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
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

      {/* Compact Team Today Presence Strip */}
      <Card className="border-0 shadow-xs bg-muted/40">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Team Presence Today</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {format(today, "EEE, MMM d")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {teamTodayPresence.map((member) => {
              const isSelf = member.user.id === user.id;
              const isRemote = member.workLocation === "remote";
              const isOffice = member.workLocation === "office";
              const isLeave = member.isLeave;

              return (
                <div
                  key={member.user.id}
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                    isSelf
                      ? "bg-background shadow-xs ring-1 ring-emerald-500/40"
                      : "bg-background/80 shadow-2xs"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl ${
                      member.user.theme?.avatarBg || "bg-muted"
                    } flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}
                  >
                    {member.user.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground text-xs truncate flex items-center gap-1">
                      <span>{member.user.name}</span>
                      {isSelf && <span className="text-[9px] text-muted-foreground">(You)</span>}
                    </div>
                    <div className="text-[10px] truncate text-muted-foreground">
                      {isLeave ? (
                        <span className="text-rose-500 font-medium">🏖️ Leave</span>
                      ) : isRemote ? (
                        <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                          💻 Online ({member.shiftType === "full" ? "8h" : "4h"})
                        </span>
                      ) : isOffice ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          🏢 Office ({member.shiftType === "full" ? "8h" : "4h"})
                        </span>
                      ) : member.isSunday ? (
                        <span>Sunday Off</span>
                      ) : member.isHoliday ? (
                        <span className="text-amber-600">Holiday Off</span>
                      ) : (
                        <span className="italic text-muted-foreground/70">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Team Schedule & Daily Attendance Records */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* View Switcher: Team This Week vs Team Next Week vs My History */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl text-xs self-start sm:self-auto flex-wrap">
              <Button
                variant={activeViewTab === "this_week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveViewTab("this_week")}
                className={`h-7 px-3 text-xs rounded-xl shadow-none font-semibold cursor-pointer ${
                  activeViewTab === "this_week"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>Team This Week</span>
              </Button>

              <Button
                variant={activeViewTab === "next_week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveViewTab("next_week")}
                className={`h-7 px-3 text-xs rounded-xl shadow-none font-semibold cursor-pointer ${
                  activeViewTab === "next_week"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                <span>Team Next Week</span>
              </Button>

              <Button
                variant={activeViewTab === "history" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveViewTab("history")}
                className={`h-7 px-3 text-xs rounded-xl shadow-none font-semibold cursor-pointer ${
                  activeViewTab === "history"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <span>My History</span>
              </Button>
            </div>

            {/* Quick Filter Pills for History Tab */}
            {activeViewTab === "history" && (
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs self-start sm:self-auto">
                <Button
                  variant={tableFilter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTableFilter("all")}
                  className="h-7 px-2.5 text-xs rounded-lg shadow-none cursor-pointer"
                >
                  All
                </Button>
                <Button
                  variant={tableFilter === "full" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTableFilter("full")}
                  className="h-7 px-2.5 text-xs rounded-lg shadow-none cursor-pointer"
                >
                  Full
                </Button>
                <Button
                  variant={tableFilter === "half" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTableFilter("half")}
                  className="h-7 px-2.5 text-xs rounded-lg shadow-none cursor-pointer"
                >
                  Half
                </Button>
                <Button
                  variant={tableFilter === "leave" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTableFilter("leave")}
                  className="h-7 px-2.5 text-xs rounded-lg shadow-none cursor-pointer"
                >
                  Leave
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          {activeViewTab !== "history" ? (
            /* Team Week Schedule (Mon to Sat) */
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
                <span>
                  {activeViewTab === "next_week"
                    ? "Upcoming schedule & work locations for next week"
                    : "Who is working online vs in-office this week"}
                </span>
                <span className="text-[11px] font-mono">
                  {activeViewTab === "next_week" ? "Next Mon – Sat" : "Mon – Sat"}
                </span>
              </div>

              {teamWeekDays.map((day) => {
                return (
                  <div
                    key={day.date}
                    className={`p-3 rounded-2xl transition-all ${
                      day.isToday
                        ? "bg-muted/50 ring-1 ring-emerald-500/40 shadow-xs"
                        : "bg-muted/20 hover:bg-muted/35"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-foreground">
                          {day.dayName}, {day.formattedDate}
                        </span>
                        {day.isToday && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                            Today
                          </Badge>
                        )}
                        {day.isHoliday && (
                          <Badge variant="amber" className="text-[10px] py-0 px-1.5">
                            {day.holidayTitle || "Holiday Off"}
                          </Badge>
                        )}
                      </div>

                      {/* 4 Teammates for this day */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full sm:w-auto">
                        {day.members.map((member) => {
                          const isSelf = member.user.id === user.id;
                          const isRemote = member.workLocation === "remote";
                          const isOffice = member.workLocation === "office";
                          const isLeave = member.isLeave;

                          return (
                            <div
                              key={member.user.id}
                              className={`flex items-center gap-1.5 p-1.5 px-2 rounded-xl text-xs transition-colors ${
                                isSelf
                                  ? "bg-background shadow-2xs font-semibold ring-1 ring-emerald-500/30"
                                  : "bg-background/80"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md ${
                                  member.user.theme?.avatarBg || "bg-muted"
                                } flex items-center justify-center text-[10px] font-bold shrink-0`}
                              >
                                {member.user.initials}
                              </div>
                              <span className="text-[11px] text-foreground truncate max-w-[50px] xs:max-w-[70px]">
                                {member.user.name}
                              </span>
                              <span className="text-[10px] ml-auto shrink-0">
                                {isLeave ? (
                                  <span className="text-rose-500 font-medium">🏖️ Leave</span>
                                ) : isRemote ? (
                                  <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                                    💻 {member.shiftType === "full" ? "Online" : "Morn"}
                                  </span>
                                ) : isOffice ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    🏢 {member.shiftType === "full" ? "Office" : "Morn"}
                                  </span>
                                ) : member.isHoliday ? (
                                  <span className="text-amber-600">Holiday</span>
                                ) : (
                                  <span className="text-muted-foreground/70 font-mono text-[10px]" title="Not Assigned">
                                    NA
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* My History List */
            <div className="space-y-1">
              {recentLogs.slice(0, listLimit).map((day) => {
                const isToday = day.isToday;
                const hasRecord = !!day.record;
                const isFull = day.record?.shiftType === "full";
                const isMorning = day.record?.shiftType === "half_morning";
                const isAfternoon = day.record?.shiftType === "half_afternoon";
                const isLeave = day.record?.shiftType === "leave";
                const isRemote = day.record?.workLocation === "remote";

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
                      {hasRecord && !isLeave && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isRemote
                              ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          {isRemote ? "💻 Online" : "🏢 Office"}
                        </span>
                      )}

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
          )}

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
            weeksCount={8}
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
