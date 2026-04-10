import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { email }
    });

    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const response = NextResponse.json({
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });

    await setSessionCookie(response, {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Unable to login." }, { status: 500 });
  }
}
