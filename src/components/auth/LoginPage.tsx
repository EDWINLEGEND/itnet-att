"use client";

import React from "react";
import { useAttendance } from "@/lib/attendance-context";
import { Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function LoginPage() {
  const { users, quickLogin } = useAttendance();

  const adminUser = users.find((u) => u.role === "admin");
  const employees = users.filter((u) => u.role === "employee");

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none py-2 px-3">
      {/* Bento Grid: Admin covers top side, 4 employees cover 4 quadrants */}
      <div className="w-full max-w-md sm:max-w-xl flex flex-col gap-2.5 sm:gap-3.5">
        {/* Topside: Admin Login Button */}
        {adminUser && (
          <button
            type="button"
            onClick={() => quickLogin(adminUser.id)}
            className="group relative w-full p-4 sm:p-5 rounded-2xl border border-purple-500/40 dark:border-purple-500/25 bg-purple-50/60 dark:bg-purple-950/25 hover:border-purple-500 hover:ring-2 hover:ring-purple-500/20 shadow-xs hover:shadow-xl active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3.5 sm:gap-4"
          >
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-purple-400 dark:border-purple-500 transition-transform duration-200 group-hover:scale-110 shrink-0">
              <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 font-bold">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
              </AvatarFallback>
            </Avatar>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-purple-700 dark:text-purple-300 group-hover:text-purple-600 dark:group-hover:text-purple-200 transition-colors">
              {adminUser.name}
            </span>
          </button>
        )}

        {/* 4 Quadrants: 2x2 Grid for the 4 Employees */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {employees.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => quickLogin(emp.id)}
              className="group relative flex flex-col items-center justify-center p-4 sm:p-7 rounded-2xl border border-border/90 bg-card hover:border-foreground/50 hover:ring-2 hover:ring-foreground/10 shadow-xs hover:shadow-xl active:scale-97 transition-all duration-200 cursor-pointer text-center"
            >
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 mb-2 sm:mb-2.5 transition-transform duration-200 group-hover:scale-110 border-2 border-border shrink-0">
                <AvatarFallback className="font-bold text-base sm:text-lg bg-muted text-foreground">
                  {emp.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                {emp.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
