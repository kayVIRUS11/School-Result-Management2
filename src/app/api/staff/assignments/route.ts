import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findFirst({ where: { userId: session.user.id } });
  if (!staff) return NextResponse.json([]);

  const assignments = await prisma.staffAssignment.findMany({
    where: { staffId: staff.id },
    include: { classroom: true, subject: true },
    orderBy: { classroom: { name: "asc" } },
  });

  return NextResponse.json(assignments);
}
