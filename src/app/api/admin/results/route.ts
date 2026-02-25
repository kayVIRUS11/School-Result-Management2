import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
  const status = searchParams.get("status") ?? undefined;

  const results = await prisma.result.findMany({
    where: {
      ...(classId && { classId }),
      ...(subjectId && { subjectId }),
      ...(termId && { termId }),
      ...(sessionId && { sessionId }),
      ...(status && { status }),
    },
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
