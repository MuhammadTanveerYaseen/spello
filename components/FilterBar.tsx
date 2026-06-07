"use client";

import { useState } from "react";

export interface Filters {
  search: string;
  category: string;
  type: string;
  investorId: string;
  from: string;
  to: string;
}

export const emptyFilters: Filters = {
  search: "",
  category: "",
  type: "",
  investorId: "",
  from: "",
  to: "",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showCategory?: boolean;
  showType?: boolean;
  showInvestor?: boolean;
  collapsible?: boolean;
  categories?: readonly string[];
  typeOptions?: { value: string; label: string }[];
  investors?: { _id: string; name: string }[];
}

export default function FilterBar({
  filters,
  onChange,
  showCategory,
  showType,
  showInvestor,
  collapsible,
  categories = [],
  typeOptions = [],
  investors = [],
}: FilterBarProps) {
  const [open, setOpen] = useState(!collapsible);
  const hasActive = Object.values(filters).some(Boolean);

  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        className={`flex w-full items-center justify-between p-3 text-left ${collapsible ? "active:bg-slate-800" : ""}`}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
          {hasActive && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActive && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(emptyFilters);
              }}
              onKeyDown={(e) => e.key === "Enter" && onChange(emptyFilters)}
              className="text-xs text-blue-400"
            >
              Clear
            </span>
          )}
          {collapsible && (
            <span className="text-slate-500">{open ? "▲" : "▼"}</span>
          )}
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-700 p-3 pt-3">
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="input-field"
            placeholder="Search..."
          />

          <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => update("from", e.target.value)}
              className="input-field"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => update("to", e.target.value)}
              className="input-field"
            />
          </div>

          {showCategory && (
            <select
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
              className="input-field"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {showInvestor && (
            <select
              value={filters.investorId}
              onChange={(e) => update("investorId", e.target.value)}
              className="input-field"
            >
              <option value="">All investors</option>
              {investors.map((inv) => (
                <option key={inv._id} value={inv._id}>{inv.name}</option>
              ))}
            </select>
          )}

          {showType && (
            <select
              value={filters.type}
              onChange={(e) => update("type", e.target.value)}
              className="input-field"
            >
              <option value="">All types</option>
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

export function filtersToParams(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.type) params.set("type", filters.type);
  if (filters.investorId) params.set("investorId", filters.investorId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  return params.toString();
}
