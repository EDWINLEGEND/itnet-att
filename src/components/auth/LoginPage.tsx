"use client";

import React, { useMemo } from "react";
import { useAttendance } from "@/lib/attendance-context";
import { format, startOfDay } from "date-fns";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SHIFT_CONFIGS } from "@/lib/constants";

export function LoginPage() {
  const { users, quickLogin, records } = useAttendance();

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  const adminUser = users.find((u) => u.role === "admin");
  const employees = users.filter((u) => u.role === "employee");

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto w-full space-y-6">
      <div className="text-center space-y-1.5 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Select Profile
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Choose who you want to log in as to enter attendance
        </p>
      </div>

      {/* 5-Option Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Option 1: Admin Tile (Bento Span 1 on mobile, featured styling) */}
        {adminUser && (
          <div
            onClick={() => quickLogin(adminUser.id)}
            className="group relative p-5 rounded-xl border border-purple-500/30 dark:border-purple-500/20 bg-gradient-to-b from-purple-50/50 to-background dark:from-purple-950/15 dark:to-background hover:border-purple-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="purple" className="gap-1 text-[11px] font-medium">
                  <Shield className="w-3 h-3" /> Admin Portal
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono">Full Access</span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Avatar className="h-12 w-12 border-2 border-purple-400/40">
                  <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-sm">
                    {adminUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {adminUser.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{adminUser.designation}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-background/80 border border-purple-200/50 dark:border-purple-900/40 text-xs text-muted-foreground">
                Company overview, analytics, team member rosters & CSV report export
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border text-xs font-medium text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Options 2 - 5: The 4 Employees (Shan, Edwin, Able, Devdath) */}
        {employees.map((emp) => {
          const todayRec = records[`${emp.id}_${todayStr}`];
          const isLogged = !!todayRec;
          const shiftConfig = todayRec ? SHIFT_CONFIGS[todayRec.shiftType] : null;

          return (
            <div
              key={emp.id}
              onClick={() => quickLogin(emp.id)}
              className="group relative p-5 rounded-xl border border-border bg-card hover:border-foreground/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
                    Employee
                  </Badge>
                  {isLogged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2da44e] dark:bg-[#3fb950]" />
                      Logged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarFallback className="font-bold text-sm bg-muted text-foreground">
                      {emp.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{emp.designation}</p>
                  </div>
                </div>

                {/* Today's status box */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                  {todayRec && shiftConfig ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Today:</span>
                      <span className="font-semibold text-foreground">
                        {shiftConfig.label} ({shiftConfig.timeRange})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Today:</span>
                      <span>Not marked yet</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Enter Attendance</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
