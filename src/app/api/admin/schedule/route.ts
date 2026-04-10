import { DayType, UserRole } from "@prisma/client";
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

  const [employees, schedules] = await Promise.all([
    prisma.employee.findMany({
      where: { isActive: true },
      select: { id: true, name: true, department: true },
      orderBy: { name: "asc" }
    }),
    prisma.scheduleItem.findMany({
      where: { date },
      include: {
        employee: {
          select: { id: true, name: true, department: true }
        }
      },
      orderBy: {
        employee: { name: "asc" }
      }
    })
  ]);

  return NextResponse.json({ employees, schedules });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const employeeId = String(body.employeeId || "");
    const rawType = String(body.type || "") as DayType;
    const note = body.note ? String(body.note) : null;
    const date = new Date(String(body.date || ""));

    if (!employeeId || !rawType || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "employeeId, date, and type are required." }, { status: 400 });
    }

    date.setHours(0, 0, 0, 0);

    if (!Object.values(DayType).includes(rawType)) {
      return NextResponse.json({ error: "Invalid schedule type." }, { status: 400 });
    }

    const schedule = await prisma.scheduleItem.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date
        }
      },
      update: {
        type: rawType,
        note
      },
      create: {
        employeeId,
        date,
        type: rawType,
        note
      }
    });

    return NextResponse.json({ schedule });
  } catch {
    return NextResponse.json({ error: "Failed to save schedule." }, { status: 500 });
  }
}
