import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId") || undefined;
  const subjectId = searchParams.get("subjectId") || undefined;
  const staffId = searchParams.get("staffId") || undefined;

  const where: {
    status: "SUBMITTED";
    classId?: string;
    subjectId?: string;
    staffId?: string;
  } = { status: "SUBMITTED" };
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (staffId) where.staffId = staffId;

  const results = await prisma.result.findMany({
    where,
    include: {
      student: { include: { user: true } },
      subject: true,
      classroom: true,
      term: true,
      staff: { include: { user: true } },
    },
    orderBy: [{ classroom: { name: "asc" } }, { subject: { name: "asc" } }, { createdAt: "desc" }],
  });

  return NextResponse.json(results);
}
