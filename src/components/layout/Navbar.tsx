"use client";

import React, { useState } from "react";
import { useAttendance } from "@/lib/attendance-context";
import {
  RotateCcw,
  Moon,
  Sun,
  LogOut,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { currentUser, logout, resetDemoData } = useAttendance();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleResetData = () => {
    if (confirm("Reset attendance history to demo seed data?")) {
      resetDemoData();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-sm">
            ITNETAI
          </span>
        </div>

        {/* Right Actions: Minimal & Clean */}
        <div className="flex items-center gap-1 sm:gap-2">
          {currentUser && (
            <div
              className={`flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-full text-xs font-medium shadow-2xs ${
                currentUser.theme?.badge || "bg-muted/70 text-foreground"
              }`}
            >
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarFallback
                  className={`text-[10px] font-bold ${
                    currentUser.theme?.avatarBg || "bg-muted text-foreground"
                  }`}
                >
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold truncate max-w-[65px] sm:max-w-[120px]">
                {currentUser.name}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetData}
            title="Reset data"
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>

          {currentUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sign Out / Back to Profile Selector"
              className="h-8 w-8 text-muted-foreground hover:text-rose-600 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
