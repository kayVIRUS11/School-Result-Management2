import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      include: { user: true, classroom: true },
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    return NextResponse.json({
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      regNumber: student.regNumber,
      className: student.classroom.name,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
