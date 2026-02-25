"use client";

import { useEffect, useState } from "react";
import { FileText, Filter, Award, TrendingUp } from "lucide-react";

interface Result {
  id: string;
  ca1: number;
  ca2: number;
  ca3: number;
  exam: number;
  total: number;
  grade: string | null;
  remark: string | null;
  subject: { name: string };
  term: { id: string; name: string };
  session: { id: string; name: string };
}

interface Term {
  id: string;
  name: string;
  isCurrent: boolean;
  sessionId: string;
}

interface Session {
  id: string;
  name: string;
  isCurrent: boolean;
  terms: Term[];
}

const gradeColor: Record<string, string> = {
  A: "text-green-600 font-bold",
  B: "text-blue-600 font-bold",
  C: "text-yellow-600 font-bold",
  D: "text-orange-500 font-bold",
  E: "text-orange-600 font-bold",
  F: "text-red-600 font-bold",
};

export default function StudentResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetch("/api/student/sessions")
      .then((r) => r.json())
      .then((data: Session[]) => {
        setSessions(data);
        const currentSession = data.find((s) => s.isCurrent);
        const currentTerm = currentSession?.terms.find((t) => t.isCurrent);
        setFilterSession(currentSession?.id ?? "");
        setFilterTerm(currentTerm?.id ?? "");
        setInitialized(true);
      });
  }, []);

  useEffect(() => {
    if (!initialized) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (filterTerm) params.set("termId", filterTerm);
    if (filterSession) params.set("sessionId", filterSession);

    fetch(`/api/student/results?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [filterTerm, filterSession, initialized]);

  const currentSession = sessions.find((s) => s.id === filterSession);
  const availableTerms = currentSession?.terms ?? [];

  const totalScore = results.reduce((sum, r) => sum + r.total, 0);
  const averageScore =
    results.length > 0 ? (totalScore / results.length).toFixed(1) : "—";

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filterSession}
            onChange={(e) => {
              setFilterSession(e.target.value);
              setFilterTerm("");
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Terms</option>
            {availableTerms.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA1</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA2</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA3</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Exam</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">Loading...</td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">No approved results found</td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{r.subject.name}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{r.ca1}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{r.ca2}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{r.ca3}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{r.exam}</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">{r.total}</td>
                  <td className={`px-6 py-4 text-sm text-center ${gradeColor[r.grade?.[0] ?? ""] ?? "text-gray-700"}`}>
                    {r.grade ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.remark ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && results.length > 0 && (
        <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">Summary</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Subjects:</span>
              <span>{results.length}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Total Score:</span>
              <span>{totalScore}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span className="font-medium">Average:</span>
              <span>{averageScore}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
