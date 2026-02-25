import { ClipboardList, GraduationCap, User } from "lucide-react";
import StatCard from "@/components/StatCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboard() {
  const session = await auth();
  const student = await prisma.student.findFirst({
    where: { user: { id: session!.user.id } },
    include: { classroom: true },
  });

  const resultCount = student
    ? await prisma.result.count({ where: { studentId: student.id, status: "APPROVED" } })
    : 0;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          title="My Class"
          value={student?.classroom.name ?? "Not Assigned"}
          color="blue"
        />
        <StatCard
          icon={<ClipboardList className="w-6 h-6" />}
          title="Results Available"
          value={resultCount}
          color="green"
        />
        <StatCard
          icon={<User className="w-6 h-6" />}
          title="Reg Number"
          value={student?.regNumber ?? "N/A"}
          color="purple"
        />
      </div>
    </div>
  );
}
