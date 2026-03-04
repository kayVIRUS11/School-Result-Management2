import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { classId: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const staff = await prisma.staff.findFirst({ where: { userId: session.user.id } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    // Verify the staff member has an assignment for this class
    const assignment = await prisma.staffAssignment.findFirst({
      where: { staffId: staff.id, classId: params.classId },
    });
    if (!assignment) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const classSubjects = await prisma.classSubject.findMany({
      where: { classId: params.classId },
      include: { subject: true },
    });

    return NextResponse.json(classSubjects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
