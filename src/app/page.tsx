"use client";

import React, { useState } from "react";
import { AttendanceProvider, useAttendance } from "@/lib/attendance-context";
import { Navbar } from "@/components/layout/Navbar";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { LoginPage } from "@/components/auth/LoginPage";

function MainContent() {
  const { currentUser, isLoaded } = useAttendance();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading ITNET Attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar onOpenLoginModal={() => setShowLoginModal(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentUser ? (
          <LoginPage />
        ) : currentUser.role === "admin" ? (
          <AdminDashboard adminUser={currentUser} />
        ) : (
          <EmployeeDashboard user={currentUser} />
        )}
      </main>

      {/* Clean, Minimal Enterprise Footer */}
      <footer className="w-full border-t border-border bg-background py-6 mt-12 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">ITNET Systems</span>
            <span>&bull;</span>
            <span>Monday &ndash; Saturday (10:00 &ndash; 18:00)</span>
          </div>

          <div className="text-[11px] text-muted-foreground">
            Attendance Tracking Portal &bull; GitHub Contribution Model
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
