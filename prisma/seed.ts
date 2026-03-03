import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Use the same adapter setup as the rest of the app
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      role: Role.ADMIN,
      firstName: "System",
      lastName: "Administrator",
    },
  });

  const gradingScales = [
    { minScore: 70, maxScore: 100, grade: "A", remark: "Excellent" },
    { minScore: 60, maxScore: 69, grade: "B", remark: "Very Good" },
    { minScore: 50, maxScore: 59, grade: "C", remark: "Good" },
    { minScore: 45, maxScore: 49, grade: "D", remark: "Fair" },
    { minScore: 40, maxScore: 44, grade: "E", remark: "Pass" },
    { minScore: 0, maxScore: 39, grade: "F", remark: "Fail" },
  ];

  for (const scale of gradingScales) {
    await prisma.gradingScale.create({ data: scale });
  }

  const session = await prisma.academicSession.create({
    data: {
      name: "2025/2026",
      isCurrent: true,
    },
  });

  await prisma.term.createMany({
    data: [
      { name: "First Term", sessionId: session.id, isCurrent: true },
      { name: "Second Term", sessionId: session.id, isCurrent: false },
      { name: "Third Term", sessionId: session.id, isCurrent: false },
    ],
  });

  const classData = [
    { name: "JSS1A", level: "JSS1" },
    { name: "JSS1B", level: "JSS1" },
    { name: "JSS2A", level: "JSS2" },
    { name: "SS1A", level: "SS1" },
    { name: "SS2A", level: "SS2" },
    { name: "SS3A", level: "SS3" },
  ];
  await prisma.classRoom.createMany({ data: classData });

  const subjectData = [
    { name: "Mathematics", code: "MTH" },
    { name: "English Language", code: "ENG" },
    { name: "Physics", code: "PHY" },
    { name: "Chemistry", code: "CHM" },
    { name: "Biology", code: "BIO" },
    { name: "History", code: "HIS" },
    { name: "Geography", code: "GEO" },
  ];
  await prisma.subject.createMany({ data: subjectData });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });