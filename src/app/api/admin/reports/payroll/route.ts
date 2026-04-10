import { AttendanceStatus, DayType, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseDateParam(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const normalized = String(cell ?? "");
          const escaped = normalized.replaceAll('"', '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");
}

function minutesToHours(minutes: number) {
  return (minutes / 60).toFixed(2);
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = parseDateParam(searchParams.get("from"));
  const to = parseDateParam(searchParams.get("to"));

  if (!from || !to) {
    return NextResponse.json({ error: "Valid from and to dates are required (YYYY-MM-DD)." }, { status: 400 });
  }

  if (from > to) {
    return NextResponse.json({ error: "From date must be before or equal to To date." }, { status: 400 });
  }

  const endOfTo = new Date(to);
  endOfTo.setHours(23, 59, 59, 999);

  const [employees, attendanceRows, schedules] = await Promise.all([
    prisma.employee.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, department: true },
      orderBy: { name: "asc" }
    }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: from,
          lte: endOfTo
        }
      },
      select: {
        employeeId: true,
        date: true,
        status: true,
        workedMinutes: true
      }
    }),
    prisma.scheduleItem.findMany({
      where: {
        date: {
          gte: from,
          lte: endOfTo
        }
      },
      select: {
        employeeId: true,
        date: true,
        type: true
      }
    })
  ]);

  const attendanceByEmployee = new Map<string, { status: AttendanceStatus; workedMinutes: number; date: string }[]>();
  for (const row of attendanceRows) {
    const key = row.employeeId;
    const list = attendanceByEmployee.get(key) ?? [];
    list.push({
      status: row.status,
      workedMinutes: row.workedMinutes ?? 0,
      date: row.date.toISOString().slice(0, 10)
    });
    attendanceByEmployee.set(key, list);
  }

  const scheduleByEmployee = new Map<string, { type: DayType; date: string }[]>();
  for (const row of schedules) {
    const key = row.employeeId;
    const list = scheduleByEmployee.get(key) ?? [];
    list.push({
      type: row.type,
      date: row.date.toISOString().slice(0, 10)
    });
    scheduleByEmployee.set(key, list);
  }

  const csvRows: string[][] = [
    [
      "Employee Name",
      "Email",
      "Department",
      "Range Start",
      "Range End",
      "Present Days",
      "Late Days",
      "Leave Days",
      "Day Off / Holiday Days",
      "Absent Days",
      "Worked Minutes",
      "Worked Hours",
      "Overtime Minutes",
      "Overtime Hours"
    ]
  ];

  for (const employee of employees) {
    const employeeAttendance = attendanceByEmployee.get(employee.id) ?? [];
    const employeeSchedules = scheduleByEmployee.get(employee.id) ?? [];

    const presentDays = employeeAttendance.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const lateDays = employeeAttendance.filter((a) => a.status === AttendanceStatus.LATE).length;

    const leaveDays = employeeSchedules.filter((s) => s.type === DayType.LEAVE || s.type === DayType.SICK).length;
    const dayOffDays = employeeSchedules.filter((s) => s.type === DayType.DAY_OFF || s.type === DayType.HOLIDAY).length;

    const workedMinutes = employeeAttendance.reduce((sum, row) => sum + (row.workedMinutes ?? 0), 0);
    const overtimeMinutes = employeeAttendance.reduce((sum, row) => {
      const overtimeForDay = Math.max(0, (row.workedMinutes ?? 0) - 480);
      return sum + overtimeForDay;
    }, 0);

    const daysInRange = Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
    const attendanceDays = employeeAttendance.length;
    const nonWorkingDays = leaveDays + dayOffDays;
    const absentDays = Math.max(0, daysInRange - attendanceDays - nonWorkingDays);

    csvRows.push([
      employee.name,
      employee.email,
      employee.department ?? "",
      from.toISOString().slice(0, 10),
      to.toISOString().slice(0, 10),
      String(presentDays),
      String(lateDays),
      String(leaveDays),
      String(dayOffDays),
      String(absentDays),
      String(workedMinutes),
      minutesToHours(workedMinutes),
      String(overtimeMinutes),
      minutesToHours(overtimeMinutes)
    ]);
  }

  const csv = toCsv(csvRows);
  const filename = `payroll-attendance-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${filename}`
    }
  });
}
