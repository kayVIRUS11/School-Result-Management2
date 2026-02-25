import { ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function PendingResultsPage() {
  const results = await prisma.result.findMany({
    where: { status: "SUBMITTED" },
    include: {
      student: { include: { user: true } },
      subject: true,
      classroom: true,
      term: true,
      staff: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Pending Results</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Term</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No pending results</td></tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{r.student.user.firstName} {r.student.user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.subject.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.classroom.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.term.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.total}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.staff.user.firstName} {r.staff.user.lastName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
