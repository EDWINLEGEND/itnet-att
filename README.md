# ITNET Attendance Tracker

A modern, enterprise-grade attendance tracking system built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** components. Designed specifically for companies operating on a **Monday-to-Saturday** schedule, featuring a **GitHub commits-style contribution heatmap**.

---

## 📅 Schedule & Shift Structure

- **Working Days**: Monday through Saturday (6 days a week)
- **Non-Working Days**: Sunday (marked as weekend off)
- **Shift Timings & Representation**:
  | Shift Type | Hours | Working Window | Heatmap Visual Representation |
  | :--- | :---: | :---: | :--- |
  | **Full Day Shift** | 8 hrs | `10:00 AM – 6:00 PM` | **Full box filled** (Solid GitHub green) |
  | **Morning Half Shift** | 4 hrs | `10:00 AM – 2:00 PM` | **Left half filled**, right half empty |
  | **Afternoon Half Shift** | 4 hrs | `2:00 PM – 6:00 PM` | **Right half filled**, left half empty |
  | **On Leave / Absent** | 0 hrs | Off Duty | **No fill** (Hollow bordered box) |
  | **Sunday (Weekend)** | 0 hrs | Off Duty | Muted non-working square |

---

## 👥 User Accounts & Credentials

The system comes pre-configured with 5 user accounts: **1 Admin** and **4 Employees**.

| Role | Name | Email | Password | Designation |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Marcus Vance / Admin | `admin@itnet.com` | `admin123` | Operations & HR Admin |
| **Employee** | Shan | `shan@itnet.com` | `shan123` | Senior Software Engineer |
| **Employee** | Edwin | `edwin@itnet.com` | `edwin123` | Full Stack Developer |
| **Employee** | Able | `able@itnet.com` | `able123` | Backend & Systems Lead |
| **Employee** | Devdath | `devdath@itnet.com` | `devdath123` | UI/UX & Frontend Engineer |

> **Quick Switcher**: The navigation bar includes an instant account switcher for testing and demonstration without manually logging out and re-typing passwords.

---

## ✨ Features

### 1. GitHub Commits-Style Attendance Heatmap
- Continuous week-by-week contribution grid (selectable 14, 24, or 32 weeks).
- Rows mapped from Monday to Sunday, with Monday–Saturday highlighted as official working days.
- Precision split-fill cells for Morning (left) and Afternoon (right) half-shifts.
- Rich tooltips powered by Radix UI showing exact shift time range, notes, and formatted date.
- GitHub-authentic legend (`Less [ ][ ][ ][ ] More`).

### 2. Employee Portal
- **Today's Status Card**: Displays current clock-in state with 1-click action buttons:
  - `Full Shift (10-6)`
  - `Morning Half (10-2)`
  - `Afternoon Half (2-6)`
  - `On Leave (0h)`
- **Personal Attendance Metrics**: Real-time attendance rate %, full shifts count, half-shift breakdown, and total hours worked.
- **Recent 30-Day History Table**: Filterable by Full, Half, or Leave, with notes and edit options.

### 3. Admin Control Center
- **Executive Overview**: Average company attendance rate %, present count, half-shift count, and on-leave count.
- **Team Roster & 90-Day Analytics**: Summary table of Shan, Edwin, Able, and Devdath with attendance percentages and hours.
- **Segmented Contribution Grids**: View all 4 heatmaps stacked or switch between individual tabs to eliminate clutter.
- **CSV Report Export**: 1-click download of company attendance reports in `.csv` format.
- **Attendance Override**: Admin can select any past or future date to log or adjust shifts on behalf of any team member.

### 4. Enterprise Design System (shadcn/ui)
- Built on accessible Radix UI primitives (`Dialog`, `DropdownMenu`, `Tabs`, `Tooltip`, `Avatar`, `Table`).
- Zero AI slop: crisp, industrial minimalism with precision typography and generous whitespace.
- Light mode & Dark mode toggle with persistent styling tokens.
- Fully responsive across mobile, tablet, laptop, and ultra-wide displays.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Primitives**: [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Utilities**: [date-fns](https://date-fns.org/)
- **State & Persistence**: React Context API with `localStorage` persistence and 1-click demo data reset.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port indicated in terminal) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css           # shadcn theme tokens & GitHub commit colors
│   ├── layout.tsx            # Root HTML layout & fonts
│   └── page.tsx              # Main shell (Auth router & layout)
├── components/
│   ├── attendance/
│   │   └── MarkAttendanceModal.tsx  # Shift selection modal (Full/Half/Leave)
│   ├── auth/
│   │   └── LoginPage.tsx            # Enterprise authentication & quick login
│   ├── dashboard/
│   │   ├── AdminDashboard.tsx       # Admin controls, roster table, CSV export
│   │   └── EmployeeDashboard.tsx    # Employee punch card & personal logs
│   ├── heatmap/
│   │   ├── AttendanceHeatmap.tsx    # GitHub contribution grid component
│   │   └── HeatmapCell.tsx          # Split-fill and tooltip cell logic
│   ├── layout/
│   │   └── Navbar.tsx               # Header with user switcher & theme toggle
│   └── ui/                          # shadcn UI primitives
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── tooltip.tsx
├── lib/
│   ├── attendance-context.tsx       # Context provider, state & persistence
│   ├── constants.ts                # Schedule (10-6, Mon-Sat), users, shifts
│   ├── mock-data.ts                # Historical seed data generator
│   └── utils.ts                    # Class variance & merging utilities
└── types/
    └── attendance.ts               # TypeScript interfaces & types
```

---

## 📄 License

Internal proprietary software for ITNET Systems.
