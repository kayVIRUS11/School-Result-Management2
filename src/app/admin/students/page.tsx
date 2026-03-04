"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, KeyRound, Search, GraduationCap, FileUp } from "lucide-react";
import Modal from "@/components/Modal";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

interface ClassRoom { id: string; name: string; }
interface Student {
  id: string;
  regNumber: string;
  classId: string;
  guardianName: string | null;
  guardianPhone: string | null;
  user: { firstName: string; lastName: string; username: string; };
  classroom: { name: string; };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [form, setForm] = useState({ regNumber: "", firstName: "", lastName: "", classId: "", guardianName: "", guardianPhone: "" });
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/admin/students").then(r => r.json()).then(setStudents);
    fetch("/api/admin/classes").then(r => r.json()).then(setClasses);
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s =>
    `${s.user.firstName} ${s.user.lastName} ${s.regNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.regNumber || !form.firstName || !form.lastName || !form.classId) {
      toast.error("Please fill all required fields"); return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to create student"); return; }
    toast.success("Student created");
    setGeneratedPassword(data.generatedPassword);
    setShowAdd(false);
    setForm({ regNumber: "", firstName: "", lastName: "", classId: "", guardianName: "", guardianPhone: "" });
    setShowPassword(true);
    load();
  };

  const handleEdit = async () => {
    if (!editStudent) return;
    setLoading(true);
    const res = await fetch(`/api/admin/students/${editStudent.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, classId: form.classId, guardianName: form.guardianName, guardianPhone: form.guardianPhone }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to update student"); return; }
    toast.success("Student updated");
    setShowEdit(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete student"); return; }
    toast.success("Student deleted");
    load();
  };

  const handleResetPassword = async (id: string) => {
    const res = await fetch(`/api/admin/students/${id}/reset-password`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { toast.error("Failed to reset password"); return; }
    setGeneratedPassword(data.generatedPassword);
    setShowPassword(true);
    toast.success("Password reset");
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({ regNumber: s.regNumber, firstName: s.user.firstName, lastName: s.user.lastName, classId: s.classId, guardianName: s.guardianName ?? "", guardianPhone: s.guardianPhone ?? "" });
    setShowEdit(true);
  };

  const formFields = (hideRegNumber = false) => (
    <div className="space-y-4">
      {!hideRegNumber && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reg Number *</label>
          <input value={form.regNumber} onChange={e => setForm(f => ({ ...f, regNumber: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
        <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">Select class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
          <input value={form.guardianName} onChange={e => setForm(f => ({ ...f, guardianName: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
          <input value={form.guardianPhone} onChange={e => setForm(f => ({ ...f, guardianPhone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/students/import" className="flex items-center gap-2 border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
            <FileUp className="w-4 h-4" /> Import CSV
          </Link>
          <button onClick={() => { setForm({ regNumber: "", firstName: "", lastName: "", classId: "", guardianName: "", guardianPhone: "" }); setShowAdd(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or reg number..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reg Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Guardian</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No students found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">{s.regNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.user.firstName} {s.user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.classroom.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.guardianName ?? "-"}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleResetPassword(s.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password"><KeyRound className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Student">
        {formFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAdd} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Creating..." : "Create"}</button>
        </div>
      </Modal>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Student">
        {formFields(true)}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleEdit} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </Modal>

      <Modal isOpen={showPassword} onClose={() => setShowPassword(false)} title="Generated Password">
        <p className="text-sm text-gray-600 mb-3">Share this password with the student. It will not be shown again.</p>
        <div className="bg-gray-100 rounded-lg px-4 py-3 font-mono text-lg text-center font-bold text-gray-900 tracking-wider">{generatedPassword}</div>
        <div className="flex justify-end mt-6">
          <button onClick={() => setShowPassword(false)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Done</button>
        </div>
      </Modal>
    </div>
  );
}
