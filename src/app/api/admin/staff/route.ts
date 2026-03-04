import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePassword, hashPassword } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const staff = await prisma.staff.findMany({
      include: { user: true },
      orderBy: { staffIdNumber: "asc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { staffIdNumber, firstName, lastName } = await req.json();

    if (!staffIdNumber || !firstName || !lastName) {
      return NextResponse.json({ error: "staffIdNumber, firstName, and lastName are required" }, { status: 400 });
    }

    const generatedPassword = generatePassword();
    const passwordHash = await hashPassword(generatedPassword);
    const username = staffIdNumber.toLowerCase();

    const user = await prisma.user.create({
      data: { role: "STAFF", username, passwordHash, firstName, lastName },
    });

    const staff = await prisma.staff.create({
      data: { userId: user.id, staffIdNumber },
      include: { user: true },
    });

    return NextResponse.json({ staff, generatedPassword }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
