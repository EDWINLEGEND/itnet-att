"use client";

import React, { useState } from "react";
import { AttendanceProvider, useAttendance } from "@/lib/attendance-context";
import { Navbar } from "@/components/layout/Navbar";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { LoginPage } from "@/components/auth/LoginPage";
import { Clock, Shield, Users, HeartHandshake } from "lucide-react";

function MainContent() {
  const { currentUser, isLoaded } = useAttendance();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Loading ITNET Attendance System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar onOpenLoginModal={() => setShowLoginModal(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!currentUser ? (
          <LoginPage />
        ) : currentUser.role === "admin" ? (
          <AdminDashboard adminUser={currentUser} />
        ) : (
          <EmployeeDashboard user={currentUser} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xs py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">ITNET Systems</span>
            <span>&bull;</span>
            <span>Monday to Saturday Schedule (10:00 AM &ndash; 6:00 PM)</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Commits Heatmap Tracker
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AttendanceProvider>
      <MainContent />
    </AttendanceProvider>
  );
}
