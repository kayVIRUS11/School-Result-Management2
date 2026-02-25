import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({
    include: { user: true },
    orderBy: { staffIdNumber: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Username</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No staff found</td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{s.staffIdNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.user.firstName} {s.user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.user.username}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
