import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePassword, hashPassword } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findMany({
    include: { user: true },
    orderBy: { staffIdNumber: "asc" },
  });

  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { staffIdNumber, firstName, lastName } = await req.json();

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
}
