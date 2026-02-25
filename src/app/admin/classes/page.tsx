"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, School } from "lucide-react";
import Modal from "@/components/Modal";
import { Toaster, toast } from "react-hot-toast";

interface Subject { id: string; name: string; code: string; }
interface ClassRoom {
  id: string;
  name: string;
  level: string;
  _count: { students: number };
  classSubjects: Array<{ subject: { id: string; name: string } }>;
}

const LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editClass, setEditClass] = useState<ClassRoom | null>(null);
  const [assignClass, setAssignClass] = useState<ClassRoom | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: "", level: "" });
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/admin/classes").then(r => r.json()).then(setClasses);
    fetch("/api/admin/subjects").then(r => r.json()).then(setSubjects);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.level) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to create class"); return; }
    toast.success("Class created");
    setShowAdd(false);
    setForm({ name: "", level: "" });
    load();
  };

  const handleEdit = async () => {
    if (!editClass) return;
    if (!form.name || !form.level) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/classes/${editClass.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to update class"); return; }
    toast.success("Class updated");
    setShowEdit(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete class"); return; }
    toast.success("Class deleted");
    load();
  };

  const openEdit = (c: ClassRoom) => {
    setEditClass(c);
    setForm({ name: c.name, level: c.level });
    setShowEdit(true);
  };

  const openAssign = (c: ClassRoom) => {
    setAssignClass(c);
    setSelectedSubjects(new Set(c.classSubjects.map(cs => cs.subject.id)));
    setShowAssign(true);
  };

  const handleAssign = async () => {
    if (!assignClass) return;
    setLoading(true);
    const res = await fetch(`/api/admin/classes/${assignClass.id}/subjects`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectIds: Array.from(selectedSubjects) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to assign subjects"); return; }
    toast.success("Subjects assigned");
    setShowAssign(false);
    load();
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. JSS1A" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
        <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">Select level</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <School className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        </div>
        <button onClick={() => { setForm({ name: "", level: "" }); setShowAdd(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No classes found</td></tr>
              ) : classes.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.level}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c._count.students}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.classSubjects.length}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openAssign(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Assign Subjects"><BookOpen className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Class">
        {formFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAdd} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Creating..." : "Create"}</button>
        </div>
      </Modal>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Class">
        {formFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleEdit} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </Modal>

      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title={`Assign Subjects — ${assignClass?.name ?? ""}`}>
        <p className="text-sm text-gray-500 mb-4">Select the subjects offered by this class.</p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {subjects.length === 0 && <p className="text-sm text-gray-400">No subjects available. Create subjects first.</p>}
          {subjects.map(sub => (
            <label key={sub.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSubjects.has(sub.id)}
                onChange={() => toggleSubject(sub.id)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{sub.name}</span>
              <span className="text-xs text-gray-400 ml-auto font-mono">{sub.code}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowAssign(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAssign} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
        </div>
      </Modal>
    </div>
  );
}
