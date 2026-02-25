"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardList, Save, Send } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

interface Assignment {
  id: string;
  classId: string;
  subjectId: string | null;
  classroom: { id: string; name: string };
  subject: { id: string; name: string } | null;
}

interface Term {
  id: string;
  name: string;
  isCurrent: boolean;
  session: { id: string; name: string; isCurrent: boolean };
}

interface Student {
  id: string;
  regNumber: string;
  user: { firstName: string; lastName: string };
}

interface GradingScale {
  id: string;
  minScore: number;
  maxScore: number;
  grade: string;
  remark: string;
}

interface ScoreRow {
  studentId: string;
  studentName: string;
  regNumber: string;
  ca1: string;
  ca2: string;
  ca3: string;
  exam: string;
}

function calcTotal(row: ScoreRow): number {
  return (
    Math.min(20, Math.max(0, parseFloat(row.ca1) || 0)) +
    Math.min(20, Math.max(0, parseFloat(row.ca2) || 0)) +
    Math.min(20, Math.max(0, parseFloat(row.ca3) || 0)) +
    Math.min(40, Math.max(0, parseFloat(row.exam) || 0))
  );
}

function calcGrade(total: number, scale: GradingScale[]): string {
  for (const entry of scale) {
    if (total >= entry.minScore && total <= entry.maxScore) return entry.grade;
  }
  return "F";
}

export default function EnterResultsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [gradingScale, setGradingScale] = useState<GradingScale[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/staff/assignments").then((r) => r.json()),
      fetch("/api/staff/terms").then((r) => r.json()),
      fetch("/api/staff/grading-scale").then((r) => r.json()),
    ]).then(([a, t, g]) => {
      setAssignments(a);
      setTerms(t);
      setGradingScale(g);
      const currentTerm = t.find((term: Term) => term.isCurrent);
      if (currentTerm) setSelectedTerm(currentTerm.id);
    });
  }, []);

  const loadStudentsAndResults = useCallback(async () => {
    if (!selectedAssignment || !selectedTerm) return;
    const assignment = assignments.find((a) => a.id === selectedAssignment);
    if (!assignment) return;

    setLoadingStudents(true);
    try {
      const [studentsData, existingResults] = await Promise.all([
        fetch(`/api/staff/classes/${assignment.classId}/students`).then((r) => r.json()),
        fetch(
          `/api/staff/results?classId=${assignment.classId}&subjectId=${assignment.subjectId ?? ""}&termId=${selectedTerm}`
        ).then((r) => r.json()),
      ]);

      const rows: ScoreRow[] = studentsData.map((s: Student) => {
        const existing = existingResults.find(
          (r: { studentId: string; ca1: number; ca2: number; ca3: number; exam: number }) => r.studentId === s.id
        );
        return {
          studentId: s.id,
          studentName: `${s.user.firstName} ${s.user.lastName}`,
          regNumber: s.regNumber,
          ca1: existing ? String(existing.ca1) : "",
          ca2: existing ? String(existing.ca2) : "",
          ca3: existing ? String(existing.ca3) : "",
          exam: existing ? String(existing.exam) : "",
        };
      });
      setScores(rows);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedAssignment, selectedTerm, assignments]);

  useEffect(() => {
    if (selectedAssignment && selectedTerm) {
      loadStudentsAndResults();
    } else {
      setScores([]);
    }
  }, [selectedAssignment, selectedTerm, loadStudentsAndResults]);

  function updateScore(index: number, field: keyof ScoreRow, value: string) {
    setScores((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function clampInput(value: string, max: number): string {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return String(Math.min(max, Math.max(0, num)));
  }

  async function handleSave(status: "DRAFT" | "SUBMITTED") {
    const assignment = assignments.find((a) => a.id === selectedAssignment);
    const term = terms.find((t) => t.id === selectedTerm);
    if (!assignment || !term) return;

    setSaving(true);
    try {
      const payload = scores.map((row) => ({
        studentId: row.studentId,
        subjectId: assignment.subjectId,
        classId: assignment.classId,
        sessionId: term.session.id,
        termId: selectedTerm,
        ca1: parseFloat(row.ca1) || 0,
        ca2: parseFloat(row.ca2) || 0,
        ca3: parseFloat(row.ca3) || 0,
        exam: parseFloat(row.exam) || 0,
      }));

      const res = await fetch("/api/staff/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: payload, status }),
      });

      if (res.ok) {
        toast.success(status === "DRAFT" ? "Saved as draft" : "Submitted for approval");
        await loadStudentsAndResults();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save results");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  const assignment = assignments.find((a) => a.id === selectedAssignment);

  return (
    <div className="p-8">
      <Toaster position="top-right" />
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Enter Results</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment (Class - Subject)
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select assignment...</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.classroom.name} — {a.subject ? a.subject.name : "All Subjects"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select term...</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.session.name} — {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loadingStudents && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          Loading students...
        </div>
      )}

      {!loadingStudents && scores.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto mb-4">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reg No.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA1 (/20)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA2 (/20)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CA3 (/20)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Exam (/40)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scores.map((row, i) => {
                  const total = calcTotal(row);
                  const grade = calcGrade(total, gradingScale);
                  return (
                    <tr key={row.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{row.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{row.regNumber}</td>
                      {(["ca1", "ca2", "ca3"] as const).map((field) => (
                        <td key={field} className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={row[field]}
                            onChange={(e) => updateScore(i, field, e.target.value)}
                            onBlur={(e) => updateScore(i, field, clampInput(e.target.value, 20))}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-indigo-500 mx-auto block"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={row.exam}
                          onChange={(e) => updateScore(i, "exam", e.target.value)}
                          onBlur={(e) => updateScore(i, "exam", clampInput(e.target.value, 40))}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-indigo-500 mx-auto block"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-800">
                        {total}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => handleSave("DRAFT")}
              disabled={saving || !assignment?.subjectId}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave("SUBMITTED")}
              disabled={saving || !assignment?.subjectId}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Submit for Approval
            </button>
          </div>

          {!assignment?.subjectId && (
            <p className="text-sm text-amber-600 mt-2 text-right">
              This assignment has no specific subject. Please contact admin to assign a subject.
            </p>
          )}
        </>
      )}

      {!loadingStudents && selectedAssignment && selectedTerm && scores.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No students found in this class.</p>
        </div>
      )}

      {!selectedAssignment && !selectedTerm && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Select an assignment and term to enter results.</p>
        </div>
      )}
    </div>
  );
}
