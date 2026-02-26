import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}
