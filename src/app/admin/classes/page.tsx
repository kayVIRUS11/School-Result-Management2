import { School } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ClassesPage() {
  const classes = await prisma.classRoom.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <School className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Students</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classes.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.level}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c._count.students}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
