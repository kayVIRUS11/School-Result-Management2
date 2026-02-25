import { ClipboardList, FileText, Clock, CheckCircle } from "lucide-react";
import StatCard from "@/components/StatCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StaffDashboard() {
  const session = await auth();
  const staff = await prisma.staff.findFirst({
    where: { userId: session!.user.id },
  });

  const [assignmentsCount, resultsCount, pendingCount, approvedCount] = staff
    ? await Promise.all([
        prisma.staffAssignment.count({ where: { staffId: staff.id } }),
        prisma.result.count({ where: { staffId: staff.id } }),
        prisma.result.count({ where: { staffId: staff.id, status: "SUBMITTED" } }),
        prisma.result.count({ where: { staffId: staff.id, status: "APPROVED" } }),
      ])
    : [0, 0, 0, 0];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ClipboardList className="w-6 h-6" />}
          title="My Assignments"
          value={assignmentsCount}
          color="indigo"
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          title="Results Entered"
          value={resultsCount}
          color="blue"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="Pending Approval"
          value={pendingCount}
          color="orange"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Approved Results"
          value={approvedCount}
          color="green"
        />
      </div>
    </div>
  );
}
