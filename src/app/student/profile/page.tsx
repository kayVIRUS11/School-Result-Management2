import { User, Hash, School, Users, Phone } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentProfilePage() {
  const session = await auth();
  const student = await prisma.student.findFirst({
    where: { userId: session!.user.id },
    include: { user: true, classroom: true },
  });

  const fields = [
    {
      icon: <User className="w-5 h-5 text-indigo-500" />,
      label: "Full Name",
      value: student ? `${student.user.firstName} ${student.user.lastName}` : "—",
    },
    {
      icon: <Hash className="w-5 h-5 text-indigo-500" />,
      label: "Registration Number",
      value: student?.regNumber ?? "—",
    },
    {
      icon: <School className="w-5 h-5 text-indigo-500" />,
      label: "Class",
      value: student?.classroom.name ?? "—",
    },
    {
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      label: "Guardian Name",
      value: student?.guardianName ?? "Not provided",
    },
    {
      icon: <Phone className="w-5 h-5 text-indigo-500" />,
      label: "Guardian Phone",
      value: student?.guardianPhone ?? "Not provided",
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.label} className="flex items-start gap-3">
              <div className="mt-0.5">{field.icon}</div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{field.label}</p>
                <p className="text-gray-900 mt-0.5">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
