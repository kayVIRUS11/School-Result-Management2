import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function SessionsPage() {
  const sessions = await prisma.academicSession.findMany({
    include: { terms: true },
    orderBy: { name: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Academic Sessions</h1>
      </div>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">{session.name}</h2>
              {session.isCurrent && (
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Current</span>
              )}
            </div>
            <div className="flex gap-3">
              {session.terms.map((term) => (
                <span key={term.id} className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-lg">
                  {term.name}{term.isCurrent ? " (Current)" : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
