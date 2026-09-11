"use client";

import React, { useState, useEffect } from "react";
import { User, DayAttendance, ShiftType } from "@/types/attendance";
import { SHIFT_CONFIGS } from "@/lib/constants";
import { useAttendance } from "@/lib/attendance-context";
import { format } from "date-fns";
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
import { Check, Trash2, Calendar, AlertCircle } from "lucide-react";

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

  if (!day) return null;

  const handleSave = () => {
    markAttendance(targetUser.id, day.date, selectedShift, notes.trim() || undefined);
    onClose();
  };

  const handleDelete = () => {
    deleteAttendance(targetUser.id, day.date);
    onClose();
  };

  const canEdit =
    currentUser?.role === "admin" || currentUser?.id === targetUser.id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold">
              Log Attendance
            </DialogTitle>
            <Badge variant="outline" className="text-[11px] font-mono">
              {targetUser.name}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {format(day.dateObj, "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {day.isSunday && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Sunday Note:</span> Non-working weekend day for ITNET (Mon&ndash;Sat schedule).
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Shift Type
            </label>

            <div className="grid grid-cols-1 gap-2">
              {/* Full Day */}
              <button
                type="button"
                onClick={() => setSelectedShift("full")}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  selectedShift === "full"
                    ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[2px] bg-[#216e39] dark:bg-[#39d353] border border-black/10 shrink-0" />
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
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  selectedShift === "half_morning"
                    ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex shrink-0">
                    <div className="w-1/2 h-full bg-[#30a14e] dark:bg-[#26a641]" />
                    <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-900" />
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
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  selectedShift === "half_afternoon"
                    ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[2px] border border-zinc-300 dark:border-zinc-700 overflow-hidden relative flex shrink-0">
                    <div className="w-1/2 h-full bg-zinc-100 dark:bg-zinc-900" />
                    <div className="w-1/2 h-full bg-[#30a14e] dark:bg-[#26a641]" />
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
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  selectedShift === "leave"
                    ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[2px] border border-zinc-400 dark:border-zinc-600 bg-transparent shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Leave / Absent
                      <Badge variant="destructive" className="text-[10px] py-0 font-mono">
                        0h
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Not scheduled / Off duty (Hollow box)
                    </div>
                  </div>
                </div>
                {selectedShift === "leave" && <Check className="w-4 h-4 text-rose-500" />}
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
              placeholder="e.g. Remote work, dentist appointment, approved casual leave"
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t border-border">
          <div>
            {day.record && canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!canEdit}
            >
              Save Record
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
