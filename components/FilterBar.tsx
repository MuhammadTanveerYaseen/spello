"use client";

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
  categories = [],
  typeOptions = [],
  investors = [],
}: FilterBarProps) {
  const hasActive = Object.values(filters).some(Boolean);

  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
        {hasActive && (
          <button
            type="button"
            onClick={() => onChange(emptyFilters)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>

      <input
        type="search"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="input-field"
        placeholder="Search..."
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={filters.from}
          onChange={(e) => update("from", e.target.value)}
          className="input-field"
          placeholder="From"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => update("to", e.target.value)}
          className="input-field"
          placeholder="To"
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
            <option key={c} value={c}>
              {c}
            </option>
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
            <option key={inv._id} value={inv._id}>
              {inv.name}
            </option>
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
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
