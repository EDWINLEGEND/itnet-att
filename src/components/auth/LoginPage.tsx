"use client";

import React, { useState } from "react";
import { useAttendance } from "@/lib/attendance-context";
import {
  CalendarDays,
  Shield,
  Clock,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function LoginPage() {
  const { users, login } = useAttendance();
  const [email, setEmail] = useState("shan@itnet.com");
  const [password, setPassword] = useState("shan123");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(email, password);
    if (!success) {
      setError("Invalid credentials. Please select one of the accounts below.");
    }
  };

  const handleSelectQuickUser = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    login(userEmail, userPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <Card className="w-full max-w-4xl border-border overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Schedule & Quick Accounts */}
          <div className="p-6 sm:p-8 bg-muted/20 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground">
                    ITNET Attendance
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Internal Attendance Tracking System
                  </p>
                </div>
              </div>

              {/* Working Hours & Shift Rules */}
              <div className="p-4 rounded-lg bg-background border border-border space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Working Hours & Shifts</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Workdays:</span>
                    <span className="font-medium text-foreground">Monday &ndash; Saturday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Full Day:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      10:00 &ndash; 18:00 (8h)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Morning Shift:</span>
                    <span className="font-mono text-foreground font-medium">
                      10:00 &ndash; 14:00 (4h)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Afternoon Shift:</span>
                    <span className="font-mono text-foreground font-medium">
                      14:00 &ndash; 18:00 (4h)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sunday:</span>
                    <span className="text-muted-foreground/70">Non-working (Off)</span>
                  </div>
                </div>
              </div>

              {/* Instant 1-Click Access List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Access Accounts
                </div>

                <div className="space-y-1.5">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectQuickUser(u.email, u.password)}
                      className="w-full p-2.5 rounded-lg border border-border bg-background hover:bg-muted/40 flex items-center justify-between transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">
                            {u.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            {u.name}
                            {u.role === "admin" && (
                              <Badge variant="purple" className="text-[9px] px-1 py-0 h-4">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{u.designation}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground pt-3 border-t border-border">
              ITNET Internal Systems &bull; Confidential
            </div>
          </div>

          {/* Right Column: Standard Login Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-bold text-foreground">Sign In</h2>
              <p className="text-xs text-muted-foreground">
                Enter your credentials or click any account on the left
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. shan@itnet.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2">
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Quick credentials reference */}
            <div className="mt-8 p-3 rounded-lg border border-border/70 bg-muted/20 text-xs space-y-1">
              <span className="font-semibold text-muted-foreground">Demo Credentials:</span>
              <div className="text-[11px] text-muted-foreground font-mono space-y-0.5">
                <div>Admin: admin@itnet.com / admin123</div>
                <div>Employees: [shan|edwin|able|devdath]@itnet.com / [name]123</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
