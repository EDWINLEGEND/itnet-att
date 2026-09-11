"use client";

import React, { useState } from "react";
import { DayAttendance } from "@/types/attendance";
import { SHIFT_CONFIGS } from "@/lib/constants";
import { format } from "date-fns";

interface HeatmapCellProps {
  day: DayAttendance;
  onClick?: (day: DayAttendance) => void;
  size?: "sm" | "md" | "lg";
}

export function HeatmapCell({ day, onClick, size = "md" }: HeatmapCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { date, dateObj, dayOfWeek, isSunday, isFuture, isToday, record } = day;
  const shiftType = record?.shiftType;

  // Dimensions
  const sizeClasses = {
    sm: "w-3 h-3 rounded-[2.5px]",
    md: "w-4 h-4 rounded-[3px]",
    lg: "w-5 h-5 rounded-[4px]",
  }[size];

  // Render cell style based on attendance status
  let cellContent: React.ReactNode = null;
  let cellClass = "relative transition-all duration-150 cursor-pointer select-none ";

  if (isSunday) {
    // Non-working day (Sunday)
    cellClass +=
      "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 opacity-60 hover:opacity-100";
    cellContent = (
      <span className="sr-only">Sunday - Non working</span>
    );
  } else if (isFuture) {
    // Future date
    cellClass +=
      "bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800/80 opacity-40 hover:opacity-90";
  } else if (!shiftType || shiftType === "leave") {
    // On Leave / Absent: Hollow box (no fill)
    cellClass +=
      "border-2 border-rose-300/80 dark:border-rose-500/60 bg-transparent hover:border-rose-400 dark:hover:border-rose-400";
  } else if (shiftType === "full") {
    // Full day: Completely filled box
    cellClass +=
      "bg-emerald-500 dark:bg-emerald-500 border border-emerald-600/40 dark:border-emerald-400/30 shadow-xs hover:brightness-110";
  } else if (shiftType === "half_morning") {
    // Morning half: Left half filled (10:00 AM - 2:00 PM)
    cellClass += "border border-zinc-300 dark:border-zinc-700 overflow-hidden hover:brightness-110";
    cellContent = (
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full bg-emerald-500 dark:bg-emerald-500" />
        <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-900/70" />
      </div>
    );
  } else if (shiftType === "half_afternoon") {
    // Afternoon half: Right half filled (2:00 PM - 6:00 PM)
    cellClass += "border border-zinc-300 dark:border-zinc-700 overflow-hidden hover:brightness-110";
    cellContent = (
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-900/70" />
        <div className="w-1/2 h-full bg-emerald-500 dark:bg-emerald-500" />
      </div>
    );
  }

  // Ring for Today
  if (isToday) {
    cellClass += " ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-950 z-10";
  }

  const shiftConfig = shiftType ? SHIFT_CONFIGS[shiftType] : null;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => onClick && onClick(day)}
      tabIndex={0}
      role="button"
      aria-label={`${format(dateObj, "MMM dd, yyyy")}: ${shiftConfig?.label || (isSunday ? "Sunday Off" : "No Shift")}`}
    >
      <div className={`${sizeClasses} ${cellClass}`}>
        {cellContent}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none min-w-[190px] max-w-[240px] p-2.5 rounded-lg bg-zinc-950 text-white text-xs shadow-xl border border-zinc-800 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="flex items-center justify-between font-semibold pb-1 mb-1 border-b border-zinc-800">
            <span>{format(dateObj, "EEE, MMM d, yyyy")}</span>
            {isToday && (
              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 text-[10px] rounded font-mono">
                TODAY
              </span>
            )}
          </div>

          <div className="space-y-1 text-zinc-300">
            {isSunday ? (
              <div className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                <span>Sunday (Non-Working Day)</span>
              </div>
            ) : isFuture ? (
              <div className="text-zinc-400">Scheduled Workday (Future)</div>
            ) : shiftConfig ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Shift:</span>
                  <span className="font-medium text-white">{shiftConfig.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Hours:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{shiftConfig.timeRange}</span>
                </div>
                {record?.notes && (
                  <div className="mt-1 pt-1 border-t border-zinc-800/80 text-[11px] text-zinc-400 italic">
                    &quot;{record.notes}&quot;
                  </div>
                )}
              </>
            ) : (
              <div className="text-rose-400 font-medium">On Leave (No shift recorded)</div>
            )}
          </div>

          <div className="mt-2 text-[10px] text-zinc-500 text-center border-t border-zinc-800/60 pt-1">
            Click to view or edit
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-950" />
        </div>
      )}
    </div>
  );
}
