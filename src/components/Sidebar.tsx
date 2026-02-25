"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  KeyRound,
  LogOut,
  ChevronRight,
  School,
  UserCheck,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: string;
  firstName: string;
  lastName: string;
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/admin/students", label: "Students", icon: <GraduationCap className="w-5 h-5" /> },
  { href: "/admin/staff", label: "Staff", icon: <Users className="w-5 h-5" /> },
  { href: "/admin/classes", label: "Classes", icon: <School className="w-5 h-5" /> },
  { href: "/admin/subjects", label: "Subjects", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/admin/sessions", label: "Sessions", icon: <Calendar className="w-5 h-5" /> },
  { href: "/admin/assignments", label: "Assignments", icon: <UserCheck className="w-5 h-5" /> },
  { href: "/admin/results", label: "Results", icon: <ClipboardList className="w-5 h-5" /> },
  { href: "/admin/results/pending", label: "Pending Results", icon: <ClipboardList className="w-5 h-5" /> },
  { href: "/admin/change-password", label: "Change Password", icon: <KeyRound className="w-5 h-5" /> },
];

const staffNav: NavItem[] = [
  { href: "/staff", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/staff/enter-results", label: "Enter Results", icon: <ClipboardList className="w-5 h-5" /> },
  { href: "/staff/my-results", label: "My Results", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/staff/change-password", label: "Change Password", icon: <KeyRound className="w-5 h-5" /> },
];

const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/student/results", label: "My Results", icon: <ClipboardList className="w-5 h-5" /> },
  { href: "/student/profile", label: "Profile", icon: <Users className="w-5 h-5" /> },
  { href: "/student/change-password", label: "Change Password", icon: <KeyRound className="w-5 h-5" /> },
];

export default function Sidebar({ role, firstName, lastName }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems =
    role === "ADMIN" ? adminNav : role === "STAFF" ? staffNav : studentNav;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-indigo-900 text-white w-64 min-h-screen">
      <div className="p-6 border-b border-indigo-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-indigo-300" />
          <div>
            <p className="font-bold text-sm">School Result</p>
            <p className="text-xs text-indigo-300">Management System</p>
          </div>
        </div>
        <button
          className="md:hidden text-indigo-300 hover:text-white"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive
                  ? "bg-indigo-700 text-white"
                  : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
            {firstName[0]}{lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{firstName} {lastName}</p>
            <p className="text-xs text-indigo-300">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-indigo-900 text-white rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:transform-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
