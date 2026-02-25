import { GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: { user: true, classroom: true },
    orderBy: { regNumber: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reg Number</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No students found</td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{s.regNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.user.firstName} {s.user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.classroom.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
