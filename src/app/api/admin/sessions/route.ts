import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.academicSession.findMany({
    orderBy: { name: "desc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, isCurrent } = await req.json();

  if (isCurrent) {
    await prisma.academicSession.updateMany({ data: { isCurrent: false } });
  }

  const academicSession = await prisma.academicSession.create({
    data: { name, isCurrent: isCurrent ?? false },
  });

  return NextResponse.json(academicSession, { status: 201 });
}
