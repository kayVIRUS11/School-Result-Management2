import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classSubjects = await prisma.classSubject.findMany({
    where: { classId: params.id },
    include: { subject: true },
  });

  return NextResponse.json(classSubjects);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectIds }: { subjectIds: string[] } = await req.json();

  await prisma.classSubject.deleteMany({ where: { classId: params.id } });

  await prisma.classSubject.createMany({
    data: subjectIds.map((subjectId) => ({ classId: params.id, subjectId })),
  });

  return NextResponse.json({ success: true });
}
