"use client";

import React, { useState, useMemo } from "react";
import { User } from "@/types/attendance";
import { useAttendance } from "@/lib/attendance-context";
import {
  format,
  addDays,
  startOfDay,
  getDay,
  parseISO,
  isAfter,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, Plane, Clock, AlertCircle } from "lucide-react";

interface PreMarkLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUser: User;
}

const REASON_PRESETS = [
  "Casual / Personal",
  "Medical / Doctor",
  "Family Function",
  "Vacation / Travel",
  "Emergency",
];

export function PreMarkLeaveModal({
  isOpen,
  onClose,
  defaultUser,
}: PreMarkLeaveModalProps) {
  const { preMarkLeave, currentUser, users } = useAttendance();

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);
  const tomorrowStr = useMemo(() => format(addDays(today, 1), "yyyy-MM-dd"), [today]);

  const [targetUserId, setTargetUserId] = useState<string>(defaultUser.id);
  const [startDate, setStartDate] = useState<string>(tomorrowStr);
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>(tomorrowStr);
  const [selectedPreset, setSelectedPreset] = useState<string>("Casual / Personal");
  const [customReason, setCustomReason] = useState<string>("");

  // Calculate working days in range
  const daysCount = useMemo(() => {
    try {
      const s = parseISO(startDate);
      const e = isMultiDay ? parseISO(endDate) : s;
      if (isAfter(s, e)) return 0;

      let count = 0;
      let cur = s;
      while (!isAfter(cur, e)) {
        if (getDay(cur) !== 0) {
          count++;
        }
        cur = addDays(cur, 1);
      }
      return count;
    } catch {
      return 1;
    }
  }, [startDate, endDate, isMultiDay]);

  const handleApplyPresetDate = (type: "tomorrow" | "next_mon") => {
    if (type === "tomorrow") {
      const d = addDays(today, 1);
      const s = format(d, "yyyy-MM-dd");
      setStartDate(s);
      setEndDate(s);
      setIsMultiDay(false);
    } else if (type === "next_mon") {
      const curDay = getDay(today);
      const daysUntilNextMon = curDay === 0 ? 1 : 8 - curDay;
      const d = addDays(today, daysUntilNextMon);
      const s = format(d, "yyyy-MM-dd");
      setStartDate(s);
      setEndDate(s);
      setIsMultiDay(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() ? customReason.trim() : selectedPreset;
    preMarkLeave(
      targetUserId,
      startDate,
      isMultiDay ? endDate : undefined,
      finalReason
    );
    onClose();
  };

  const targetUser = users.find((u) => u.id === targetUserId) || defaultUser;
  const isAdmin = currentUser?.role === "admin";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[94vw] sm:max-w-md p-4 sm:p-6 max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Pre-Mark Planned Leave
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Let the team know in advance about your planned upcoming absence
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Admin User Selector */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Employee
              </label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full text-xs h-9 px-3 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {users
                  .filter((u) => u.role === "employee")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.designation})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Quick Date Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Leave Dates
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyPresetDate("tomorrow")}
                  className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetDate("next_mon")}
                  className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground"
                >
                  Next Monday
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-1">
                    {isMultiDay ? "From" : "Date"}
                  </span>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (!isMultiDay || isAfter(parseISO(e.target.value), parseISO(endDate))) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="w-full text-xs h-9 px-3 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {isMultiDay && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-1">
                      To (Inclusive)
                    </span>
                    <input
                      type="date"
                      required
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs h-9 px-3 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                )}
              </div>

              {/* Multi-day toggle checkbox */}
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isMultiDay}
                  onChange={(e) => setIsMultiDay(e.target.checked)}
                  className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                />
                <span>Multiple consecutive days leave</span>
              </label>
            </div>
          </div>

          {/* Reason presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Reason / Type
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {REASON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset);
                    setCustomReason("");
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    selectedPreset === preset && !customReason
                      ? "bg-foreground text-background border-foreground font-medium"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Or write custom reason (optional)..."
              className="w-full text-xs px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Schedule Summary Banner */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
            <div className="flex items-center justify-between font-medium text-foreground">
              <span>Scheduled Workdays Affected:</span>
              <Badge variant="outline" className="font-mono text-rose-600 dark:text-rose-400">
                {daysCount} {daysCount === 1 ? "workday" : "workdays"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sundays are excluded. The calendar heatmap will display a planned hollow box with your reason.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={daysCount <= 0}>
              Confirm Planned Leave
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
