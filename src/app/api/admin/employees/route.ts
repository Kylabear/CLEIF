import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const employees = await prisma.employee.findMany({
    where: {
      isActive: true,
      role: UserRole.EMPLOYEE
    },
    select: {
      id: true,
      name: true,
      email: true,
      department: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return NextResponse.json({ employees });
}
