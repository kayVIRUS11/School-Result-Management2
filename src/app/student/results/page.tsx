import { ClipboardList } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentResultsPage() {
  const session = await auth();
  const student = await prisma.student.findFirst({
    where: { user: { id: session!.user.id } },
  });

  const results = student
    ? await prisma.result.findMany({
        where: { studentId: student.id, status: "APPROVED" },
        include: { subject: true, term: true, session: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Term</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Session</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">CA1</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">CA2</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">CA3</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.length === 0 ? (
              <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-400">No approved results found</td></tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{r.subject.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.term.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.session.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.ca1}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.ca2}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.ca3}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.exam}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{r.total}</td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">{r.grade ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
