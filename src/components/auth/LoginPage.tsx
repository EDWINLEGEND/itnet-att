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
        {/* Topside: Admin Login Button - Borderless Pastel Green */}
        {adminUser && (
          <button
            type="button"
            onClick={() => quickLogin(adminUser.id)}
            className={`group relative w-full p-4 sm:p-5 rounded-3xl ${
              adminUser.theme?.pastelBg || "bg-emerald-50"
            } hover:brightness-95 dark:hover:brightness-110 shadow-xs hover:shadow-md active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3.5 sm:gap-4`}
          >
            <Avatar className="h-11 w-11 sm:h-12 sm:w-12 transition-transform duration-200 group-hover:scale-105 shrink-0 shadow-2xs">
              <AvatarFallback
                className={`font-bold ${
                  adminUser.theme?.avatarBg || "bg-emerald-200 text-emerald-800"
                }`}
              >
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </AvatarFallback>
            </Avatar>
            <span
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                adminUser.theme?.accentText || "text-emerald-800"
              }`}
            >
              {adminUser.name}
            </span>
          </button>
        )}

        {/* 4 Quadrants: 2x2 Grid with Distinct Light Pastel Colors for the 4 Guys */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {employees.map((emp) => {
            const theme = emp.theme;
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => quickLogin(emp.id)}
                className={`group relative flex flex-col items-center justify-center p-5 sm:p-8 rounded-3xl ${
                  theme?.pastelBg || "bg-card"
                } shadow-xs hover:shadow-md active:scale-97 transition-all duration-200 cursor-pointer text-center`}
              >
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 mb-2.5 transition-transform duration-200 group-hover:scale-105 shrink-0 shadow-2xs">
                  <AvatarFallback
                    className={`font-bold text-base sm:text-lg ${
                      theme?.avatarBg || "bg-muted text-foreground"
                    }`}
                  >
                    {emp.initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`text-base sm:text-xl font-bold tracking-tight ${
                    theme?.accentText || "text-foreground"
                  }`}
                >
                  {emp.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
