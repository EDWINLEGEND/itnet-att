"use client";

import React, { useState, useMemo } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { AttendanceHeatmap } from "../heatmap/AttendanceHeatmap";
import { MarkAttendanceModal } from "../attendance/MarkAttendanceModal";
import { PreMarkLeaveModal } from "../attendance/PreMarkLeaveModal";
import { OfficialHolidaysModal } from "../admin/OfficialHolidaysModal";
import { useAttendance } from "@/lib/attendance-context";
import { SHIFT_CONFIGS, USER_THEMES } from "@/lib/constants";
import { format, startOfDay, getDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  ShieldCheck,
  FileSpreadsheet,
  TrendingUp,
  Calendar,
  Plane,
  Sparkles,
  Edit3,
} from "lucide-react";

interface AdminDashboardProps {
  adminUser: User;
}

export function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const { users, records, markAttendance, calculateUserStats, getUpcomingLeaves, deleteAttendance, isOfficialHoliday } = useAttendance();

  const employees = useMemo(() => users.filter((u) => u.role === "employee"), [users]);

  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);
  const [selectedTargetUser, setSelectedTargetUser] = useState<User>(employees[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreMarkOpen, setIsPreMarkOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [heatmapRange, setHeatmapRange] = useState<number>(20);

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  const todayOverview = useMemo(() => {
    let full = 0;
    let morning = 0;
    let afternoon = 0;
    let leave = 0;

    employees.forEach((emp) => {
      const rec = records[`${emp.id}_${todayStr}`];
      if (rec) {
        if (rec.shiftType === "full") full++;
        else if (rec.shiftType === "half_morning") morning++;
        else if (rec.shiftType === "half_afternoon") afternoon++;
        else if (rec.shiftType === "leave") leave++;
      } else {
        leave++;
      }
    });

    return { full, morning, afternoon, leave, total: employees.length };
  }, [employees, records, todayStr]);

  const employeeStats = useMemo(() => {
    return employees.map((emp) => {
      const stats = calculateUserStats(emp.id, 90);
      const todayRec = records[`${emp.id}_${todayStr}`];
      return {
        user: emp,
        stats,
        todayRec,
      };
    });
  }, [employees, calculateUserStats, records, todayStr]);

  const companyAverageAttendance = useMemo(() => {
    if (employeeStats.length === 0) return 0;
    const sum = employeeStats.reduce((acc, curr) => acc + curr.stats.attendancePercentage, 0);
    return Math.round((sum / employeeStats.length) * 10) / 10;
  }, [employeeStats]);

  const handleCellClick = (emp: User, day: DayAttendance) => {
    setSelectedTargetUser(emp);
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    let csv = "Employee Name,Email,Designation,Attendance %,Full Shifts (8h),Morning Halves (4h),Afternoon Halves (4h),Leaves Taken,Total Hours Worked\n";
    employeeStats.forEach(({ user, stats }) => {
      csv += `"${user.name}","${user.email}","${user.designation}",${stats.attendancePercentage}%,${stats.fullDaysCount},${stats.halfMorningCount},${stats.halfAfternoonCount},${stats.leaveDaysCount},${stats.totalHoursWorked} hrs\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ITNETAI_Attendance_Report_${format(today, "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedEmployees = useMemo(() => {
    if (activeTab === "all") return employees;
    return employees.filter((e) => e.id === activeTab);
  }, [activeTab, employees]);

  const allUpcomingLeaves = useMemo(() => getUpcomingLeaves(14), [getUpcomingLeaves]);

  return (
    <div className="space-y-6">
      {/* Executive Header Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="emerald" className="gap-1 font-mono text-[10px]">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Attendance Management
              </h1>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHolidayModalOpen(true)}
                className="gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 shadow-2xs rounded-xl cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Official Holidays</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDay(null);
                  setIsModalOpen(true);
                }}
                className="gap-1.5 bg-muted/50 hover:bg-muted/80 shadow-2xs rounded-xl cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Edit Past Day</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreMarkOpen(true)}
                className="gap-1.5 bg-muted/50 hover:bg-muted/80 shadow-2xs rounded-xl cursor-pointer"
              >
                <Plane className="w-4 h-4 text-rose-500" />
                <span>Pre-Mark Leave</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2 bg-muted/50 hover:bg-muted/80 shadow-2xs rounded-xl cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Today's Official Holiday Banner (if declared) */}
          {isOfficialHoliday(todayStr) && (
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Today is an Official Holiday: {isOfficialHoliday(todayStr)?.title}</span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">(Company-wide holiday for all employees)</span>
              </div>
              <Badge variant="amber" className="text-[10px]">Holiday Off</Badge>
            </div>
          )}

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-2">
            <div className="p-3.5 rounded-2xl bg-muted/30 shadow-2xs">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Avg Rate</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {companyAverageAttendance}%
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Team 90-day average</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/30 shadow-2xs">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Full Day</span>
                <span className="w-2 h-2 rounded-[1.5px] bg-[#2da44e] dark:bg-[#3fb950]" />
              </div>
              <div className="text-2xl font-bold font-mono text-foreground mt-1">
                {todayOverview.full} / {todayOverview.total}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">8h &bull; Standard shift</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/30 shadow-2xs">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Half Shifts</span>
                <span className="w-2 h-2 rounded-[1.5px] bg-[#2da44e] dark:bg-[#3fb950]" />
              </div>
              <div className="text-2xl font-bold font-mono text-foreground mt-1">
                {todayOverview.morning + todayOverview.afternoon}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {todayOverview.morning} morning &bull; {todayOverview.afternoon} afternoon
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/30 shadow-2xs">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>On Leave</span>
                <span className="w-2 h-2 rounded-[1.5px] bg-rose-200 dark:bg-rose-900/50" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-500 mt-1">
                {todayOverview.leave}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">0h scheduled</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Team Attendance (1-Tap Quick Action List) */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-semibold">
                Today&apos;s Team Attendance &mdash; 1-Tap Quick Action
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Tap any option to update attendance for today instantly
              </p>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              {format(today, "EEE, MMM d")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-3">
          <div className="space-y-1.5">
            {employees.map((emp) => {
              const rec = records[`${emp.id}_${todayStr}`];
              const shift = rec?.shiftType;
              const empTheme = emp.theme || USER_THEMES[emp.id] || USER_THEMES["emp-shan"];

              return (
                <div
                  key={emp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl ${empTheme.avatarBg} flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}>
                      {emp.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <span>{emp.name}</span>
                        {shift ? (
                          <Badge
                            variant={shift === "leave" ? "destructive" : "emerald"}
                            className="text-[10px] font-mono py-0"
                          >
                            {SHIFT_CONFIGS[shift].label}
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px] font-mono py-0">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 Quick 1-Tap Buttons for Admin */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-1.5 self-stretch sm:self-auto">
                    <Button
                      variant={shift === "full" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => markAttendance(emp.id, todayStr, "full")}
                      className={`h-8 px-1.5 sm:px-2.5 text-[11px] sm:text-xs cursor-pointer font-medium rounded-xl shadow-2xs ${
                        shift === "full" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-muted/40 hover:bg-muted/70"
                      }`}
                    >
                      Full
                    </Button>
                    <Button
                      variant={shift === "half_morning" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => markAttendance(emp.id, todayStr, "half_morning")}
                      className={`h-8 px-1.5 sm:px-2.5 text-[11px] sm:text-xs cursor-pointer font-medium rounded-xl shadow-2xs ${
                        shift === "half_morning" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-muted/40 hover:bg-muted/70"
                      }`}
                    >
                      <span className="hidden xs:inline">Morning</span>
                      <span className="xs:hidden">Morn</span>
                    </Button>
                    <Button
                      variant={shift === "half_afternoon" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => markAttendance(emp.id, todayStr, "half_afternoon")}
                      className={`h-8 px-1.5 sm:px-2.5 text-[11px] sm:text-xs cursor-pointer font-medium rounded-xl shadow-2xs ${
                        shift === "half_afternoon" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-muted/40 hover:bg-muted/70"
                      }`}
                    >
                      <span className="hidden xs:inline">Afternoon</span>
                      <span className="xs:hidden">Aft</span>
                    </Button>
                    <Button
                      variant={shift === "leave" ? "destructive" : "ghost"}
                      size="sm"
                      onClick={() => markAttendance(emp.id, todayStr, "leave")}
                      className={`h-8 px-1.5 sm:px-2.5 text-[11px] sm:text-xs cursor-pointer font-medium rounded-xl shadow-2xs ${
                        shift === "leave" ? "" : "bg-muted/40 hover:bg-muted/70"
                      }`}
                    >
                      Leave
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Upcoming Planned Leaves Banner */}
      {allUpcomingLeaves.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold text-foreground">Upcoming Planned Leaves:</span>
              <span className="text-[11px] text-muted-foreground">(Click to change or cancel)</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {allUpcomingLeaves.map((l) => (
                <span
                  key={l.record.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/90 text-foreground text-xs shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleCellClick(l.user, {
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
                    title="Click to edit shift or change leave"
                  >
                    <span className="font-semibold">{l.user.name}</span>
                    <span>&bull; {format(l.dateObj, "EEE, MMM d")}</span>
                    <span className="text-muted-foreground">
                      ({l.record.notes?.replace("Planned Leave: ", "") || "Leave"})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Cancel ${l.user.name}'s planned leave on ${format(l.dateObj, "MMM d")}?`)) {
                        deleteAttendance(l.user.id, l.record.date);
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
            + Pre-Mark Leave
          </Button>
        </div>
      )}

      {/* Team Roster Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Team Roster & 90-Day Analytics
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground font-mono">4 Members</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40">
                <TableHead className="pl-6">Employee</TableHead>
                <TableHead>Today&apos;s Status</TableHead>
                <TableHead>Attendance Rate</TableHead>
                <TableHead>Full Shifts</TableHead>
                <TableHead>Morning</TableHead>
                <TableHead>Afternoon</TableHead>
                <TableHead>Leaves</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead className="text-right pr-6">Quick Log</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeStats.map(({ user, stats, todayRec }) => {
                const config = todayRec ? SHIFT_CONFIGS[todayRec.shiftType] : null;
                const empTheme = user.theme || USER_THEMES[user.id] || USER_THEMES["emp-shan"];

                return (
                  <TableRow key={user.id} className="border-border/30">
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-7 w-7 rounded-lg ${empTheme.avatarBg} flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs`}>
                          {user.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                            <span>{user.name}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${empTheme.badge}`}>
                              {empTheme.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {config ? (
                        <div className="flex items-center gap-2">
                          {config.type === "full" && (
                            <div className="w-3.5 h-3.5 rounded-[2px] bg-[#2da44e] dark:bg-[#3fb950]" />
                          )}
                          {config.type === "half_morning" && (
                            <div className="w-3.5 h-3.5 rounded-[2px] overflow-hidden flex bg-zinc-200 dark:bg-zinc-700">
                              <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                            </div>
                          )}
                          {config.type === "half_afternoon" && (
                            <div className="w-3.5 h-3.5 rounded-[2px] overflow-hidden flex bg-zinc-200 dark:bg-zinc-700">
                              <div className="w-1/2 h-full ml-auto bg-[#2da44e] dark:bg-[#3fb950]" />
                            </div>
                          )}
                          {config.type === "leave" && (
                            <div className="w-3.5 h-3.5 rounded-[2px] bg-rose-200 dark:bg-rose-900/50" />
                          )}
                          <Badge
                            variant={
                              config.type === "full"
                                ? "emerald"
                                : config.type === "leave"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {config.shortLabel}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not marked</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 dark:bg-emerald-400 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, stats.attendancePercentage)}%` }}
                          />
                        </div>
                        <span className="font-bold text-foreground font-mono text-xs">
                          {stats.attendancePercentage}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs">{stats.fullDaysCount}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {stats.halfMorningCount}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {stats.halfAfternoonCount}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-rose-500">
                      {stats.leaveDaysCount}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {stats.totalHoursWorked}h
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const todayItem: DayAttendance = {
                            date: todayStr,
                            dateObj: today,
                            dayOfWeek: getDay(today),
                            isSunday: getDay(today) === 0,
                            isWorkDay: getDay(today) !== 0,
                            isFuture: false,
                            isToday: true,
                            record: todayRec,
                          };
                          handleCellClick(user, todayItem);
                        }}
                        className="h-7 px-2 text-xs rounded-lg hover:bg-muted/70"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        <span>Log</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* GitHub Commits Heatmaps with clean segmented tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Employee Grids</span>
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs self-start sm:self-auto overflow-x-auto max-w-full">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className={`h-7 text-xs rounded-lg shadow-none ${activeTab === "all" ? "bg-background text-foreground shadow-2xs font-semibold" : ""}`}
            >
              All (4 Members)
            </Button>
            {employees.map((emp) => {
              const empTheme = emp.theme || USER_THEMES[emp.id];
              const isSelected = activeTab === emp.id;
              return (
                <Button
                  key={emp.id}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(emp.id)}
                  className={`h-7 text-xs rounded-lg shadow-none transition-colors ${
                    isSelected
                      ? empTheme?.activeTab || "bg-background text-foreground shadow-2xs font-semibold"
                      : ""
                  }`}
                >
                  {emp.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stacked / Filtered Heatmaps */}
        <div className="space-y-4">
          {displayedEmployees.map((emp) => (
            <AttendanceHeatmap
              key={emp.id}
              user={emp}
              onSelectDay={(day) => handleCellClick(emp, day)}
              weeksCount={heatmapRange}
              showTitle={true}
              showLegend={true}
              showStats={true}
            />
          ))}
        </div>
      </div>

      {/* Mark / Override Attendance Modal */}
      <MarkAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        day={selectedDay}
        targetUser={selectedTargetUser}
      />

      {/* Pre-Mark Planned Leave Modal */}
      <PreMarkLeaveModal
        isOpen={isPreMarkOpen}
        onClose={() => setIsPreMarkOpen(false)}
        defaultUser={selectedTargetUser}
      />

      {/* Official Holidays Modal */}
      <OfficialHolidaysModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
      />
    </div>
  );
}
