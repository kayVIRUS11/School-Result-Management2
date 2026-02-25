"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import Modal from "@/components/Modal";
import { Toaster, toast } from "react-hot-toast";

interface Subject {
  id: string;
  name: string;
  code: string;
  _count: { classSubjects: number };
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);

  const load = () => fetch("/api/admin/subjects").then(r => r.json()).then(setSubjects);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.code) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to create subject"); return; }
    toast.success("Subject created");
    setShowAdd(false);
    setForm({ name: "", code: "" });
    load();
  };

  const handleEdit = async () => {
    if (!editSubject) return;
    if (!form.name || !form.code) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/subjects/${editSubject.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to update subject"); return; }
    toast.success("Subject updated");
    setShowEdit(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete subject"); return; }
    toast.success("Subject deleted");
    load();
  };

  const openEdit = (s: Subject) => {
    setEditSubject(s);
    setForm({ name: s.name, code: s.code });
    setShowEdit(true);
  };

  const formFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mathematics" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
        <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. MTH101" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        </div>
        <button onClick={() => { setForm({ name: "", code: "" }); setShowAdd(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Classes Using</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjects.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No subjects found</td></tr>
            ) : subjects.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">{s.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-mono">{s.code}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{s._count.classSubjects}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Subject">
        {formFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAdd} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Creating..." : "Create"}</button>
        </div>
      </Modal>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Subject">
        {formFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleEdit} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </Modal>
    </div>
  );
}
