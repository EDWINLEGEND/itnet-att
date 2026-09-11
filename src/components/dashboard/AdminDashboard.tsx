"use client";

import React, { useState, useMemo } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { AttendanceHeatmap } from "../heatmap/AttendanceHeatmap";
import { MarkAttendanceModal } from "../attendance/MarkAttendanceModal";
import { useAttendance } from "@/lib/attendance-context";
import { SHIFT_CONFIGS } from "@/lib/constants";
import { format, startOfDay, getDay } from "date-fns";
import {
  Users,
  ShieldCheck,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Edit3,
} from "lucide-react";

interface AdminDashboardProps {
  adminUser: User;
}

export function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const { users, records, calculateUserStats } = useAttendance();

  const employees = useMemo(() => users.filter((u) => u.role === "employee"), [users]);

  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);
  const [selectedTargetUser, setSelectedTargetUser] = useState<User>(employees[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [heatmapRange, setHeatmapRange] = useState<number>(18);

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  // Today's summary across all 4 employees
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

  // Per-employee statistics for table and export
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

  // Company average attendance rate
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

  // Export to CSV functionality
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

  return (
    <div className="space-y-6">
      {/* Admin Top Header Card */}
      <div className="bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-zinc-900/30 border border-purple-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Control Center
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                ITNET Operations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Company Attendance Dashboard
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Tracking Shan, Edwin, Able, and Devdath &bull; Monday &ndash; Saturday (10 AM &ndash; 6 PM)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Company Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-purple-500/20">
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Avg Company Rate</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {companyAverageAttendance}%
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Across all 4 team members</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Present Full Day</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
              {todayOverview.full} / {todayOverview.total}
            </div>
            <div className="text-[10px] text-emerald-500 font-medium mt-0.5">10:00 AM – 6:00 PM</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>On Half Shift</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
              {todayOverview.morning + todayOverview.afternoon}
            </div>
            <div className="text-[10px] text-amber-500 font-medium mt-0.5">
              {todayOverview.morning} morning &bull; {todayOverview.afternoon} afternoon
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>On Leave Today</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-rose-500 mt-1">
              {todayOverview.leave}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">0 hours scheduled</div>
          </div>
        </div>
      </div>

      {/* Team Summary Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Employee Roster & Attendance Health
            </h3>
          </div>
          <span className="text-xs text-zinc-400">90-Day Analytics Window</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="pb-2.5 pl-2">Employee</th>
                <th className="pb-2.5">Today&apos;s Status</th>
                <th className="pb-2.5">Attendance Rate</th>
                <th className="pb-2.5">Full Shifts</th>
                <th className="pb-2.5">Morning (10-2)</th>
                <th className="pb-2.5">Afternoon (2-6)</th>
                <th className="pb-2.5">Leaves</th>
                <th className="pb-2.5">Total Hours</th>
                <th className="pb-2.5 text-right pr-2">Quick Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {employeeStats.map(({ user, stats, todayRec }) => {
                const config = todayRec ? SHIFT_CONFIGS[todayRec.shiftType] : null;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold font-mono text-xs">
                          {user.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">{user.designation}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      {config ? (
                        <div className="flex items-center gap-2">
                          {/* Visual mini-box */}
                          {config.type === "full" && (
                            <div className="w-4 h-4 rounded-[2px] bg-emerald-500 border border-emerald-600" />
                          )}
                          {config.type === "half_morning" && (
                            <div className="w-4 h-4 rounded-[2px] border border-zinc-400 overflow-hidden flex">
                              <div className="w-1/2 h-full bg-emerald-500" />
                              <div className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-700" />
                            </div>
                          )}
                          {config.type === "half_afternoon" && (
                            <div className="w-4 h-4 rounded-[2px] border border-zinc-400 overflow-hidden flex">
                              <div className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-700" />
                              <div className="w-1/2 h-full bg-emerald-500" />
                            </div>
                          )}
                          {config.type === "leave" && (
                            <div className="w-4 h-4 rounded-[2px] border-2 border-rose-400 bg-transparent" />
                          )}
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                            {config.shortLabel}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Not logged today</span>
                      )}
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, stats.attendancePercentage)}%` }}
                          />
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-white font-mono">
                          {stats.attendancePercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {stats.fullDaysCount}
                    </td>
                    <td className="py-3 font-mono font-medium text-amber-600 dark:text-amber-400">
                      {stats.halfMorningCount}
                    </td>
                    <td className="py-3 font-mono font-medium text-cyan-600 dark:text-cyan-400">
                      {stats.halfAfternoonCount}
                    </td>
                    <td className="py-3 font-mono font-medium text-rose-500">
                      {stats.leaveDaysCount}
                    </td>
                    <td className="py-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {stats.totalHoursWorked} hrs
                    </td>

                    <td className="py-3 text-right pr-2">
                      <button
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
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-zinc-500" />
                        <span>Log Today</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacked GitHub Commits Heatmaps for all 4 employees */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span>Team GitHub-Style Contribution Heatmaps</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Side-by-side visual matrix for Shan, Edwin, Able, and Devdath &bull; Click any box to inspect or override
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <button
              onClick={() => setHeatmapRange(14)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                heatmapRange === 14 ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs" : ""
              }`}
            >
              14 Weeks
            </button>
            <button
              onClick={() => setHeatmapRange(20)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                heatmapRange === 20 ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs" : ""
              }`}
            >
              20 Weeks
            </button>
            <button
              onClick={() => setHeatmapRange(28)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                heatmapRange === 28 ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs" : ""
              }`}
            >
              28 Weeks
            </button>
          </div>
        </div>

        {/* Heatmaps stacked */}
        <div className="space-y-4">
          {employees.map((emp) => (
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
    </div>
  );
}
