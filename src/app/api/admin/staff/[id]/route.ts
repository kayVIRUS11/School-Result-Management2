import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstName, lastName } = await req.json();

  const staff = await prisma.staff.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!staff) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: staff.userId },
    data: { firstName, lastName },
  });

  const updated = await prisma.staff.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findUnique({ where: { id: params.id } });

  if (!staff) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id: staff.userId } });

  return NextResponse.json({ success: true });
}
