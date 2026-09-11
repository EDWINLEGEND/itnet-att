"use client";

import React, { useState, useEffect } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { SHIFT_CONFIGS } from "@/lib/constants";
import { useAttendance } from "@/lib/attendance-context";
import { format } from "date-fns";
import confetti from "canvas-confetti";
import { X, Clock, Check, Trash2, Calendar, AlertCircle } from "lucide-react";

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayAttendance | null;
  targetUser: User;
}

export function MarkAttendanceModal({
  isOpen,
  onClose,
  day,
  targetUser,
}: MarkAttendanceModalProps) {
  const { markAttendance, deleteAttendance, currentUser } = useAttendance();

  const [selectedShift, setSelectedShift] = useState<ShiftType>("full");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (day?.record) {
      setSelectedShift(day.record.shiftType);
      setNotes(day.record.notes || "");
    } else {
      setSelectedShift("full");
      setNotes("");
    }
  }, [day]);

  if (!isOpen || !day) return null;

  const handleSave = () => {
    markAttendance(targetUser.id, day.date, selectedShift, notes.trim() || undefined);

    // Fire confetti celebration if marking full or half day for today!
    if (day.isToday && selectedShift !== "leave") {
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // silent
      }
    }

    onClose();
  };

  const handleDelete = () => {
    deleteAttendance(targetUser.id, day.date);
    onClose();
  };

  const canEdit =
    currentUser?.role === "admin" || currentUser?.id === targetUser.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                Log Attendance
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {targetUser.name} &bull; {format(day.dateObj, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {day.isSunday && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Sunday is a Non-Working Day:</span> ITNET operates
                on a Monday to Saturday schedule (10 AM – 6 PM).
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Select Shift Type
            </label>

            {/* Shift selection cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {/* Full Day */}
              <button
                type="button"
                onClick={() => setSelectedShift("full")}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedShift === "full"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Full Box */}
                  <div className="w-6 h-6 rounded bg-emerald-500 border border-emerald-600/50 shadow-xs shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      Full Shift
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                        8 hrs
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      10:00 AM – 6:00 PM (Standard full day)
                    </div>
                  </div>
                </div>
                {selectedShift === "full" && (
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>

              {/* Half Day - Morning */}
              <button
                type="button"
                onClick={() => setSelectedShift("half_morning")}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedShift === "half_morning"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Left Fill Box */}
                  <div className="w-6 h-6 rounded border border-zinc-400 dark:border-zinc-600 overflow-hidden relative flex shrink-0">
                    <div className="w-1/2 h-full bg-emerald-500" />
                    <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      Half Shift &ndash; Morning
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                        4 hrs
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      10:00 AM – 2:00 PM (Left fill box)
                    </div>
                  </div>
                </div>
                {selectedShift === "half_morning" && (
                  <Check className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                )}
              </button>

              {/* Half Day - Afternoon */}
              <button
                type="button"
                onClick={() => setSelectedShift("half_afternoon")}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedShift === "half_afternoon"
                    ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 ring-1 ring-cyan-500"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Right Fill Box */}
                  <div className="w-6 h-6 rounded border border-zinc-400 dark:border-zinc-600 overflow-hidden relative flex shrink-0">
                    <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                    <div className="w-1/2 h-full bg-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      Half Shift &ndash; Afternoon
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono">
                        4 hrs
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      2:00 PM – 6:00 PM (Right fill box)
                    </div>
                  </div>
                </div>
                {selectedShift === "half_afternoon" && (
                  <Check className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                )}
              </button>

              {/* Leave / Absent */}
              <button
                type="button"
                onClick={() => setSelectedShift("leave")}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedShift === "leave"
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-1 ring-rose-500"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Hollow Box */}
                  <div className="w-6 h-6 rounded border-2 border-rose-400 bg-transparent shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      On Leave / Absent
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono">
                        0 hrs
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      No shift logged (Hollow box)
                    </div>
                  </div>
                </div>
                {selectedShift === "leave" && (
                  <Check className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
              </button>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remote client meeting, medical leave..."
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            {day.record && canEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Record
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canEdit}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              Save Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
