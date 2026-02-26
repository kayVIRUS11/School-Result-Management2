import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 bg-gray-50">
      <FileQuestion className="w-16 h-16 text-indigo-400" />
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <h2 className="text-xl font-semibold text-gray-700">Page Not Found</h2>
      <p className="text-gray-500 text-center max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
