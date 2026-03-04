import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [studentCount, staffCount, pendingCount, approvedCount] = await Promise.all([
      prisma.student.count(),
      prisma.staff.count(),
      prisma.result.count({ where: { status: "SUBMITTED" } }),
      prisma.result.count({ where: { status: "APPROVED" } }),
    ]);

    return NextResponse.json({ studentCount, staffCount, pendingCount, approvedCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
