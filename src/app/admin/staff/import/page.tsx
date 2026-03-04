"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Upload, Download, ArrowLeft, CheckCircle, XCircle, SkipForward } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

interface ParsedRow {
  staffIdNumber: string;
  firstName: string;
  lastName: string;
}

interface ImportResult {
  total: number;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  credentials: { staffIdNumber: string; password?: string }[];
  errors: { staffIdNumber: string; error: string }[];
}

const SAMPLE_CSV = `staffIdNumber,firstName,lastName
TCH001,James,Wilson
TCH002,Sarah,Connor
TCH003,Michael,Brown`;

export default function ImportStaffPage() {
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
      const res = await fetch("/api/admin/staff/import", {
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
    const csv = Papa.unparse(result.credentials.map(c => ({ staffIdNumber: c.staffIdNumber, password: c.password })));
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff-credentials.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/staff" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Staff from CSV</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Upload CSV File</h2>
          <button onClick={downloadSample} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800">
            <Download className="w-4 h-4" /> Download Template
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Required columns: <code className="bg-gray-100 px-1 rounded">staffIdNumber</code>, <code className="bg-gray-100 px-1 rounded">firstName</code>, <code className="bg-gray-100 px-1 rounded">lastName</code>.
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
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Staff ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">First Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Last Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{r.staffIdNumber}</td>
                    <td className="px-4 py-2">{r.firstName}</td>
                    <td className="px-4 py-2">{r.lastName}</td>
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
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Staff ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.credentials.map(c => (
                      <tr key={c.staffIdNumber}>
                        <td className="px-4 py-2 font-mono">{c.staffIdNumber}</td>
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
                    <span className="font-mono">{e.staffIdNumber}</span>: {e.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <button onClick={() => router.push("/admin/staff")} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Back to Staff
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
