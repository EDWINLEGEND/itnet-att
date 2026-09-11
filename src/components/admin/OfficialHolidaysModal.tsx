"use client";

import React, { useState, useMemo } from "react";
import { useAttendance } from "@/lib/attendance-context";
import { format, parseISO, startOfDay, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Sparkles, Plus } from "lucide-react";

interface OfficialHolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OfficialHolidaysModal({ isOpen, onClose }: OfficialHolidaysModalProps) {
  const { holidays, addHoliday, deleteHoliday } = useAttendance();

  const tomorrowStr = useMemo(() => {
    return format(addDays(startOfDay(new Date()), 1), "yyyy-MM-dd");
  }, []);

  const [date, setDate] = useState<string>(tomorrowStr);
  const [title, setTitle] = useState<string>("");

  const sortedHolidays = useMemo(() => {
    return Object.values(holidays).sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    addHoliday(date, title.trim() || "Official Holiday");
    setTitle("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[94vw] sm:max-w-md p-4 sm:p-6 max-h-[92vh] overflow-y-auto rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Official Company Holidays
            </DialogTitle>
            <Badge variant="emerald" className="text-[10px] font-mono">
              Admin
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Set company-wide paid holidays. These apply to all team members and are excluded from workdays like Sundays.
          </DialogDescription>
        </DialogHeader>

        {/* Add Holiday Form */}
        <form onSubmit={handleAdd} className="space-y-3 pt-3 pb-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Declare New Holiday
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs h-9 px-3 bg-muted/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 border-0"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Holiday Name / Occasion
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Onam Festival, Gandhi Jayanti, Founders Day"
                required
                className="w-full text-xs h-9 px-3 bg-muted/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 border-0"
              />
            </div>

            <Button type="submit" size="sm" className="w-full h-9 text-xs gap-1.5 cursor-pointer mt-1 rounded-xl bg-black hover:bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs border-0">
              <Plus className="w-3.5 h-3.5" />
              <span>Set Official Holiday</span>
            </Button>
          </div>
        </form>

        {/* List of Declared Holidays */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Declared Holidays ({sortedHolidays.length})
            </span>
          </div>

          {sortedHolidays.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground rounded-2xl bg-muted/30 shadow-2xs">
              No official holidays declared yet. Use the form above to add one.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {sortedHolidays.map((h) => {
                let parsed: Date;
                try {
                  parsed = parseISO(h.date);
                } catch {
                  parsed = new Date();
                }

                return (
                  <div
                    key={h.date}
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{h.title}</span>
                          <Badge variant="amber" className="text-[10px] py-0 font-mono">
                            Holiday
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {format(parsed, "EEEE, MMMM d, yyyy")}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteHoliday(h.date)}
                      title="Delete holiday"
                      className="text-muted-foreground hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
