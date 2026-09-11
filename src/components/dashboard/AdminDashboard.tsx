"use client";

import React, { useState, useMemo } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { AttendanceHeatmap } from "../heatmap/AttendanceHeatmap";
import { MarkAttendanceModal } from "../attendance/MarkAttendanceModal";
import { PreMarkLeaveModal } from "../attendance/PreMarkLeaveModal";
import { useAttendance } from "@/lib/attendance-context";
import { SHIFT_CONFIGS } from "@/lib/constants";
import { format, startOfDay, getDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Edit3,
  Plane,
} from "lucide-react";

interface AdminDashboardProps {
  adminUser: User;
}

export function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const { users, records, calculateUserStats, getUpcomingLeaves } = useAttendance();

  const employees = useMemo(() => users.filter((u) => u.role === "employee"), [users]);

  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);
  const [selectedTargetUser, setSelectedTargetUser] = useState<User>(employees[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreMarkOpen, setIsPreMarkOpen] = useState(false);
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
    link.setAttribute("download", `ITNET_Attendance_Report_${format(today, "yyyy-MM-dd")}.csv`);
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
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="purple" className="gap-1 font-mono text-[10px]">
                  <ShieldCheck className="w-3 h-3" /> Admin Dashboard
                </Badge>
                <span className="text-xs text-muted-foreground">Company Administration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Attendance Management
              </h1>
              <p className="text-xs text-muted-foreground">
                Monitoring 4 team members: Shan, Edwin, Able, Devdath &bull; Mon&ndash;Sat (10:00 &ndash; 18:00)
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreMarkOpen(true)}
                className="gap-1.5"
              >
                <Plane className="w-4 h-4 text-rose-500" />
                <span>Pre-Mark Leave</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-border">
            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Avg Rate</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {companyAverageAttendance}%
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Team 90-day average</div>
            </div>

            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Full Day</span>
                <span className="w-2 h-2 rounded-[1.5px] bg-[#216e39] dark:bg-[#39d353]" />
              </div>
              <div className="text-2xl font-bold font-mono text-foreground mt-1">
                {todayOverview.full} / {todayOverview.total}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">10:00 &ndash; 18:00 (8h)</div>
            </div>

            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Half Shifts</span>
                <span className="w-2 h-2 rounded-[1.5px] bg-[#30a14e] dark:bg-[#26a641]" />
              </div>
              <div className="text-2xl font-bold font-mono text-foreground mt-1">
                {todayOverview.morning + todayOverview.afternoon}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {todayOverview.morning} morning &bull; {todayOverview.afternoon} afternoon
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>On Leave</span>
                <span className="w-2 h-2 rounded-[1.5px] border border-zinc-400 dark:border-zinc-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-500 mt-1">
                {todayOverview.leave}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">0h scheduled</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Upcoming Planned Leaves Banner */}
      {allUpcomingLeaves.length > 0 && (
        <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Upcoming Team Planned Leaves:</span>{" "}
              <span className="text-muted-foreground">
                {allUpcomingLeaves
                  .map(
                    (l) =>
                      `${l.user.name} on ${format(l.dateObj, "EEE, MMM d")} (${
                        l.record.notes ? l.record.notes.replace("Planned Leave: ", "") : "Leave"
                      })`
                  )
                  .join("; ")}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreMarkOpen(true)}
            className="h-7 text-xs text-rose-600 hover:text-rose-700 self-start sm:self-auto"
          >
            + Pre-Mark Leave
          </Button>
        </div>
      )}

      {/* Team Roster Table */}
      <Card className="border-border">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
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
              <TableRow>
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

                return (
                  <TableRow key={user.id}>
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground text-xs">{user.name}</div>
                          <div className="text-[11px] text-muted-foreground">{user.designation}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {config ? (
                        <div className="flex items-center gap-2">
                          {config.type === "full" && (
                            <div className="w-3.5 h-3.5 rounded-[2px] bg-[#216e39] dark:bg-[#39d353] border border-black/10" />
                          )}
                          {config.type === "half_morning" && (
                            <div className="w-3.5 h-3.5 rounded-[2px] border border-zinc-400 dark:border-zinc-600 overflow-hidden flex">
                              <div className="w-1/2 h-full bg-[#30a14e] dark:bg-[#26a641]" />
                              <div className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                          )}
                          {config.type === "half_afternoon" && (
                            <div className="w-3.5 h-3.5 rounded-[2px] border border-zinc-400 dark:border-zinc-600 overflow-hidden flex">
                              <div className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-800" />
                              <div className="w-1/2 h-full bg-[#30a14e] dark:bg-[#26a641]" />
                            </div>
                          )}
                          {config.type === "leave" && (
                            <div className="w-3.5 h-3.5 rounded-[2px] border border-zinc-400 dark:border-zinc-600 bg-transparent" />
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
                        className="h-7 px-2 text-xs"
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
              <span>Employee Contribution Grids</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Side-by-side GitHub commit matrices &bull; Click any box to log or correct attendance
            </p>
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs self-start sm:self-auto overflow-x-auto max-w-full">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="h-7 text-xs"
            >
              All (4 Members)
            </Button>
            {employees.map((emp) => (
              <Button
                key={emp.id}
                variant={activeTab === emp.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(emp.id)}
                className="h-7 text-xs"
              >
                {emp.name}
              </Button>
            ))}
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
    </div>
  );
}
