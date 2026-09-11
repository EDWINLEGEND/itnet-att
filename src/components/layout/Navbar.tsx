"use client";

import React, { useState } from "react";
import { useAttendance } from "@/lib/attendance-context";
import { User, Role } from "@/types/attendance";
import {
  Users,
  Shield,
  Clock,
  LogOut,
  RotateCcw,
  Moon,
  Sun,
  ChevronDown,
  Sparkles,
  CalendarDays,
} from "lucide-react";

interface NavbarProps {
  onOpenLoginModal?: () => void;
}

export function Navbar({ onOpenLoginModal }: NavbarProps) {
  const { currentUser, users, quickLogin, logout, resetDemoData } = useAttendance();
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleResetData = () => {
    if (confirm("Reset attendance history to demo seed data?")) {
      resetDemoData();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-white tracking-tight text-base">
                ITNET
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                ATTENDANCE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>Mon &ndash; Sat &bull; 10 AM &ndash; 6 PM</span>
            </div>
          </div>
        </div>

        {/* Middle / Quick Switcher for Demo */}
        <div className="hidden md:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Switch:
          </span>
          {users.map((u) => {
            const isSelected = currentUser?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => quickLogin(u.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? u.role === "admin"
                      ? "bg-purple-600 text-white shadow-xs font-semibold"
                      : "bg-emerald-600 text-white shadow-xs font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800"
                }`}
              >
                {u.role === "admin" && <Shield className="w-3 h-3" />}
                <span>{u.name}</span>
                {u.role === "admin" && (
                  <span className="text-[9px] px-1 py-0 rounded bg-white/20 uppercase font-mono">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={handleResetData}
            title="Reset to fresh demo data"
            className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle theme"
            className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Profile button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold font-mono">
                  {currentUser.initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    {currentUser.name}
                    {currentUser.role === "admin" ? (
                      <span className="text-[9px] px-1 py-0.2 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono rounded font-bold">
                        ADMIN
                      </span>
                    ) : (
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono rounded font-bold">
                        STAFF
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate max-w-[110px]">
                    {currentUser.email}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Dropdown Menu */}
              {showSwitchDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSwitchDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-zinc-400">{currentUser.designation}</div>
                    </div>

                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Switch Account
                      </div>
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            quickLogin(u.id);
                            setShowSwitchDropdown(false);
                          }}
                          className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors ${
                            currentUser.id === u.id
                              ? "bg-zinc-100 dark:bg-zinc-800 font-semibold text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-mono">
                              {u.initials}
                            </div>
                            <span>{u.name}</span>
                          </div>
                          {u.role === "admin" && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 font-mono">
                              Admin
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          logout();
                          setShowSwitchDropdown(false);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
