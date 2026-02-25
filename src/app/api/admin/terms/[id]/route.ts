import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, sessionId, isCurrent } = await req.json();

  if (isCurrent) {
    await prisma.term.updateMany({
      where: { id: { not: params.id } },
      data: { isCurrent: false },
    });
  }

  const term = await prisma.term.update({
    where: { id: params.id },
    data: { name, sessionId, isCurrent: isCurrent ?? false },
    include: { session: true },
  });

  return NextResponse.json(term);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.term.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
