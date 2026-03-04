import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const classes = await prisma.classRoom.findMany({
      include: {
        _count: { select: { students: true } },
        classSubjects: { include: { subject: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, level } = await req.json();

    if (!name || !level) {
      return NextResponse.json({ error: "Name and level are required" }, { status: 400 });
    }

    const classroom = await prisma.classRoom.create({ data: { name, level } });

    return NextResponse.json(classroom, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
