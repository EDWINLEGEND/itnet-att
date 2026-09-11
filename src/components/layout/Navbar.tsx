"use client";

import React, { useState } from "react";
import { useAttendance } from "@/lib/attendance-context";
import {
  Clock,
  LogOut,
  RotateCcw,
  Moon,
  Sun,
  ChevronDown,
  Shield,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onOpenLoginModal?: () => void;
}

export function Navbar({ onOpenLoginModal }: NavbarProps) {
  const { currentUser, users, quickLogin, logout, resetDemoData } = useAttendance();
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground tracking-tight text-sm">
              ITNET Attendance
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-normal text-muted-foreground border-border">
              Mon&ndash;Sat &bull; 10:00 &ndash; 18:00
            </Badge>
          </div>
        </div>

        {/* Center: Account Switcher for Demo testing */}
        <div className="hidden md:flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/80">
          <span className="text-[11px] font-medium text-muted-foreground px-2">
            Switch:
          </span>
          {users.map((u) => {
            const isSelected = currentUser?.id === u.id;
            return (
              <Button
                key={u.id}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={() => quickLogin(u.id)}
                className={`h-7 px-2.5 text-xs ${
                  isSelected ? "shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {u.role === "admin" && <Shield className="w-3 h-3 mr-1 opacity-70" />}
                <span>{u.name}</span>
                {u.role === "admin" && (
                  <span className="ml-1 text-[9px] px-1 py-0 rounded bg-muted/80 text-foreground font-mono">
                    Admin
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mobile switcher select */}
          <div className="md:hidden">
            <select
              value={currentUser?.id || ""}
              onChange={(e) => quickLogin(e.target.value)}
              className="text-xs h-8 px-2 bg-muted border border-border rounded-md text-foreground focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.role === "admin" ? "(Admin)" : ""}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetData}
            title="Reset to default demo data"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>

          {/* User profile dropdown */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 pl-1.5 pr-2.5 border-border"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {currentUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{currentUser.name}</span>
                  {currentUser.role === "admin" ? (
                    <Badge variant="purple" className="text-[10px] px-1 py-0 h-4">
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-muted-foreground">
                      Staff
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-semibold text-foreground">{currentUser.name}</div>
                  <div className="text-[11px] text-muted-foreground font-normal">
                    {currentUser.designation}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
                    {currentUser.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Switch Account
                </div>
                {users.map((u) => (
                  <DropdownMenuItem
                    key={u.id}
                    onClick={() => quickLogin(u.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{u.name}</span>
                    {u.role === "admin" && (
                      <span className="text-[10px] font-mono text-purple-500">Admin</span>
                    )}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-rose-600 dark:text-rose-400 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={onOpenLoginModal}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
