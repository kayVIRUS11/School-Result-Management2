import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePassword, hashPassword } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";

interface StudentRow {
  regNumber: string;
  firstName: string;
  lastName: string;
  classId?: string;
  className?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rows } = await req.json() as { rows: StudentRow[] };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "rows must be a non-empty array" }, { status: 400 });
    }

    // Pre-fetch all classrooms and existing students in bulk to avoid N+1 queries
    const [allClassrooms, existingStudents] = await Promise.all([
      prisma.classRoom.findMany({ select: { id: true, name: true } }),
      prisma.student.findMany({
        where: { regNumber: { in: rows.map(r => r.regNumber).filter(Boolean) } },
        select: { regNumber: true },
      }),
    ]);

    const classroomByName = new Map(allClassrooms.map(c => [c.name, c.id]));
    const classroomById = new Set(allClassrooms.map(c => c.id));
    const existingRegNumbers = new Set(existingStudents.map(s => s.regNumber));

    const results: { regNumber: string; password?: string; status: "success" | "skipped" | "error"; error?: string }[] = [];

    for (const row of rows) {
      const { regNumber, firstName, lastName, classId, className, guardianName, guardianPhone } = row;

      if (!regNumber || !firstName || !lastName) {
        results.push({ regNumber: regNumber ?? "(unknown)", status: "error", error: "regNumber, firstName, and lastName are required" });
        continue;
      }

      let resolvedClassId = classId;
      if (!resolvedClassId && className) {
        const found = classroomByName.get(className);
        if (!found) {
          results.push({ regNumber, status: "error", error: `Class "${className}" not found` });
          continue;
        }
        resolvedClassId = found;
      } else if (resolvedClassId && !classroomById.has(resolvedClassId)) {
        results.push({ regNumber, status: "error", error: `Class ID "${resolvedClassId}" not found` });
        continue;
      }

      if (!resolvedClassId) {
        results.push({ regNumber, status: "error", error: "classId or className is required" });
        continue;
      }

      if (existingRegNumbers.has(regNumber)) {
        results.push({ regNumber, status: "skipped" });
        continue;
      }

      try {
        const generatedPassword = generatePassword();
        const passwordHash = await hashPassword(generatedPassword);
        const username = regNumber.toLowerCase();

        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: { role: "STUDENT", username, passwordHash, firstName, lastName },
          });
          await tx.student.create({
            data: { userId: user.id, regNumber, classId: resolvedClassId!, guardianName, guardianPhone },
          });
        });

        existingRegNumbers.add(regNumber);
        results.push({ regNumber, password: generatedPassword, status: "success" });
      } catch {
        results.push({ regNumber, status: "error", error: "Failed to create student (possible duplicate username)" });
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
      credentials: successful.map(r => ({ regNumber: r.regNumber, password: r.password })),
      errors: failed.map(r => ({ regNumber: r.regNumber, error: r.error })),
    });
  } catch (error) {
    console.error("Error importing students:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
