import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function getGrade(
  total: number,
  scale: { minScore: number; maxScore: number; grade: string; remark: string }[]
): { grade: string; remark: string } {
  for (const entry of scale) {
    if (total >= entry.minScore && total <= entry.maxScore) {
      return { grade: entry.grade, remark: entry.remark };
    }
  }
  return { grade: "F", remark: "Fail" };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const staff = await prisma.staff.findFirst({ where: { userId: session.user.id } });
    if (!staff) return NextResponse.json([]);

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") ?? undefined;
    const subjectId = searchParams.get("subjectId") ?? undefined;
    const termId = searchParams.get("termId") ?? undefined;

    const results = await prisma.result.findMany({
      where: {
        staffId: staff.id,
        ...(classId ? { classId } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(termId ? { termId } : {}),
      },
      include: {
        student: { include: { user: true } },
        subject: true,
        classroom: true,
        term: true,
        session: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findFirst({ where: { userId: session.user.id } });
  if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  try {
    const { results, status } = await req.json() as {
      results: {
        studentId: string;
        subjectId: string;
        classId: string;
        sessionId: string;
        termId: string;
        ca1: number;
        ca2: number;
        ca3: number;
        exam: number;
      }[];
      status: "DRAFT" | "SUBMITTED";
    };

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: "No results provided" }, { status: 400 });
    }

    const gradingScale = await prisma.gradingScale.findMany({ orderBy: { minScore: "desc" } });

    // Validate that results are being submitted for the currently active term
    const activeTerm = await prisma.term.findFirst({ where: { isCurrent: true }, include: { session: true } });
    if (!activeTerm) {
      return NextResponse.json({ error: "No active term is set. Please contact the administrator." }, { status: 400 });
    }

    const firstResult = results[0];
    if (firstResult.termId !== activeTerm.id || firstResult.sessionId !== activeTerm.session.id) {
      return NextResponse.json({ error: "Results can only be submitted for the current active term." }, { status: 400 });
    }

    const saved = await Promise.all(
      results.map(async (r) => {
        const ca1 = Math.min(10, Math.max(0, r.ca1 || 0));
        const ca2 = Math.min(10, Math.max(0, r.ca2 || 0));
        const ca3 = Math.min(10, Math.max(0, r.ca3 || 0));
        const exam = Math.min(70, Math.max(0, r.exam || 0));
        const total = ca1 + ca2 + ca3 + exam;
        const { grade, remark } = getGrade(total, gradingScale);

        const existing = await prisma.result.findUnique({
          where: {
            studentId_subjectId_termId_sessionId: {
              studentId: r.studentId,
              subjectId: r.subjectId,
              termId: r.termId,
              sessionId: r.sessionId,
            },
          },
        });

        if (existing) {
          if (existing.staffId !== staff.id) {
            return null;
          }
          return prisma.result.update({
            where: { id: existing.id },
            data: { ca1, ca2, ca3, exam, total, grade, remark, status },
          });
        } else {
          return prisma.result.create({
            data: {
              studentId: r.studentId,
              subjectId: r.subjectId,
              classId: r.classId,
              sessionId: r.sessionId,
              termId: r.termId,
              staffId: staff.id,
              ca1,
              ca2,
              ca3,
              exam,
              total,
              grade,
              remark,
              status,
            },
          });
        }
      })
    );

    return NextResponse.json(saved.filter(Boolean));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
