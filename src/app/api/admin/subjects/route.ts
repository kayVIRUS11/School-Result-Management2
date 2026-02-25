import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subjects = await prisma.subject.findMany({
    include: { _count: { select: { classSubjects: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, code } = await req.json();

  const subject = await prisma.subject.create({ data: { name, code } });

  return NextResponse.json(subject, { status: 201 });
}
