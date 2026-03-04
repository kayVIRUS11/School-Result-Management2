import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const terms = await prisma.term.findMany({
      include: { session: true },
      orderBy: [{ session: { name: "desc" } }, { name: "asc" }],
    });

    return NextResponse.json(terms);
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
    const { name, sessionId, isCurrent } = await req.json();

    if (!name || !sessionId) {
      return NextResponse.json({ error: "Name and sessionId are required" }, { status: 400 });
    }

    if (isCurrent) {
      await prisma.term.updateMany({ data: { isCurrent: false } });
    }

    const term = await prisma.term.create({
      data: { name, sessionId, isCurrent: isCurrent ?? false },
      include: { session: true },
    });

    return NextResponse.json(term, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
