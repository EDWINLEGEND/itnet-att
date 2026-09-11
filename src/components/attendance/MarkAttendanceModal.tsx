"use client";

import React, { useState, useMemo } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { SHIFT_CONFIGS } from "@/lib/constants";
import { useAttendance } from "@/lib/attendance-context";
import {
  format,
  parseISO,
  getDay,
  subDays,
  addDays,
  startOfDay,
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
import { Check, Trash2, AlertCircle, Sparkles } from "lucide-react";

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  day?: DayAttendance | null;
  targetUser: User;
  initialDate?: string;
}

export function MarkAttendanceModal({
  isOpen,
  onClose,
  day,
  targetUser,
  initialDate,
}: MarkAttendanceModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <MarkAttendanceContent
        key={`${targetUser.id}_${day?.date || initialDate || "default"}`}
        onClose={onClose}
        day={day}
        targetUser={targetUser}
        initialDate={initialDate}
      />
    </Dialog>
  );
}

function MarkAttendanceContent({
  onClose,
  day,
  targetUser,
  initialDate,
}: Omit<MarkAttendanceModalProps, "isOpen">) {
  const { records, markAttendance, deleteAttendance, currentUser, users, isOfficialHoliday } = useAttendance();

  const employees = useMemo(() => users.filter((u) => u.role === "employee"), [users]);
  const [activeUserId, setActiveUserId] = useState<string>(targetUser.id);

  const activeUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || targetUser;
  }, [users, activeUserId, targetUser]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  const defaultDate = useMemo(() => {
    if (day?.date) return day.date;
    if (initialDate) return initialDate;
    return format(subDays(today, 1), "yyyy-MM-dd");
  }, [day, initialDate, today]);

  const initialRecord = records[`${targetUser.id}_${defaultDate}`] || day?.record;

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedShift, setSelectedShift] = useState<ShiftType>(initialRecord?.shiftType || "full");
  const [notes, setNotes] = useState<string>(initialRecord?.notes || "");

  // When selectedDate is changed within the modal, load any existing record
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const existing = records[`${activeUserId}_${newDate}`];
    if (existing) {
      setSelectedShift(existing.shiftType);
      setNotes(existing.notes || "");
    } else {
      setSelectedShift("full");
      setNotes("");
    }
  };

  const handleUserChange = (userId: string) => {
    setActiveUserId(userId);
    const existing = records[`${userId}_${selectedDate}`];
    if (existing) {
      setSelectedShift(existing.shiftType);
      setNotes(existing.notes || "");
    } else {
      setSelectedShift("full");
      setNotes("");
    }
  };

  const parsedDate = useMemo(() => {
    try {
      return parseISO(selectedDate);
    } catch {
      return today;
    }
  }, [selectedDate, today]);

  const dayOfWeek = getDay(parsedDate);
  const isSunday = dayOfWeek === 0;
  const officialHoliday = isOfficialHoliday(selectedDate);

  const currentRecord = records[`${activeUserId}_${selectedDate}`];
  const isPlannedLeave = currentRecord?.shiftType === "leave" && currentRecord?.notes?.includes("Planned Leave");

  const handleSave = () => {
    markAttendance(activeUserId, selectedDate, selectedShift, notes.trim() || undefined);
    onClose();
  };

  const handleDelete = () => {
    deleteAttendance(activeUserId, selectedDate);
    onClose();
  };

  const canEdit =
    currentUser?.role === "admin" || currentUser?.id === activeUserId;

  return (
    <DialogContent className="w-[94vw] sm:max-w-md p-4 sm:p-6 max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold">
              Edit / Log Past Attendance
            </DialogTitle>
            <Badge variant="outline" className="text-[11px] font-mono">
              {activeUser.name}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Select any past or current date to update attendance logs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Admin Employee Switcher */}
          {currentUser?.role === "admin" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employee
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleUserChange(emp.id)}
                    className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors cursor-pointer text-center truncate ${
                      activeUserId === emp.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {emp.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Selector & Quick Past Day Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Date
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDateChange(format(subDays(today, 1), "yyyy-MM-dd"))}
                  className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => handleDateChange(format(subDays(today, 2), "yyyy-MM-dd"))}
                  className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  2 Days Ago
                </button>
                <button
                  type="button"
                  onClick={() => handleDateChange(todayStr)}
                  className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-2.5 text-xs text-muted-foreground shrink-0 cursor-pointer"
                onClick={() => handleDateChange(format(subDays(parsedDate, 1), "yyyy-MM-dd"))}
                title="Previous Day"
              >
                &larr; Prev
              </Button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="flex-1 text-xs h-9 px-3 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-2.5 text-xs text-muted-foreground shrink-0 cursor-pointer"
                onClick={() => handleDateChange(format(addDays(parsedDate, 1), "yyyy-MM-dd"))}
                title="Next Day"
              >
                Next &rarr;
              </Button>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span className="font-medium">{format(parsedDate, "EEEE, MMMM d, yyyy")}</span>
              {currentRecord ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Logged: {SHIFT_CONFIGS[currentRecord.shiftType].label}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  No record yet
                </span>
              )}
            </div>
          </div>

          {isPlannedLeave && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
              <span className="font-semibold">Pre-Marked Leave:</span> Switch this to a Full/Half shift or click Delete below to cancel.
            </div>
          )}

          {officialHoliday && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <div>
                <div className="font-semibold flex items-center gap-1.5">
                  <span>Official Holiday:</span>
                  <span className="text-foreground font-medium">{officialHoliday.title}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Declared company holiday for all ITNETAI team members. Work is not required and attendance is not penalized.
                </div>
              </div>
            </div>
          )}

          {isSunday && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Sunday Note:</span> Non-working weekend day for ITNETAI (Mon&ndash;Sat schedule).
              </div>
            </div>
          )}

          {/* Shift Type Options */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Shift Type
            </label>

            <div className="grid grid-cols-1 gap-2">
              {/* Full Day */}
              <button
                type="button"
                onClick={() => setSelectedShift("full")}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedShift === "full"
                    ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[2px] bg-[#2da44e] dark:bg-[#3fb950] border border-black/10 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Full Shift
                      <Badge variant="emerald" className="text-[10px] py-0 font-mono">
                        8h
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      10:00 &ndash; 18:00 (Standard full workday)
                    </div>
                  </div>
                </div>
                {selectedShift === "full" && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Half Day - Morning */}
              <button
                type="button"
                onClick={() => setSelectedShift("half_morning")}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedShift === "half_morning"
                    ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex shrink-0">
                    <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                    <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Morning Half
                      <Badge variant="outline" className="text-[10px] py-0 font-mono">
                        4h
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      10:00 &ndash; 14:00 (Left-fill box)
                    </div>
                  </div>
                </div>
                {selectedShift === "half_morning" && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Half Day - Afternoon */}
              <button
                type="button"
                onClick={() => setSelectedShift("half_afternoon")}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedShift === "half_afternoon"
                    ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex shrink-0">
                    <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-800" />
                    <div className="w-1/2 h-full bg-[#2da44e] dark:bg-[#3fb950]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Afternoon Half
                      <Badge variant="outline" className="text-[10px] py-0 font-mono">
                        4h
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      14:00 &ndash; 18:00 (Right-fill box)
                    </div>
                  </div>
                </div>
                {selectedShift === "half_afternoon" && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Leave */}
              <button
                type="button"
                onClick={() => setSelectedShift("leave")}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedShift === "leave"
                    ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[2px] border border-zinc-400 dark:border-zinc-600 bg-transparent shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Leave / Absent
                      <Badge variant="destructive" className="text-[10px] py-0 font-mono">
                        0h
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      Not scheduled / Off duty (Hollow box)
                    </div>
                  </div>
                </div>
                {selectedShift === "leave" && <Check className="w-4 h-4 text-rose-500 shrink-0" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remote work, doctor appointment, approved leave"
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between pt-3 border-t border-border gap-2">
          <div>
            {currentRecord && canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 px-2 sm:px-3 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="px-2.5 sm:px-3 cursor-pointer">
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!canEdit}
              className="px-3 cursor-pointer"
            >
              Save Record
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
  );
}
