import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePassword, hashPassword } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    include: { user: true, classroom: true },
    orderBy: { regNumber: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { regNumber, firstName, lastName, classId, guardianName, guardianPhone } = await req.json();

  const generatedPassword = generatePassword();
  const passwordHash = await hashPassword(generatedPassword);
  const username = regNumber.toLowerCase();

  const user = await prisma.user.create({
    data: { role: "STUDENT", username, passwordHash, firstName, lastName },
  });

  const student = await prisma.student.create({
    data: { userId: user.id, regNumber, classId, guardianName, guardianPhone },
    include: { user: true, classroom: true },
  });

  return NextResponse.json({ student, generatedPassword }, { status: 201 });
}
