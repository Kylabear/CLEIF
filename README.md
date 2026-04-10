# LEIF Attendance System (Next.js + MySQL + Vercel)

A mobile-friendly attendance platform for small teams that replaces Excel tracking with a web app.

## Why this solves the current pain points

- Employees can clock in/out from any browser (including phones without Excel).
- Employees marked as day-off or leave are not forced to submit attendance.
- Admin can still see who is present, late, absent, on leave, or day off.
- Built with Next.js for Vercel deployment and Prisma for MySQL.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS (glassmorphic, responsive UI)
- Prisma ORM + MySQL
- Cookie-based JWT session auth

## Features implemented

- Login and logout (employee/admin roles)
- Employee dashboard
- Time in
- Time out
- Daily attendance status
- Auto handling of leave/day-off records
- Admin dashboard by selected date
- Daily summary cards: present, leave, off, absent
- Employee status table with attendance and schedule note
- Admin schedule planner to add/update day-off and leave entries
- Exportable payroll-ready CSV reports (date range)

## Data model

- Employee
- Attendance
- ScheduleItem

Schedule types:

- DAY_OFF
- LEAVE
- SICK
- HOLIDAY

Attendance statuses:

- PRESENT
- LATE
- ABSENT
- ON_LEAVE
- DAY_OFF

## Local setup

1. Install dependencies:
    - `npm install`
2. Copy env file:
    - `copy .env.example .env`
3. Update `.env` with your MySQL connection:
    - `DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/leif_attendance"`
    - `SESSION_SECRET="replace-with-a-32-char-secret"`
4. Create DB tables:
    - `npx prisma db push`
5. Seed demo accounts and sample schedule:
    - `npm run db:seed`
6. Start dev server:
    - `npm run dev`

## Demo users

- Admin
  - Email: `admin@leif.local`
  - Password: `Admin@123`
- Employee
  - Email: `staff@leif.local`
  - Password: `Employee@123`

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Set environment variables in Vercel Project Settings:
    - `DATABASE_URL`
    - `SESSION_SECRET`
    - `APP_URL` (optional)
4. Deploy.

### MySQL hosting options

- PlanetScale
- Railway MySQL
- Neon MySQL-compatible options
- Existing company-managed MySQL server

## API overview

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `POST /api/attendance/time-in`
- `POST /api/attendance/time-out`
- `GET /api/attendance/today`
- `GET /api/admin/dashboard?date=YYYY-MM-DD`
- `GET /api/admin/schedule?date=YYYY-MM-DD`
- `POST /api/admin/schedule`
- `GET /api/admin/reports/payroll?from=YYYY-MM-DD&to=YYYY-MM-DD`

## Practical policy recommendation

To match your requirement:

- Employees on day-off/leave should not be required to clock in/out.
- Their status should be pre-set via schedule entries.
- Attendance should be required only for expected working days.

This project already enforces that behavior in the attendance APIs.
