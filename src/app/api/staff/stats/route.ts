import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findFirst({ where: { userId: session.user.id } });
  if (!staff) return NextResponse.json({ assignmentsCount: 0, resultsCount: 0, pendingCount: 0, approvedCount: 0 });

  const [assignmentsCount, resultsCount, pendingCount, approvedCount] = await Promise.all([
    prisma.staffAssignment.count({ where: { staffId: staff.id } }),
    prisma.result.count({ where: { staffId: staff.id } }),
    prisma.result.count({ where: { staffId: staff.id, status: "SUBMITTED" } }),
    prisma.result.count({ where: { staffId: staff.id, status: "APPROVED" } }),
  ]);

  return NextResponse.json({ assignmentsCount, resultsCount, pendingCount, approvedCount });
}
