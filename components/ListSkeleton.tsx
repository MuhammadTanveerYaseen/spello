export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card h-[72px] p-4">
          <div className="h-4 w-2/3 rounded bg-slate-700" />
          <div className="mt-2 h-3 w-1/3 rounded bg-slate-700/70" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card h-20 rounded-xl" />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="page-header animate-pulse space-y-2">
      <div className="h-3 w-24 rounded bg-slate-700" />
      <div className="h-7 w-40 rounded bg-slate-700" />
    </div>
  );
}
