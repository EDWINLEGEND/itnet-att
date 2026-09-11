"use client";

import React, { useState } from "react";
import { useAttendance } from "@/lib/attendance-context";
import {
  CalendarDays,
  Shield,
  UserCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  AlertCircle,
} from "lucide-react";

export function LoginPage() {
  const { users, login, quickLogin } = useAttendance();
  const [email, setEmail] = useState("shan@itnet.com");
  const [password, setPassword] = useState("shan123");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(email, password);
    if (!success) {
      setError("Invalid email or password. Please use pre-configured demo credentials.");
    }
  };

  const handleSelectQuickUser = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    login(userEmail, userPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side: Schedule & Credentials */}
        <div className="p-8 flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950/60 border-r border-zinc-100 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  ITNET Attendance
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  GitHub-Style Attendance Tracker
                </p>
              </div>
            </div>

            {/* Shift Timings Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Working Schedule & Shifts</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Working Days:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    Monday &ndash; Saturday (6 Days)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Full Day Shift:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-[1.5px] bg-emerald-500 inline-block" />
                    10:00 AM &ndash; 6:00 PM (8h)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Morning Half:</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-[1.5px] border border-zinc-400 overflow-hidden inline-flex">
                      <span className="w-1/2 h-full bg-emerald-500" />
                      <span className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-800" />
                    </span>
                    10:00 AM &ndash; 2:00 PM (4h)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Afternoon Half:</span>
                  <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-[1.5px] border border-zinc-400 overflow-hidden inline-flex">
                      <span className="w-1/2 h-full bg-zinc-200 dark:bg-zinc-800" />
                      <span className="w-1/2 h-full bg-emerald-500" />
                    </span>
                    2:00 PM &ndash; 6:00 PM (4h)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Sunday:</span>
                  <span className="text-zinc-400 italic">Off / Non-Working</span>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Login options */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant 1-Click Access</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectQuickUser(u.email, u.password)}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-zinc-900 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs font-mono group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-colors">
                        {u.initials}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          {u.name}
                          {u.role === "admin" && (
                            <span className="text-[9px] px-1 py-0 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400">{u.designation}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 text-center mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
            Internal Attendance Portal &bull; ITNET Systems
          </div>
        </div>

        {/* Right Side: Standard Login Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select an account on the left or enter credentials manually
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. shan@itnet.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Helper Credentials Callout */}
          <div className="mt-8 p-3.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Available Accounts:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <li>&bull; <strong>Admin</strong>: admin@itnet.com / admin123</li>
              <li>&bull; <strong>Shan</strong>: shan@itnet.com / shan123</li>
              <li>&bull; <strong>Edwin</strong>: edwin@itnet.com / edwin123</li>
              <li>&bull; <strong>Able</strong>: able@itnet.com / able123</li>
              <li>&bull; <strong>Devdath</strong>: devdath@itnet.com / devdath123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
