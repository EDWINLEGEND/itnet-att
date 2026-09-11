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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Clock,
  Calendar,
  History,
  Plane,
  Plus,
} from "lucide-react";

interface EmployeeDashboardProps {
  user: User;
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const { records, markAttendance, getUpcomingLeaves, deleteAttendance } = useAttendance();
  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreMarkOpen, setIsPreMarkOpen] = useState(false);
  const [tableFilter, setTableFilter] = useState<string>("all");

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);
  const dayOfWeek = getDay(today);
  const isSundayToday = dayOfWeek === 0;

  const todayRecord = records[`${user.id}_${todayStr}`];

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
      {/* Top Banner: Enterprise Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Employee Profile Information */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {user.name}
                </h1>
                <Badge variant="outline" className="font-normal text-muted-foreground text-xs">
                  {user.designation}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(today, "EEEE, MMMM d, yyyy")}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDay(null);
                    setIsModalOpen(true);
                  }}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Edit Past Day</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreMarkOpen(true)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Plane className="w-3.5 h-3.5 text-rose-500" />
                  <span>Pre-Mark Planned Leave</span>
                </Button>
              </div>
            </div>

            {/* Today's Punch Card */}
            <div className="lg:col-span-5 p-4 rounded-lg border border-border/80 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Today
                </span>
                {todayRecord ? (
                  <Badge variant="emerald" className="gap-1 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Logged
                  </Badge>
                ) : isSundayToday ? (
                  <Badge variant="secondary" className="text-[11px]">
                    Sunday Off
                  </Badge>
                ) : (
                  <Badge variant="amber" className="gap-1 text-[11px]">
                    <Clock className="w-3 h-3" /> Pending
                  </Badge>
                )}
              </div>

              {todayRecord && (
                <div className="flex items-center gap-3 p-2.5 rounded-md bg-background border border-border">
                  {todayRecord.shiftType === "full" && (
                    <div className="w-6 h-6 rounded-[2px] bg-[#2da44e] dark:bg-[#3fb950] border border-black/10 shrink-0" />
                  )}
                  {todayRecord.shiftType === "half_morning" && (
                    <div className="w-6 h-6 rounded-[2px] border border-zinc-400 dark:border-zinc-600 overflow-hidden relative flex shrink-0">
                      <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                      <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                  )}
                  {todayRecord.shiftType === "half_afternoon" && (
                    <div className="w-6 h-6 rounded-[2px] border border-zinc-400 dark:border-zinc-600 overflow-hidden relative flex shrink-0">
                      <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                      <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                    </div>
                  )}
                  {todayRecord.shiftType === "leave" && (
                    <div className="w-6 h-6 rounded-[2px] border border-zinc-400 dark:border-zinc-600 bg-transparent shrink-0" />
                  )}

                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      {SHIFT_CONFIGS[todayRecord.shiftType].label}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {SHIFT_CONFIGS[todayRecord.shiftType].timeRange}
                    </div>
                  </div>
                </div>
              )}

              {/* Punch Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                <Button
                  variant={todayRecord?.shiftType === "full" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickMarkToday("full")}
                  className="h-auto py-2 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-xs">Full</span>
                  <span className="text-[10px] text-muted-foreground font-mono">10&ndash;18 (8h)</span>
                </Button>

                <Button
                  variant={todayRecord?.shiftType === "half_morning" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickMarkToday("half_morning")}
                  className="h-auto py-2 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-xs">Morning</span>
                  <span className="text-[10px] text-muted-foreground font-mono">10&ndash;14 (4h)</span>
                </Button>

                <Button
                  variant={todayRecord?.shiftType === "half_afternoon" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickMarkToday("half_afternoon")}
                  className="h-auto py-2 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-xs">Afternoon</span>
                  <span className="text-[10px] text-muted-foreground font-mono">14&ndash;18 (4h)</span>
                </Button>

                <Button
                  variant={todayRecord?.shiftType === "leave" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleQuickMarkToday("leave")}
                  className="h-auto py-2 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-xs">Leave</span>
                  <span className="text-[10px] text-muted-foreground font-mono">0h</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Planned Leaves Alert - Interactive chips to edit or cancel */}
      {upcomingLeaves.length > 0 && (
        <div className="p-3.5 rounded-lg border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-semibold text-foreground">Planned Upcoming Leaves:</span>
              <span className="text-[11px] text-muted-foreground">(Click to change shift or cancel)</span>
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
                    title="Click to modify shift or reason"
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
                    className="text-muted-foreground hover:text-rose-600 p-0.5 rounded cursor-pointer transition-colors"
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
            className="h-7 text-xs text-rose-600 hover:text-rose-700 self-start sm:self-auto shrink-0"
          >
            + Add Planned Leave
          </Button>
        </div>
      )}

      {/* Primary GitHub Commits Heatmap */}
      <AttendanceHeatmap
        user={user}
        onSelectDay={handleCellClick}
        weeksCount={24}
        showTitle={true}
        showLegend={true}
        showStats={true}
      />

      {/* Recent History Table */}
      <Card className="border-border">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Recent Attendance Log (Past 30 Days)
              </CardTitle>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs self-start sm:self-auto">
              <Button
                variant={tableFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("all")}
                className="h-7 text-xs"
              >
                All
              </Button>
              <Button
                variant={tableFilter === "full" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("full")}
                className="h-7 text-xs"
              >
                Full
              </Button>
              <Button
                variant={tableFilter === "half" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("half")}
                className="h-7 text-xs"
              >
                Half
              </Button>
              <Button
                variant={tableFilter === "leave" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTableFilter("leave")}
                className="h-7 text-xs"
              >
                Leaves
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Box</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((day) => {
                const shiftType = day.record?.shiftType;
                const config = shiftType ? SHIFT_CONFIGS[shiftType] : null;

                return (
                  <TableRow key={day.date}>
                    <TableCell className="pl-6 font-medium text-foreground whitespace-nowrap">
                      {format(day.dateObj, "MMM dd, yyyy")}
                      {day.isToday && (
                        <Badge variant="outline" className="ml-2 text-[10px] text-blue-500 border-blue-500/30">
                          Today
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(day.dateObj, "EEEE")}
                    </TableCell>

                    <TableCell>
                      {day.isSunday ? (
                        <div className="w-4 h-4 rounded-[2px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                      ) : shiftType === "full" ? (
                        <div className="w-4 h-4 rounded-[2px] bg-[#2da44e] dark:bg-[#3fb950] border border-black/10" />
                      ) : shiftType === "half_morning" ? (
                        <div className="w-4 h-4 rounded-[2px] border border-zinc-400 dark:border-zinc-600 overflow-hidden relative flex">
                          <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                          <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                      ) : shiftType === "half_afternoon" ? (
                        <div className="w-4 h-4 rounded-[2px] border border-zinc-400 dark:border-zinc-600 overflow-hidden relative flex">
                          <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                          <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-[2px] border border-zinc-400 dark:border-zinc-600 bg-transparent" />
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {day.isSunday ? (
                        <span className="text-muted-foreground">Sunday Off</span>
                      ) : config ? (
                        <Badge
                          variant={
                            config.type === "full"
                              ? "emerald"
                              : config.type === "leave"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {config.shortLabel}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">On Leave</Badge>
                      )}
                    </TableCell>

                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {day.isSunday ? "\u2013" : config ? config.timeRange : "0h"}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-xs max-w-[180px] truncate">
                      {day.record?.notes || <span className="text-muted-foreground/50">&ndash;</span>}
                    </TableCell>

                    <TableCell className="text-right pr-6 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCellClick(day)}
                        className="h-7 px-2 text-xs"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
