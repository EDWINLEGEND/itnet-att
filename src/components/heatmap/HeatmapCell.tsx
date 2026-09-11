"use client";

import React from "react";
import { DayAttendance } from "@/types/attendance";
import { SHIFT_CONFIGS } from "@/lib/constants";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapCellProps {
  day: DayAttendance;
  onClick?: (day: DayAttendance) => void;
  size?: "sm" | "md" | "lg";
}

export function HeatmapCell({ day, onClick, size = "md" }: HeatmapCellProps) {
  const { date, dateObj, dayOfWeek, isSunday, isFuture, isToday, record, isHoliday, holidayTitle } = day;
  const shiftType = record?.shiftType;

  // Exact GitHub-style square dimensions
  const dimensionClass = {
    sm: "w-[11px] h-[11px] rounded-[2px]",
    md: "w-[13px] h-[13px] rounded-[2px]",
    lg: "w-[15px] h-[15px] rounded-[2.5px]",
  }[size];

  let cellInner: React.ReactNode = null;
  let cellClass = "relative outline-none cursor-pointer transition-all duration-75 select-none ";

  if (isHoliday) {
    // Official company holiday
    cellClass +=
      "bg-amber-400 dark:bg-amber-500 border border-amber-600/40 hover:brightness-110";
  } else if (isSunday) {
    // Weekend / Sunday (Non-working day)
    cellClass +=
      "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/40 opacity-40 hover:opacity-100";
  } else if (isFuture && shiftType === "leave") {
    // Pre-marked Planned Leave in the future
    cellClass +=
      "bg-rose-500/10 border-2 border-dashed border-rose-400/90 dark:border-rose-500 hover:border-rose-600 dark:hover:border-rose-400";
  } else if (isFuture) {
    // Future scheduled day
    cellClass +=
      "bg-transparent border border-dashed border-zinc-200 dark:border-zinc-800/60 opacity-30 hover:opacity-80";
  } else if (!shiftType || shiftType === "leave") {
    // Leave / Absent: Hollow box (no fill)
    cellClass +=
      "bg-transparent border border-zinc-300 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500";
  } else if (shiftType === "full") {
    // Full day: Solid vibrant green fill
    cellClass +=
      "bg-[#2da44e] dark:bg-[#3fb950] border border-black/10 dark:border-white/10 hover:brightness-110";
  } else if (shiftType === "half_morning") {
    // Morning half: Left half filled with identical vibrant green
    cellClass +=
      "border border-zinc-300 dark:border-zinc-700 overflow-hidden hover:brightness-110";
    cellInner = (
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
        <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
    );
  } else if (shiftType === "half_afternoon") {
    // Afternoon half: Right half filled with identical vibrant green
    cellClass +=
      "border border-zinc-300 dark:border-zinc-700 overflow-hidden hover:brightness-110";
    cellInner = (
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
      </div>
    );
  }

  // Today indicator ring
  if (isToday) {
    cellClass += " ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-950 z-10";
  }

  const shiftConfig = shiftType ? SHIFT_CONFIGS[shiftType] : null;

  return (
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onClick && onClick(day)}
          className={`${dimensionClass} ${cellClass}`}
          aria-label={`${format(dateObj, "MMM d, yyyy")}: ${
            isHoliday
              ? `Holiday: ${holidayTitle || "Official Holiday"}`
              : shiftConfig?.label || (isSunday ? "Sunday Off" : "Leave")
          }`}
        >
          {cellInner}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="px-3 py-2 text-xs bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-lg rounded-md"
      >
        <div className="font-semibold text-zinc-100 pb-1 border-b border-zinc-800 mb-1 flex items-center justify-between gap-3">
          <span>{format(dateObj, "EEE, MMM d, yyyy")}</span>
          {isToday && (
            <span className="text-[10px] px-1 bg-blue-500/20 text-blue-400 rounded font-mono uppercase">
              Today
            </span>
          )}
        </div>

        <div className="space-y-0.5 text-zinc-300 text-[11px]">
          {isHoliday ? (
            <div>
              <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span>{holidayTitle || "Official Holiday"}</span>
              </div>
              <div className="text-zinc-400 text-[10px]">Company Official Holiday (Off)</div>
              {shiftConfig && (
                <div className="mt-1 pt-1 border-t border-zinc-800 text-emerald-400 text-[10px]">
                  Logged shift: {shiftConfig.label}
                </div>
              )}
            </div>
          ) : isSunday ? (
            <span className="text-zinc-400">Sunday (Non-working day)</span>
          ) : isFuture && shiftType === "leave" ? (
            <div>
              <div className="text-rose-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Planned Leave (Upcoming)</span>
              </div>
              {record?.notes && (
                <div className="mt-1 text-zinc-300 text-[11px]">
                  Reason: {record.notes}
                </div>
              )}
            </div>
          ) : isFuture ? (
            <span className="text-zinc-500">Upcoming scheduled workday</span>
          ) : shiftConfig ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Shift:</span>
                <span className="font-medium text-white">{shiftConfig.label}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Timing:</span>
                <span className="font-mono text-emerald-400">{shiftConfig.timeRange}</span>
              </div>
              {record?.notes && (
                <div className="mt-1 pt-1 border-t border-zinc-800 text-zinc-400 text-[10px] italic">
                  Note: {record.notes}
                </div>
              )}
            </>
          ) : (
            <span className="text-rose-400 font-medium">On Leave (0 hours)</span>
          )}
        </div>

        <div className="mt-1.5 pt-1 border-t border-zinc-800 text-[10px] text-zinc-500 text-center">
          Click to log / edit
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
