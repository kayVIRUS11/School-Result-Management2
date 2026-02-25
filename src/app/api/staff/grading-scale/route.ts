import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gradingScale = await prisma.gradingScale.findMany({
    orderBy: { minScore: "desc" },
  });

  return NextResponse.json(gradingScale);
}
