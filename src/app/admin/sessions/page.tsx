"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import Modal from "@/components/Modal";
import { Toaster, toast } from "react-hot-toast";

interface AcademicSession { id: string; name: string; isCurrent: boolean; }
interface Term { id: string; name: string; isCurrent: boolean; sessionId: string; session: { name: string }; }

export default function SessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [showAddSession, setShowAddSession] = useState(false);
  const [showEditSession, setShowEditSession] = useState(false);
  const [editSession, setEditSession] = useState<AcademicSession | null>(null);
  const [sessionForm, setSessionForm] = useState({ name: "", isCurrent: false });

  const [showAddTerm, setShowAddTerm] = useState(false);
  const [showEditTerm, setShowEditTerm] = useState(false);
  const [editTerm, setEditTerm] = useState<Term | null>(null);
  const [termForm, setTermForm] = useState({ name: "", sessionId: "", isCurrent: false });

  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/admin/sessions").then(r => r.json()).then(setSessions);
    fetch("/api/admin/terms").then(r => r.json()).then(setTerms);
  };
  useEffect(() => { load(); }, []);

  // --- Sessions ---
  const handleAddSession = async () => {
    if (!sessionForm.name) { toast.error("Please enter a session name"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sessionForm) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to create session"); return; }
    toast.success("Session created");
    setShowAddSession(false);
    setSessionForm({ name: "", isCurrent: false });
    load();
  };

  const handleEditSession = async () => {
    if (!editSession) return;
    if (!sessionForm.name) { toast.error("Please enter a session name"); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/sessions/${editSession.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sessionForm) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to update session"); return; }
    toast.success("Session updated");
    setShowEditSession(false);
    load();
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete session"); return; }
    toast.success("Session deleted");
    load();
  };

  const openEditSession = (s: AcademicSession) => {
    setEditSession(s);
    setSessionForm({ name: s.name, isCurrent: s.isCurrent });
    setShowEditSession(true);
  };

  // --- Terms ---
  const handleAddTerm = async () => {
    if (!termForm.name || !termForm.sessionId) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/terms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(termForm) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to create term"); return; }
    toast.success("Term created");
    setShowAddTerm(false);
    setTermForm({ name: "", sessionId: "", isCurrent: false });
    load();
  };

  const handleEditTerm = async () => {
    if (!editTerm) return;
    if (!termForm.name || !termForm.sessionId) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/terms/${editTerm.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(termForm) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Failed to update term"); return; }
    toast.success("Term updated");
    setShowEditTerm(false);
    load();
  };

  const handleDeleteTerm = async (id: string) => {
    if (!confirm("Delete this term? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/terms/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete term"); return; }
    toast.success("Term deleted");
    load();
  };

  const openEditTerm = (t: Term) => {
    setEditTerm(t);
    setTermForm({ name: t.name, sessionId: t.sessionId, isCurrent: t.isCurrent });
    setShowEditTerm(true);
  };

  const sessionFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session Name *</label>
        <input value={sessionForm.name} onChange={e => setSessionForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 2024/2025" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={sessionForm.isCurrent} onChange={e => setSessionForm(f => ({ ...f, isCurrent: e.target.checked }))} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
        <span className="text-sm text-gray-700">Set as current session</span>
      </label>
    </div>
  );

  const termFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Term Name *</label>
        <input value={termForm.name} onChange={e => setTermForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. First Term" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session *</label>
        <select value={termForm.sessionId} onChange={e => setTermForm(f => ({ ...f, sessionId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">Select session</option>
          {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={termForm.isCurrent} onChange={e => setTermForm(f => ({ ...f, isCurrent: e.target.checked }))} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
        <span className="text-sm text-gray-700">Set as current term</span>
      </label>
    </div>
  );

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Sessions &amp; Terms</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sessions Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Academic Sessions</h2>
            <button onClick={() => { setSessionForm({ name: "", isCurrent: false }); setShowAddSession(true); }} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Session
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-sm">No sessions found</td></tr>
                ) : sessions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{s.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {s.isCurrent && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Current</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditSession(s)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteSession(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Terms</h2>
            <button onClick={() => { setTermForm({ name: "", sessionId: "", isCurrent: false }); setShowAddTerm(true); }} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Term
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Session</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {terms.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">No terms found</td></tr>
                ) : terms.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{t.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.session.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {t.isCurrent && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Current</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditTerm(t)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteTerm(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showAddSession} onClose={() => setShowAddSession(false)} title="Add Session">
        {sessionFormFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowAddSession(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAddSession} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Creating..." : "Create"}</button>
        </div>
      </Modal>

      <Modal isOpen={showEditSession} onClose={() => setShowEditSession(false)} title="Edit Session">
        {sessionFormFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowEditSession(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleEditSession} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </Modal>

      <Modal isOpen={showAddTerm} onClose={() => setShowAddTerm(false)} title="Add Term">
        {termFormFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowAddTerm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAddTerm} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Creating..." : "Create"}</button>
        </div>
      </Modal>

      <Modal isOpen={showEditTerm} onClose={() => setShowEditTerm(false)} title="Edit Term">
        {termFormFields()}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowEditTerm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleEditTerm} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </Modal>
    </div>
  );
}
