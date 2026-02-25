import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjects.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{s.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{s.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
