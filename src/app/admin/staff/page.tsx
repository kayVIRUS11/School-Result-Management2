"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, KeyRound, Search, UserCog } from "lucide-react";
import Modal from "@/components/Modal";
import { Toaster, toast } from "react-hot-toast";

interface Staff {
  id: string;
  staffIdNumber: string;
  user: { firstName: string; lastName: string; username: string; };
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [form, setForm] = useState({ staffIdNumber: "", firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);

  const load = () => fetch("/api/admin/staff").then(r => r.json()).then(setStaff);
  useEffect(() => { load(); }, []);

  const filtered = staff.filter(s =>
    `${s.user.firstName} ${s.user.lastName} ${s.staffIdNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.staffIdNumber || !form.firstName || !form.lastName) {
      toast.error("Please fill all required fields"); return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to create staff"); return; }
    toast.success("Staff created");
    setGeneratedPassword(data.generatedPassword);
    setShowAdd(false);
    setForm({ staffIdNumber: "", firstName: "", lastName: "" });
    setShowPassword(true);
    load();
  };

  const handleEdit = async () => {
    if (!editStaff) return;
    setLoading(true);
    const res = await fetch(`/api/admin/staff/${editStaff.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to update staff"); return; }
    toast.success("Staff updated");
    setShowEdit(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this staff member? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete staff"); return; }
    toast.success("Staff deleted");
    load();
  };

  const handleResetPassword = async (id: string) => {
    const res = await fetch(`/api/admin/staff/${id}/reset-password`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { toast.error("Failed to reset password"); return; }
    setGeneratedPassword(data.generatedPassword);
    setShowPassword(true);
    toast.success("Password reset");
  };

  const openEdit = (s: Staff) => {
    setEditStaff(s);
    setForm({ staffIdNumber: s.staffIdNumber, firstName: s.user.firstName, lastName: s.user.lastName });
    setShowEdit(true);
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserCog className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        </div>
        <button onClick={() => { setForm({ staffIdNumber: "", firstName: "", lastName: "" }); setShowAdd(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or staff ID..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No staff found</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-700 font-mono">{s.staffIdNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{s.user.firstName} {s.user.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{s.user.username}</td>
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Staff">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID Number *</label>
            <input value={form.staffIdNumber} onChange={e => setForm(f => ({ ...f, staffIdNumber: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
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
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAdd} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Creating..." : "Create"}</button>
        </div>
      </Modal>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Staff">
        <div className="space-y-4">
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
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleEdit} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </Modal>

      <Modal isOpen={showPassword} onClose={() => setShowPassword(false)} title="Generated Password">
        <p className="text-sm text-gray-600 mb-3">Share this password with the staff member. It will not be shown again.</p>
        <div className="bg-gray-100 rounded-lg px-4 py-3 font-mono text-lg text-center font-bold text-gray-900 tracking-wider">{generatedPassword}</div>
        <div className="flex justify-end mt-6">
          <button onClick={() => setShowPassword(false)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Done</button>
        </div>
      </Modal>
    </div>
  );
}
