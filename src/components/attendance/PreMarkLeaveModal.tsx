"use client";

import React, { useState, useMemo } from "react";
import { User, ShiftType, WorkLocation } from "@/types/attendance";
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
import { Calendar, Laptop, Building2, Plane, CheckCircle2, Users } from "lucide-react";

interface PreMarkLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUser: User;
}

const LEAVE_PRESETS = [
  "Casual / Personal",
  "Medical / Doctor",
  "Family Function",
  "Vacation / Travel",
  "Emergency",
];

const WORK_PRESETS = [
  "Remote Sprint",
  "Team Sync",
  "Client Meetings",
  "Deep Focus",
  "Commute / Travel",
];

export function PreMarkLeaveModal({
  isOpen,
  onClose,
  defaultUser,
}: PreMarkLeaveModalProps) {
  const { preMarkSchedule, getTeamStatusForDate, currentUser, users } = useAttendance();

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);
  const tomorrowStr = useMemo(() => format(addDays(today, 1), "yyyy-MM-dd"), [today]);

  const [targetUserId, setTargetUserId] = useState<string>(defaultUser.id);
  const [scheduleMode, setScheduleMode] = useState<"remote" | "office" | "leave">("remote");
  const [shiftDuration, setShiftDuration] = useState<ShiftType>("full");
  const [startDate, setStartDate] = useState<string>(tomorrowStr);
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>(tomorrowStr);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  // Live team radar for the chosen start date
  const teamStatusForDate = useMemo(() => {
    return getTeamStatusForDate(startDate);
  }, [getTeamStatusForDate, startDate]);

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
    const finalShiftType: ShiftType = scheduleMode === "leave" ? "leave" : shiftDuration;
    const finalLocation: WorkLocation | undefined = scheduleMode === "leave" ? undefined : scheduleMode;

    preMarkSchedule(
      targetUserId,
      startDate,
      isMultiDay ? endDate : undefined,
      finalShiftType,
      finalLocation,
      finalReason
    );
    onClose();
  };

  const isAdmin = currentUser?.role === "admin";
  const activePresets = scheduleMode === "leave" ? LEAVE_PRESETS : WORK_PRESETS;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[94vw] sm:max-w-lg p-4 sm:p-6 max-h-[92vh] overflow-y-auto rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              scheduleMode === "remote"
                ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400"
                : scheduleMode === "office"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
            }`}>
              {scheduleMode === "remote" ? (
                <Laptop className="w-4 h-4" />
              ) : scheduleMode === "office" ? (
                <Building2 className="w-4 h-4" />
              ) : (
                <Plane className="w-4 h-4" />
              )}
            </div>
            <DialogTitle className="text-base font-semibold">
              Plan Ahead & Schedule
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Pre-mark whether you will be working Online (WFH), In-Office, or taking Leave
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
                className="w-full text-xs h-9 px-3 bg-muted/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 border-0"
              >
                {users
                  .filter((u) => u.role === "employee")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* 1. Schedule Mode: Online vs In-Office vs Leave */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Work Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/50 rounded-2xl">
              <button
                type="button"
                onClick={() => setScheduleMode("remote")}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  scheduleMode === "remote"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-cyan-600" />
                <span>Online (WFH)</span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode("office")}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  scheduleMode === "office"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>In-Office</span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode("leave")}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  scheduleMode === "leave"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Plane className="w-3.5 h-3.5 text-rose-500" />
                <span>Leave</span>
              </button>
            </div>
          </div>

          {/* 2. Duration (if not leave) */}
          {scheduleMode !== "leave" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Shift Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setShiftDuration("full")}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                    shiftDuration === "full"
                      ? "bg-emerald-500/15 ring-2 ring-emerald-600 shadow-sm"
                      : "bg-muted/40 hover:bg-muted/70"
                  }`}
                >
                  <span className="text-xs font-bold text-foreground">Full Day</span>
                  <span className="text-[10px] text-muted-foreground">8h &bull; 10-18</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShiftDuration("half_morning")}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                    shiftDuration === "half_morning"
                      ? "bg-emerald-500/15 ring-2 ring-emerald-600 shadow-sm"
                      : "bg-muted/40 hover:bg-muted/70"
                  }`}
                >
                  <span className="text-xs font-bold text-foreground">Morning</span>
                  <span className="text-[10px] text-muted-foreground">4h &bull; 10-14</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShiftDuration("half_afternoon")}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                    shiftDuration === "half_afternoon"
                      ? "bg-emerald-500/15 ring-2 ring-emerald-600 shadow-sm"
                      : "bg-muted/40 hover:bg-muted/70"
                  }`}
                >
                  <span className="text-xs font-bold text-foreground">Afternoon</span>
                  <span className="text-[10px] text-muted-foreground">4h &bull; 14-18</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Dates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyPresetDate("tomorrow")}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetDate("next_mon")}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Next Mon
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
                    className="w-full text-xs h-9 px-3 bg-muted/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 border-0"
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
                      className="w-full text-xs h-9 px-3 bg-muted/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 border-0"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={isMultiDay}
                  onChange={(e) => setIsMultiDay(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Multiple consecutive days</span>
              </label>
            </div>
          </div>

          {/* 4. Live Team Radar for Chosen Date */}
          <div className="p-3 rounded-2xl bg-muted/40 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Team on {format(parseISO(startDate), "EEEE, MMM d")}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">Live Radar</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {teamStatusForDate.map((member) => {
                const isSelectedUser = member.user.id === targetUserId;
                const isRemote = member.workLocation === "remote";
                const isOffice = member.workLocation === "office";
                const isLeave = member.isLeave;

                return (
                  <div
                    key={member.user.id}
                    className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${
                      isSelectedUser
                        ? "bg-background ring-1 ring-emerald-500/50 shadow-2xs"
                        : "bg-background/70"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg ${
                        member.user.theme?.avatarBg || "bg-muted"
                      } flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs`}
                    >
                      {member.user.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground truncate text-xs flex items-center gap-1">
                        <span>{member.user.name}</span>
                        {isSelectedUser && (
                          <span className="text-[9px] text-muted-foreground">(You)</span>
                        )}
                      </div>
                      <div className="text-[10px] truncate text-muted-foreground">
                        {isLeave ? (
                          <span className="text-rose-500 font-medium">🏖️ Leave</span>
                        ) : isRemote ? (
                          <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                            💻 Online ({member.shiftType === "full" ? "8h" : "4h"})
                          </span>
                        ) : isOffice ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            🏢 Office ({member.shiftType === "full" ? "8h" : "4h"})
                          </span>
                        ) : member.isSunday ? (
                          <span>Sunday Off</span>
                        ) : member.isHoliday ? (
                          <span className="text-amber-600">Holiday</span>
                        ) : (
                          <span className="italic text-muted-foreground/70">Not marked</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Reason / Note Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Reason / Activity Note
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {activePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset);
                    setCustomReason("");
                  }}
                  className={`text-xs px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs ${
                    selectedPreset === preset && !customReason
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
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
              placeholder="Or write custom note (optional)..."
              className="w-full text-xs px-3 py-2 bg-muted/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 border-0"
            />
          </div>

          {/* Summary Banner */}
          <div className="p-3 rounded-2xl bg-muted/30 text-xs space-y-1 shadow-2xs">
            <div className="flex items-center justify-between font-medium text-foreground">
              <span>Scheduled Workdays:</span>
              <Badge variant="secondary" className="font-mono font-semibold">
                {daysCount} {daysCount === 1 ? "day" : "days"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {scheduleMode === "remote"
                ? "You will be working Online (Work From Home). The team will see this on the schedule."
                : scheduleMode === "office"
                ? "You will be working In-Office. Your team can see you on site."
                : "You will be on Leave. Sundays and official holidays are excluded."}
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-xl bg-muted/40 hover:bg-muted/70 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={daysCount <= 0}
              className="rounded-xl bg-black hover:bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs border-0 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Confirm Schedule</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
