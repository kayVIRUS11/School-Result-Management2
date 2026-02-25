import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findFirst({ where: { userId: session.user.id } });
  if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  const { resultIds } = await req.json() as { resultIds: string[] };
  if (!Array.isArray(resultIds) || resultIds.length === 0) {
    return NextResponse.json({ error: "No result IDs provided" }, { status: 400 });
  }

  await prisma.result.updateMany({
    where: {
      id: { in: resultIds },
      staffId: staff.id,
      status: "DRAFT",
    },
    data: { status: "SUBMITTED" },
  });

  return NextResponse.json({ success: true });
}
