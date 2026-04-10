import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const employeeId = String(body.employeeId || "").trim();
    const newPassword = String(body.newPassword || "").trim();

    if (!employeeId || !newPassword) {
      return NextResponse.json({ error: "employeeId and newPassword are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        role: UserRole.EMPLOYEE,
        isActive: true
      },
      select: { id: true }
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.employee.update({
      where: { id: employee.id },
      data: { passwordHash }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
