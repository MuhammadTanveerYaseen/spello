"use client";

import FilterBar, { emptyFilters, filtersToParams, type Filters } from "@/components/FilterBar";
import { ListSkeleton } from "@/components/ListSkeleton";
import { useMemo, useState } from "react";
import { usePaginatedList } from "@/hooks/usePaginatedList";

interface ActivityItem {
  _id: string;
  action: string;
  details: string;
  type: string;
  createdAt: string;
}

const typeOptions = [
  { value: "expense", label: "Expenses" },
  { value: "investment", label: "Funding" },
  { value: "investor", label: "Investors" },
  { value: "auth", label: "Auth" },
  { value: "profile", label: "Account" },
  { value: "system", label: "System" },
];

const typeStyles: Record<string, string> = {
  expense: "border-l-2 border-l-red-500 bg-slate-800",
  investment: "border-l-2 border-l-emerald-500 bg-slate-800",
  investor: "border-l-2 border-l-teal-500 bg-slate-800",
  auth: "border-l-2 border-l-blue-500 bg-slate-800",
  profile: "border-l-2 border-l-indigo-500 bg-slate-800",
  system: "border-l-2 border-l-slate-500 bg-slate-800",
};

export default function ActivityPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const filtersKey = useMemo(() => filtersToParams(filters), [filters]);

  const { items, meta, loading, loadingMore, hasMore, loadMore } = usePaginatedList<ActivityItem>({
    baseUrl: "/api/activity",
    filtersKey,
    getItems: (d) => (d.logs as ActivityItem[]) ?? [],
    getHasMore: (d) => !!d.hasMore,
  });

  const totalCount = (meta.totalCount as number) ?? 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-lg font-bold sm:text-xl">Audit Log</h1>
        <p className="text-xs text-slate-400 sm:text-sm">
          {loading && !items.length ? "Loading..." : `${totalCount} entries`}
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} showType typeOptions={typeOptions} collapsible />

      {loading && !items.length ? (
        <ListSkeleton rows={5} />
      ) : !items.length ? (
        <p className="py-10 text-center text-sm text-slate-500">No entries match filters</p>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((log) => (
              <div
                key={log._id}
                className={`rounded-lg border border-slate-700 p-3 sm:p-4 ${typeStyles[log.type] || typeStyles.system}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    {log.details && <p className="mt-0.5 text-xs text-slate-400">{log.details}</p>}
                  </div>
                  <span className="shrink-0 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                    {log.type}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  {new Date(log.createdAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            ))}
          </div>
          {hasMore && (
            <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-secondary w-full py-3 text-sm">
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
