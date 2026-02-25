import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const terms = await prisma.term.findMany({
    include: { session: true },
    orderBy: [{ session: { name: "desc" } }, { name: "asc" }],
  });

  return NextResponse.json(terms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, sessionId, isCurrent } = await req.json();

  if (isCurrent) {
    await prisma.term.updateMany({ data: { isCurrent: false } });
  }

  const term = await prisma.term.create({
    data: { name, sessionId, isCurrent: isCurrent ?? false },
    include: { session: true },
  });

  return NextResponse.json(term, { status: 201 });
}
