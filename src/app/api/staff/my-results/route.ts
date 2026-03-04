import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const status = searchParams.get("status") ?? undefined;

    const results = await prisma.result.findMany({
      where: {
        staffId: staff.id,
        ...(classId ? { classId } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(termId ? { termId } : {}),
        ...(status ? { status: status as "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" } : {}),
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
