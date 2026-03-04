import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePassword, hashPassword } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const generatedPassword = generatePassword();
    const passwordHash = await hashPassword(generatedPassword);

    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: staff.userId },
      data: { passwordHash },
    });

    return NextResponse.json({ generatedPassword });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
