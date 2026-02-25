import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId") ?? undefined;
  const subjectId = searchParams.get("subjectId") ?? undefined;
  const termId = searchParams.get("termId") ?? undefined;
  const sessionId = searchParams.get("sessionId") ?? undefined;
  const status = searchParams.get("status") as Prisma.EnumResultStatusFilter | undefined;

  const where: Prisma.ResultWhereInput = {};
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (termId) where.termId = termId;
  if (sessionId) where.sessionId = sessionId;
  if (status) where.status = status;

  const results = await prisma.result.findMany({
    where,
    include: {
      student: { include: { user: true } },
      subject: true,
      classroom: true,
      term: true,
      session: true,
      staff: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(results);
}
