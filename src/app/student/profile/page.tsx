import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentProfilePage() {
  const session = await auth();
  const student = await prisma.student.findFirst({
    where: { user: { id: session!.user.id } },
    include: { user: true, classroom: true },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
            <p className="text-gray-900">{student?.user.firstName} {student?.user.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Username</p>
            <p className="text-gray-900">{student?.user.username}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Registration Number</p>
            <p className="text-gray-900">{student?.regNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Class</p>
            <p className="text-gray-900">{student?.classroom.name}</p>
          </div>
          {student?.guardianName && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Guardian</p>
              <p className="text-gray-900">{student.guardianName}</p>
            </div>
          )}
          {student?.guardianPhone && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Guardian Phone</p>
              <p className="text-gray-900">{student.guardianPhone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
