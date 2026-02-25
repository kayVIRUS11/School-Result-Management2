import { ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ResultsPage() {
  const results = await prisma.result.findMany({
    include: {
      student: { include: { user: true } },
      subject: true,
      classroom: true,
      term: true,
      session: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">All Results</h1>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No results found</td></tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{r.student.user.firstName} {r.student.user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.subject.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.classroom.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.term.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.total}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.grade ?? "-"}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      r.status === "SUBMITTED" ? "bg-yellow-100 text-yellow-700" :
                      r.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{r.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
