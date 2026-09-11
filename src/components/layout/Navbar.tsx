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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-sm">
            ITNET
          </span>
        </div>

        {/* Right Actions: Minimal & Clean */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-muted/60 border border-border text-xs font-medium">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] font-bold">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-foreground font-semibold">{currentUser.name}</span>
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
