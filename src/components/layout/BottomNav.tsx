"use client";

import React, { useMemo } from "react";
import { useAttendance } from "@/lib/attendance-context";
import { format, startOfDay } from "date-fns";
import { ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  id: string;
  name: string;
  label: string;
  role: "admin" | "employee";
  isAdmin?: boolean;
}

export function BottomNav() {
  const { currentUser, quickLogin, records, isLoaded } = useAttendance();

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  // Only display bottom dock once logged in, so login page only has the 5 big buttons
  if (!isLoaded || !currentUser) return null;

  // The 5 Options requested: D (Devdath), A (Able), Admin (Center Icon), S (Shan), E (Edwin)
  const navItems: NavItem[] = [
    { id: "emp-devdath", name: "Devdath", label: "D", role: "employee" },
    { id: "emp-able", name: "Able", label: "A", role: "employee" },
    { id: "admin-1", name: "Admin", label: "Admin", role: "admin", isAdmin: true },
    { id: "emp-shan", name: "Shan", label: "S", role: "employee" },
    { id: "emp-edwin", name: "Edwin", label: "E", role: "employee" },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <nav
        aria-label="Attendance navigation dock"
        className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 select-none max-w-[calc(100vw-1rem)]"
      >
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/40">
          {navItems.map((item) => {
            const isSelected = currentUser?.id === item.id;
            const todayRec = records[`${item.id}_${todayStr}`];
            const isLogged = !!todayRec;

            if (item.isAdmin) {
              // Center Admin Icon
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => quickLogin(item.id)}
                      className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 hover:scale-105"
                      }`}
                      aria-label="Admin View"
                    >
                      <ShieldCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-semibold py-1 px-2.5">
                    Admin View
                  </TooltipContent>
                </Tooltip>
              );
            }

            // Employee Letters: D, A, S, E
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => quickLogin(item.id)}
                    className={`relative flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-200 cursor-pointer font-bold text-sm sm:text-base ${
                      isSelected
                        ? "bg-foreground text-background shadow-xs scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                    aria-label={`View ${item.name}`}
                  >
                    <span>{item.label}</span>
                    {/* Status dot for today: green if logged, amber if pending */}
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        isLogged
                          ? "bg-[#2da44e] dark:bg-[#3fb950]"
                          : "bg-amber-500/70"
                      } ${isSelected ? "opacity-90" : "opacity-60"}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs py-1 px-2.5">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {isLogged ? "✓ Logged today" : "Pending today"}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}
