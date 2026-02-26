interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export default function LoadingSkeleton({ rows = 5, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
