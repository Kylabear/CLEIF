import { DayType, AttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getTodayAtMidnight } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = getTodayAtMidnight();
  const now = new Date();

  const offToday = await prisma.scheduleItem.findUnique({
    where: {
      employeeId_date: {
        employeeId: user.id,
        date: today
      }
    }
  });

  if (offToday && [DayType.DAY_OFF, DayType.LEAVE, DayType.SICK].includes(offToday.type)) {
    return NextResponse.json(
      {
        error: "This employee is marked as off today and does not need to clock in.",
        scheduleType: offToday.type
      },
      { status: 400 }
    );
  }

  const hour = now.getHours();
  const late = hour >= 9;

  const attendance = await prisma.attendance.upsert({
    where: {
      employeeId_date: {
        employeeId: user.id,
        date: today
      }
    },
    update: {
      timeIn: now,
      status: late ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
    },
    create: {
      employeeId: user.id,
      date: today,
      timeIn: now,
      status: late ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
    }
  });

  return NextResponse.json({ attendance });
}
