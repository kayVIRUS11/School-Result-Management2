import { BookOpen, FileText, TrendingUp, Calendar } from "lucide-react";
import StatCard from "@/components/StatCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboard() {
  const session = await auth();
  const student = await prisma.student.findFirst({
    where: { userId: session!.user.id },
  });

  const currentTerm = await prisma.term.findFirst({
    where: { isCurrent: true },
    include: { session: true },
  });

  let totalSubjects = 0;
  let resultsAvailable = 0;
  let averageScore: string | number = "—";

  if (student) {
    const [subjectCount, resultCount, approvedResults] = await Promise.all([
      prisma.classSubject.count({ where: { classId: student.classId } }),
      prisma.result.count({
        where: {
          studentId: student.id,
          status: "APPROVED",
          ...(currentTerm ? { termId: currentTerm.id } : {}),
        },
      }),
      prisma.result.findMany({
        where: { studentId: student.id, status: "APPROVED" },
        select: { total: true },
      }),
    ]);
    totalSubjects = subjectCount;
    resultsAvailable = resultCount;
    if (approvedResults.length > 0) {
      averageScore = (
        approvedResults.reduce((sum: number, r: { total: number }) => sum + r.total, 0) / approvedResults.length
      ).toFixed(1);
    }
  }

  const termLabel = currentTerm
    ? `${currentTerm.session.name} — ${currentTerm.name}`
    : "Not Set";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Total Subjects"
          value={totalSubjects}
          color="blue"
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          title="Results Available"
          value={resultsAvailable}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Average Score"
          value={averageScore}
          color="indigo"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Current Term"
          value={termLabel}
          color="purple"
        />
      </div>
    </div>
  );
}
