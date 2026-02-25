"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, UserCheck, Link2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

interface Staff { id: string; staffIdNumber: string; user: { firstName: string; lastName: string }; }
interface ClassRoom { id: string; name: string; }
interface Subject { id: string; name: string; }
interface Assignment {
  id: string;
  staffId: string;
  classId: string;
  subjectId: string | null;
  staff: { user: { firstName: string; lastName: string } };
  classroom: { name: string };
  subject: { name: string } | null;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState({ staffId: "", classId: "", subjectId: "" });
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/admin/assignments").then(r => r.json()).then(setAssignments);
    fetch("/api/admin/staff").then(r => r.json()).then(setStaffList);
    fetch("/api/admin/classes").then(r => r.json()).then(setClasses);
    fetch("/api/admin/subjects").then(r => r.json()).then(setSubjects);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.staffId || !form.classId) { toast.error("Please select staff and class"); return; }
    setLoading(true);
    const body = { staffId: form.staffId, classId: form.classId, subjectId: form.subjectId || null };
    const res = await fetch("/api/admin/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to create assignment"); return; }
    toast.success("Assignment created");
    setForm({ staffId: "", classId: "", subjectId: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this assignment?")) return;
    const res = await fetch(`/api/admin/assignments/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to remove assignment"); return; }
    toast.success("Assignment removed");
    load();
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Staff Assignments</h1>
      </div>

      {/* Add Assignment Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-800">New Assignment</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff *</label>
            <select value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Select staff</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
            <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <button onClick={handleAdd} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <Plus className="w-4 h-4" /> {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No assignments found</td></tr>
              ) : assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{a.staff.user.firstName} {a.staff.user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.classroom.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.subject ? a.subject.name : <span className="italic text-gray-400">All Subjects</span>}</td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove"><Trash2 className="w-4 h-4" /></button>
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
