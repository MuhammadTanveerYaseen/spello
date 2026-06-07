"use client";

import FilterBar, { emptyFilters, filtersToParams, type Filters } from "@/components/FilterBar";
import { useCallback, useEffect, useState } from "react";

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
  { value: "auth", label: "Authentication" },
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
  inventory: "border-l-2 border-l-slate-600 bg-slate-800",
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const load = useCallback(() => {
    setLoading(true);
    const qs = filtersToParams(filters);
    fetch(`/api/activity${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs ?? []);
        setCount(data.count ?? 0);
        setLoading(false);
      });
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Audit Log</h1>
        <p className="text-sm text-slate-400">
          {count} entries — complete activity history
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} showType typeOptions={typeOptions} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : !logs.length ? (
        <p className="py-12 text-center text-sm text-slate-500">No entries match your filters</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log._id}
              className={`rounded-lg border border-slate-700 p-4 ${typeStyles[log.type] || typeStyles.system}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{log.action}</p>
                  {log.details && (
                    <p className="mt-0.5 text-sm text-slate-400">{log.details}</p>
                  )}
                </div>
                <span className="shrink-0 rounded bg-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  {log.type}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {new Date(log.createdAt).toLocaleString("en-PK")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
