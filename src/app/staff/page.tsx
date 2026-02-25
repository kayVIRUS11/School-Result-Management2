import { ClipboardList, BookOpen, CheckSquare } from "lucide-react";
import StatCard from "@/components/StatCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StaffDashboard() {
  const session = await auth();
  const staff = await prisma.staff.findFirst({
    where: { user: { id: session!.user.id } },
  });

  const [myResults, submitted, approved] = staff
    ? await Promise.all([
        prisma.result.count({ where: { staffId: staff.id } }),
        prisma.result.count({ where: { staffId: staff.id, status: "SUBMITTED" } }),
        prisma.result.count({ where: { staffId: staff.id, status: "APPROVED" } }),
      ])
    : [0, 0, 0];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={<ClipboardList className="w-6 h-6" />}
          title="Total Results Entered"
          value={myResults}
          color="blue"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Submitted"
          value={submitted}
          color="orange"
        />
        <StatCard
          icon={<CheckSquare className="w-6 h-6" />}
          title="Approved"
          value={approved}
          color="green"
        />
      </div>
    </div>
  );
}
