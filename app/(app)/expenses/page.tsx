"use client";

import ExpenseCard from "@/components/ExpenseCard";
import FilterBar, { emptyFilters, filtersToParams, type Filters } from "@/components/FilterBar";
import { ListSkeleton } from "@/components/ListSkeleton";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatPKR } from "@/lib/format";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePaginatedList } from "@/hooks/usePaginatedList";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  invoiceName?: string;
  invoiceUrl?: string;
  invoiceMime?: string;
}

export default function ExpensesPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const filtersKey = useMemo(() => filtersToParams(filters), [filters]);

  const { items, meta, loading, loadingMore, hasMore, loadMore, refresh } =
    usePaginatedList<Expense>({
      baseUrl: "/api/expenses",
      filtersKey,
      getItems: (d) => (d.expenses as Expense[]) ?? [],
      getHasMore: (d) => !!d.hasMore,
    });

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Could not delete expense");
      return;
    }
    refresh();
  }

  const total = (meta.total as number) ?? 0;
  const count = (meta.count as number) ?? items.length;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold sm:text-xl">Expense Ledger</h1>
          <p className="text-xs text-slate-400 sm:text-sm">
            {loading && !items.length ? "Loading..." : `${formatPKR(total)} · ${count} records`}
          </p>
        </div>
        <Link href="/expenses/add" className="btn-primary shrink-0 px-3 py-2.5 text-sm">
          + Record
        </Link>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        showCategory
        categories={EXPENSE_CATEGORIES}
        collapsible
      />

      {loading && !items.length ? (
        <ListSkeleton rows={6} />
      ) : !items.length ? (
        <div className="card border-dashed py-10 text-center">
          <p className="text-sm text-slate-500">No expenses match your filters</p>
          <Link href="/expenses/add" className="mt-3 inline-block text-sm text-blue-400">
            Add expense →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((e) => (
              <ExpenseCard
                key={e._id}
                id={e._id}
                title={e.title}
                amount={e.amount}
                category={e.category}
                date={e.date}
                vendor={e.vendor}
                invoiceName={e.invoiceName}
                invoiceUrl={e.invoiceUrl}
                invoiceMime={e.invoiceMime}
                onDelete={() => handleDelete(e._id)}
              />
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-secondary w-full py-3 text-sm"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
