"use client";

import { useEffect, useState } from "react";
import { Filter, FileText } from "lucide-react";
import { Toaster } from "react-hot-toast";

interface ClassRoom { id: string; name: string; }
interface Subject { id: string; name: string; }
interface Term { id: string; name: string; session: { name: string }; }
interface AcademicSession { id: string; name: string; }

interface Result {
  id: string;
  ca1: number | null;
  ca2: number | null;
  ca3: number | null;
  exam: number | null;
  total: number | null;
  grade: string | null;
  status: string;
  student: { user: { firstName: string; lastName: string } };
  subject: { name: string };
  classroom: { name: string };
  term: { name: string };
  session: { name: string };
  staff: { user: { firstName: string; lastName: string } } | null;
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  SUBMITTED: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  DRAFT: "bg-gray-100 text-gray-600",
};

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [filters, setFilters] = useState({ classId: "", subjectId: "", termId: "", sessionId: "", status: "" });

  useEffect(() => {
    fetch("/api/admin/classes").then(r => r.json()).then(setClasses);
    fetch("/api/admin/subjects").then(r => r.json()).then(setSubjects);
    fetch("/api/admin/terms").then(r => r.json()).then(setTerms);
    fetch("/api/admin/sessions").then(r => r.json()).then(setSessions);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    fetch(`/api/admin/results?${params.toString()}`).then(r => r.json()).then(setResults);
  }, [filters]);

  const setFilter = (key: string, value: string) => setFilters(f => ({ ...f, [key]: value }));

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">All Results</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <select value={filters.classId} onChange={e => setFilter("classId", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.subjectId} onChange={e => setFilter("subjectId", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.termId} onChange={e => setFilter("termId", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Terms</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.name} — {t.session.name}</option>)}
          </select>
          <select value={filters.sessionId} onChange={e => setFilter("sessionId", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Sessions</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilter("status", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Term</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Session</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA1</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA2</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA3</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Exam</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.length === 0 ? (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-gray-400">No results found</td></tr>
              ) : results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.student.user.firstName} {r.student.user.lastName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.subject.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.classroom.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.term.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.session.name}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca1 ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca2 ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca3 ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.exam ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">{r.total ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">{r.grade ?? "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600"}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.staff ? `${r.staff.user.firstName} ${r.staff.user.lastName}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
