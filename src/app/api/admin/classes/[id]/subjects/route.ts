import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId: params.id },
      include: { subject: true },
    });

    return NextResponse.json(classSubjects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subjectIds }: { subjectIds: string[] } = await req.json();

    if (!Array.isArray(subjectIds)) {
      return NextResponse.json({ error: "subjectIds must be an array" }, { status: 400 });
    }

    await prisma.classSubject.deleteMany({ where: { classId: params.id } });

    await prisma.classSubject.createMany({
      data: subjectIds.map((subjectId) => ({ classId: params.id, subjectId })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
