import { Users, GraduationCap, BookOpen, ClipboardList } from "lucide-react";
import StatCard from "@/components/StatCard";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [studentCount, staffCount, subjectCount, pendingResults] = await Promise.all([
    prisma.student.count(),
    prisma.staff.count(),
    prisma.subject.count(),
    prisma.result.count({ where: { status: "SUBMITTED" } }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          title="Total Students"
          value={studentCount}
          color="blue"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Staff"
          value={staffCount}
          color="green"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Subjects"
          value={subjectCount}
          color="purple"
        />
        <StatCard
          icon={<ClipboardList className="w-6 h-6" />}
          title="Pending Results"
          value={pendingResults}
          color="orange"
        />
      </div>
    </div>
  );
}
