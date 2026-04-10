import { AttendanceStatus, DayType, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getTodayAtMidnight } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const inputDate = searchParams.get("date");
  const date = inputDate ? new Date(inputDate) : getTodayAtMidnight();
  date.setHours(0, 0, 0, 0);

  const [employees, attendance, offSchedules] = await Promise.all([
    prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        department: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.attendance.findMany({
      where: { date },
      include: {
        employee: {
          select: { id: true, name: true, department: true }
        }
      }
    }),
    prisma.scheduleItem.findMany({
      where: {
        date,
        type: {
          in: [DayType.DAY_OFF, DayType.LEAVE, DayType.SICK, DayType.HOLIDAY]
        }
      },
      include: {
        employee: {
          select: { id: true, name: true, department: true }
        }
      }
    })
  ]);

  const attendanceMap = new Map(attendance.map((a) => [a.employeeId, a]));
  const offMap = new Map(offSchedules.map((s) => [s.employeeId, s]));

  const dailyRows = employees.map((employee) => {
    const entry = attendanceMap.get(employee.id);
    const off = offMap.get(employee.id);

    let status: AttendanceStatus | "OFF" = AttendanceStatus.ABSENT;
    if (entry) {
      status = entry.status;
    } else if (off?.type === DayType.DAY_OFF || off?.type === DayType.HOLIDAY) {
      status = "OFF";
    } else if (off?.type === DayType.LEAVE || off?.type === DayType.SICK) {
      status = AttendanceStatus.ON_LEAVE;
    }

    return {
      employee,
      attendance: entry
        ? {
            timeIn: entry.timeIn,
            timeOut: entry.timeOut,
            workedMinutes: entry.workedMinutes
          }
        : null,
      dayStatus: status,
      scheduleType: off?.type ?? null,
      scheduleNote: off?.note ?? null
    };
  });

  const stats = {
    totalEmployees: employees.length,
    presentCount: dailyRows.filter((row) => row.dayStatus === AttendanceStatus.PRESENT || row.dayStatus === AttendanceStatus.LATE).length,
    leaveCount: dailyRows.filter((row) => row.dayStatus === AttendanceStatus.ON_LEAVE).length,
    offCount: dailyRows.filter((row) => row.dayStatus === "OFF").length,
    absentCount: dailyRows.filter((row) => row.dayStatus === AttendanceStatus.ABSENT).length
  };

  return NextResponse.json({
    date,
    stats,
    rows: dailyRows
  });
}
