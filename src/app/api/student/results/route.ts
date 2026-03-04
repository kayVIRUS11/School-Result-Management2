import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findFirst({ where: { userId: session.user.id } });
    if (!student) return NextResponse.json([]);

    const { searchParams } = new URL(req.url);
    const termId = searchParams.get("termId") ?? undefined;
    const sessionId = searchParams.get("sessionId") ?? undefined;

    const results = await prisma.result.findMany({
      where: {
        studentId: student.id,
        status: "APPROVED",
        ...(termId ? { termId } : {}),
        ...(sessionId ? { sessionId } : {}),
      },
      include: {
        subject: true,
        term: true,
        session: true,
      },
      orderBy: { subject: { name: "asc" } },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
