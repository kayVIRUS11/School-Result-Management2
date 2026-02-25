import { ClipboardList } from "lucide-react";

export default function EnterResultsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Enter Results</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Select a class and subject to enter results.</p>
      </div>
    </div>
  );
}
