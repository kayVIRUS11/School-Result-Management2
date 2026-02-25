"use client";

import { useState } from "react";
import { KeyRound, Lock, Save } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <Toaster position="top-right" />
      <div className="flex items-center gap-3 mb-6">
        <KeyRound className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Lock className="w-4 h-4" /> Current Password
            </label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <KeyRound className="w-4 h-4" /> New Password
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <KeyRound className="w-4 h-4" /> Confirm New Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
