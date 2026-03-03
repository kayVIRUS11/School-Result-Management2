"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

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
  staff: { user: { firstName: string; lastName: string } } | null;
}

interface ClassRoom { id: string; name: string; }
interface Subject { id: string; name: string; }
interface StaffMember { id: string; user: { firstName: string; lastName: string }; }

export default function PendingResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [filters, setFilters] = useState({ classId: "", subjectId: "", staffId: "" });

  useEffect(() => {
    fetch("/api/admin/classes").then(r => r.json()).then(setClasses);
    fetch("/api/admin/subjects").then(r => r.json()).then(setSubjects);
    fetch("/api/admin/staff").then(r => r.json()).then(setStaffList);
  }, []);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    fetch(`/api/admin/results/pending?${params.toString()}`)
      .then(r => r.json())
      .then(setResults);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (key: string, value: string) => setFilters(f => ({ ...f, [key]: value }));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map(r => r.id)));
    }
  };

  const approveOne = async (id: string) => {
    const res = await fetch(`/api/admin/results/${id}/approve`, { method: "POST" });
    if (!res.ok) { toast.error("Failed to approve result"); return; }
    toast.success("Result approved");
    load();
  };

  const rejectOne = async (id: string) => {
    const res = await fetch(`/api/admin/results/${id}/reject`, { method: "POST" });
    if (!res.ok) { toast.error("Failed to reject result"); return; }
    toast.success("Result rejected");
    load();
  };

  const bulkAction = async (action: "approve" | "reject") => {
    if (selected.size === 0) return;
    setLoading(true);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map(id => fetch(`/api/admin/results/${id}/${action}`, { method: "POST" }))
    );
    const failed = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)).length;
    setLoading(false);
    if (failed > 0) {
      toast.error(`${failed} result(s) failed to ${action}`);
    } else {
      toast.success(`${ids.length} result(s) ${action === "approve" ? "approved" : "rejected"}`);
    }
    setSelected(new Set());
    load();
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Pending Results</h1>
        {results.length > 0 && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            {results.length} pending
          </span>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={filters.classId} onChange={e => setFilter("classId", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.subjectId} onChange={e => setFilter("subjectId", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.staffId} onChange={e => setFilter("staffId", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Staff</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-indigo-700">{selected.size} selected</span>
          <button
            onClick={() => bulkAction("approve")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Approve Selected
          </button>
          <button
            onClick={() => bulkAction("reject")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="w-4 h-4" /> Reject Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-sm text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={results.length > 0 && selected.size === results.length}
                    onChange={toggleAll}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Term</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA1</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA2</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA3</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Exam</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.length === 0 ? (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-gray-400">No pending results</td></tr>
              ) : results.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${selected.has(r.id) ? "bg-indigo-50" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.student.user.firstName} {r.student.user.lastName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.subject.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.classroom.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.term.name}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca1 ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca2 ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.ca3 ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{r.exam ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">{r.total ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">{r.grade ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.staff ? `${r.staff.user.firstName} ${r.staff.user.lastName}` : "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => approveOne(r.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => rejectOne(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
