import { AttendanceStatus, DayType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getTodayAtMidnight } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = getTodayAtMidnight();

  const [attendance, schedule] = await Promise.all([
    prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.id,
          date: today
        }
      }
    }),
    prisma.scheduleItem.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.id,
          date: today
        }
      }
    })
  ]);

  let resolvedStatus: AttendanceStatus | "NONE" = "NONE";

  if (attendance?.status) {
    resolvedStatus = attendance.status;
  } else if (schedule?.type === DayType.LEAVE || schedule?.type === DayType.SICK) {
    resolvedStatus = AttendanceStatus.ON_LEAVE;
  } else if (schedule?.type === DayType.DAY_OFF || schedule?.type === DayType.HOLIDAY) {
    resolvedStatus = AttendanceStatus.DAY_OFF;
  } else {
    resolvedStatus = AttendanceStatus.ABSENT;
  }

  return NextResponse.json({
    attendance,
    schedule,
    status: resolvedStatus
  });
}
