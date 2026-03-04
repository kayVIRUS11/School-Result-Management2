import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePassword, hashPassword } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";

interface StaffRow {
  staffIdNumber: string;
  firstName: string;
  lastName: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rows } = await req.json() as { rows: StaffRow[] };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "rows must be a non-empty array" }, { status: 400 });
    }

    // Pre-fetch all existing staff IDs in bulk to avoid N+1 queries
    const existingStaff = await prisma.staff.findMany({
      where: { staffIdNumber: { in: rows.map(r => r.staffIdNumber).filter(Boolean) } },
      select: { staffIdNumber: true },
    });
    const existingStaffIds = new Set(existingStaff.map(s => s.staffIdNumber));

    const results: { staffIdNumber: string; password?: string; status: "success" | "skipped" | "error"; error?: string }[] = [];

    for (const row of rows) {
      const { staffIdNumber, firstName, lastName } = row;

      if (!staffIdNumber || !firstName || !lastName) {
        results.push({ staffIdNumber: staffIdNumber ?? "(unknown)", status: "error", error: "staffIdNumber, firstName, and lastName are required" });
        continue;
      }

      if (existingStaffIds.has(staffIdNumber)) {
        results.push({ staffIdNumber, status: "skipped" });
        continue;
      }

      try {
        const generatedPassword = generatePassword();
        const passwordHash = await hashPassword(generatedPassword);
        const username = staffIdNumber.toLowerCase();

        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: { role: "STAFF", username, passwordHash, firstName, lastName },
          });
          await tx.staff.create({
            data: { userId: user.id, staffIdNumber },
          });
        });

        existingStaffIds.add(staffIdNumber);
        results.push({ staffIdNumber, password: generatedPassword, status: "success" });
      } catch {
        results.push({ staffIdNumber, status: "error", error: "Failed to create staff (possible duplicate username)" });
      }
    }

    const successful = results.filter(r => r.status === "success");
    const skipped = results.filter(r => r.status === "skipped");
    const failed = results.filter(r => r.status === "error");

    return NextResponse.json({
      total: rows.length,
      successCount: successful.length,
      skippedCount: skipped.length,
      errorCount: failed.length,
      credentials: successful.map(r => ({ staffIdNumber: r.staffIdNumber, password: r.password })),
      errors: failed.map(r => ({ staffIdNumber: r.staffIdNumber, error: r.error })),
    });
  } catch (error) {
    console.error("Error importing staff:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
