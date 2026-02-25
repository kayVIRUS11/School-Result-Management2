import { UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AssignmentsPage() {
  const assignments = await prisma.staffAssignment.findMany({
    include: { staff: { include: { user: true } }, classroom: true, subject: true },
    orderBy: { classroom: { name: "asc" } },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Staff Assignments</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No assignments found</td></tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{a.staff.user.firstName} {a.staff.user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.classroom.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.subject?.name ?? "All Subjects"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
