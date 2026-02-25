"use client";

import { useEffect, useState } from "react";
import { FileText, Filter } from "lucide-react";

interface Result {
  id: string;
  ca1: number;
  ca2: number;
  ca3: number;
  exam: number;
  total: number;
  grade: string | null;
  status: string;
  student: { regNumber: string; user: { firstName: string; lastName: string } };
  subject: { id: string; name: string };
  classroom: { id: string; name: string };
  term: { id: string; name: string };
  session: { id: string; name: string };
}

interface FilterOption {
  id: string;
  name: string;
}

const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

const statusColor: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  SUBMITTED: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  DRAFT: "bg-gray-100 text-gray-700",
};

export default function MyResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<FilterOption[]>([]);
  const [subjects, setSubjects] = useState<FilterOption[]>([]);
  const [terms, setTerms] = useState<FilterOption[]>([]);

  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  function fetchResults() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterClass) params.set("classId", filterClass);
    if (filterSubject) params.set("subjectId", filterSubject);
    if (filterTerm) params.set("termId", filterTerm);
    if (filterStatus) params.set("status", filterStatus);

    fetch(`/api/staff/my-results?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
        const uniqueClasses = Array.from(
          new Map(data.map((r: Result) => [r.classroom.id, r.classroom])).values()
        ) as FilterOption[];
        const uniqueSubjects = Array.from(
          new Map(data.map((r: Result) => [r.subject.id, r.subject])).values()
        ) as FilterOption[];
        const uniqueTerms = Array.from(
          new Map(data.map((r: Result) => [r.term.id, { id: r.term.id, name: `${r.session.name} — ${r.term.name}` }])).values()
        ) as FilterOption[];
        if (!filterClass) setClasses(uniqueClasses);
        if (!filterSubject) setSubjects(uniqueSubjects);
        if (!filterTerm) setTerms(uniqueTerms);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClass, filterSubject, filterTerm, filterStatus]);

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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Terms</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reg No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Term</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA1</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA2</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA3</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Exam</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={12} className="px-6 py-8 text-center text-gray-400">Loading...</td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-8 text-center text-gray-400">No results found</td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.student.user.firstName} {r.student.user.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.student.regNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.classroom.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.subject.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.session.name} — {r.term.name}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca1}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca2}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca3}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.exam}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold text-gray-800">{r.total}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.grade ?? "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {r.status}
                    </span>
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
