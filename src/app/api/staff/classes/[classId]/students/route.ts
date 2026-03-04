import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const staff = await prisma.staff.findFirst({ where: { userId: session.user.id } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const assignment = await prisma.staffAssignment.findFirst({
      where: { staffId: staff.id, classId: params.classId },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Not authorized for this class" }, { status: 403 });
    }

    const students = await prisma.student.findMany({
      where: { classId: params.classId },
      include: { user: true },
      orderBy: { regNumber: "asc" },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
