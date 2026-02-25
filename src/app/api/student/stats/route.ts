import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
  });

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const currentTerm = await prisma.term.findFirst({
    where: { isCurrent: true },
    include: { session: true },
  });

  const [totalSubjects, resultsAvailable, allApprovedResults] = await Promise.all([
    prisma.classSubject.count({ where: { classId: student.classId } }),
    prisma.result.count({
      where: {
        studentId: student.id,
        status: "APPROVED",
        ...(currentTerm ? { termId: currentTerm.id } : {}),
      },
    }),
    prisma.result.findMany({
      where: { studentId: student.id, status: "APPROVED" },
      select: { total: true },
    }),
  ]);

  const averageScore =
    allApprovedResults.length > 0
      ? Math.round((allApprovedResults.reduce((sum: number, r: { total: number }) => sum + r.total, 0) / allApprovedResults.length) * 10) / 10
      : 0;

  return NextResponse.json({
    totalSubjects,
    resultsAvailable,
    averageScore,
    currentTerm: currentTerm?.name ?? null,
    currentSession: currentTerm?.session.name ?? null,
  });
}
