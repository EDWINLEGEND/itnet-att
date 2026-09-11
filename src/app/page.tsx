"use client";

import React from "react";
import { AttendanceProvider, useAttendance } from "@/lib/attendance-context";
import { Navbar } from "@/components/layout/Navbar";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { LoginPage } from "@/components/auth/LoginPage";
import { BottomNav } from "@/components/layout/BottomNav";

function MainContent() {
  const { currentUser, isLoaded } = useAttendance();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading ITNETAI Attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors relative">
      <Navbar />

      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 ${
        !currentUser
          ? "flex items-center justify-center min-h-[calc(100dvh-3.5rem)] py-2"
          : "py-6 pb-28 sm:pb-32"
      }`}>
        {!currentUser ? (
          <LoginPage />
        ) : currentUser.role === "admin" ? (
          <AdminDashboard adminUser={currentUser} />
        ) : (
          <EmployeeDashboard user={currentUser} />
        )}
      </main>

      {currentUser && (
        <footer className="w-full border-t border-border bg-background py-4 mb-20 text-xs text-muted-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <span className="font-semibold text-foreground">ITNETAI</span>
            <span className="text-[11px]">10:00 &ndash; 18:00 (Mon&ndash;Sat)</span>
          </div>
        </footer>
      )}

      {/* 5-Option Bottom Navigation Dock */}
      <BottomNav />
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
