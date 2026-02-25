import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignments = await prisma.staffAssignment.findMany({
    include: {
      staff: { include: { user: true } },
      classroom: true,
      subject: true,
    },
    orderBy: { classroom: { name: "asc" } },
  });

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { staffId, classId, subjectId } = await req.json();

  const assignment = await prisma.staffAssignment.create({
    data: { staffId, classId, subjectId: subjectId ?? null },
    include: {
      staff: { include: { user: true } },
      classroom: true,
      subject: true,
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
