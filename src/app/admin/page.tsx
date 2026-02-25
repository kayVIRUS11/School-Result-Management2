"use client";

import { useEffect, useState } from "react";
import { GraduationCap, UserCog, Clock, CheckCircle } from "lucide-react";
import StatCard from "@/components/StatCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ studentCount: 0, staffCount: 0, pendingCount: 0, approvedCount: 0 });

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<GraduationCap className="w-6 h-6" />} title="Total Students" value={stats.studentCount} color="blue" />
        <StatCard icon={<UserCog className="w-6 h-6" />} title="Total Staff" value={stats.staffCount} color="green" />
        <StatCard icon={<Clock className="w-6 h-6" />} title="Pending Results" value={stats.pendingCount} color="orange" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} title="Approved Results" value={stats.approvedCount} color="indigo" />
      </div>
    </div>
  );
}
