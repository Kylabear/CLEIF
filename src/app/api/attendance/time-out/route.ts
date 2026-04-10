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

  const attendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId: user.id,
        date: today
      }
    }
  });

  if (!attendance?.timeIn) {
    return NextResponse.json({ error: "Clock in first before clocking out." }, { status: 400 });
  }

  const workedMinutes = Math.max(0, Math.round((now.getTime() - attendance.timeIn.getTime()) / 60000));

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      timeOut: now,
      workedMinutes
    }
  });

  return NextResponse.json({ attendance: updated });
}
