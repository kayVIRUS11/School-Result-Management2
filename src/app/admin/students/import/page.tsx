"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Upload, Download, ArrowLeft, CheckCircle, XCircle, SkipForward } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

interface ParsedRow {
  regNumber: string;
  firstName: string;
  lastName: string;
  className?: string;
  classId?: string;
  guardianName?: string;
  guardianPhone?: string;
}

interface ImportResult {
  total: number;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  credentials: { regNumber: string; password?: string }[];
  errors: { regNumber: string; error: string }[];
}

const SAMPLE_CSV = `regNumber,firstName,lastName,className,guardianName,guardianPhone
STU001,John,Doe,JSS1,Mary Doe,08012345678
STU002,Jane,Smith,JSS2,Robert Smith,08087654321
STU003,Alice,Johnson,SSS1,,`;

export default function ImportStudentsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        setRows(parsed.data);
        setResult(null);
        toast.success(`Parsed ${parsed.data.length} rows`);
      },
      error: () => toast.error("Failed to parse CSV"),
    });
  };

  const handleImport = async () => {
    if (rows.length === 0) { toast.error("No rows to import"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Import failed"); return; }
      setResult(data);
      toast.success(`Import complete: ${data.successCount} created, ${data.skippedCount} skipped, ${data.errorCount} errors`);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const downloadCredentials = () => {
    if (!result) return;
    const csv = Papa.unparse(result.credentials.map(c => ({ regNumber: c.regNumber, password: c.password })));
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-credentials.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/students" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Students from CSV</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Upload CSV File</h2>
          <button onClick={downloadSample} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800">
            <Download className="w-4 h-4" /> Download Template
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Required columns: <code className="bg-gray-100 px-1 rounded">regNumber</code>, <code className="bg-gray-100 px-1 rounded">firstName</code>, <code className="bg-gray-100 px-1 rounded">lastName</code>, <code className="bg-gray-100 px-1 rounded">className</code> (or <code className="bg-gray-100 px-1 rounded">classId</code>).
          Optional: <code className="bg-gray-100 px-1 rounded">guardianName</code>, <code className="bg-gray-100 px-1 rounded">guardianPhone</code>.
        </p>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Click to select a CSV file</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Preview ({rows.length} rows)</h2>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> {loading ? "Importing..." : "Import All"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Reg Number</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">First Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Last Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Guardian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{r.regNumber}</td>
                    <td className="px-4 py-2">{r.firstName}</td>
                    <td className="px-4 py-2">{r.lastName}</td>
                    <td className="px-4 py-2">{r.className ?? r.classId ?? "-"}</td>
                    <td className="px-4 py-2">{r.guardianName ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && <p className="text-xs text-gray-400 px-4 py-2">...and {rows.length - 10} more rows</p>}
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Import Results</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-700">{result.successCount}</div>
              <div className="text-sm text-green-600">Created</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <SkipForward className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-yellow-700">{result.skippedCount}</div>
              <div className="text-sm text-yellow-600">Skipped</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-red-700">{result.errorCount}</div>
              <div className="text-sm text-red-600">Errors</div>
            </div>
          </div>

          {result.credentials.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-700">Generated Credentials</h3>
                <button onClick={downloadCredentials} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
                  <Download className="w-4 h-4" /> Download CSV
                </button>
              </div>
              <div className="overflow-x-auto max-h-48 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Reg Number</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.credentials.map(c => (
                      <tr key={c.regNumber}>
                        <td className="px-4 py-2 font-mono">{c.regNumber}</td>
                        <td className="px-4 py-2 font-mono">{c.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Errors</h3>
              <div className="space-y-1">
                {result.errors.map((e, i) => (
                  <div key={i} className="text-sm text-red-600 bg-red-50 rounded px-3 py-1.5">
                    <span className="font-mono">{e.regNumber}</span>: {e.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <button onClick={() => router.push("/admin/students")} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Back to Students
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
