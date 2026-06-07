"use client";

import ExpenseCard from "@/components/ExpenseCard";
import FilterBar, { emptyFilters, filtersToParams, type Filters } from "@/components/FilterBar";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatPKR } from "@/lib/format";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  invoiceName?: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const load = useCallback(() => {
    setLoading(true);
    const qs = filtersToParams(filters);
    fetch(`/api/expenses${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setExpenses(data.expenses ?? []);
        setTotal(data.total ?? 0);
        setCount(data.count ?? 0);
        setLoading(false);
      });
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Expense Ledger</h1>
          <p className="text-sm text-slate-400">
            {formatPKR(total)} total · {count} records
          </p>
        </div>
        <Link href="/expenses/add" className="btn-primary text-sm px-4 py-2">
          + Record
        </Link>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        showCategory
        categories={EXPENSE_CATEGORIES}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : !expenses.length ? (
        <div className="card border-dashed py-12 text-center">
          <p className="text-slate-500">No expenses match your filters</p>
          <Link href="/expenses/add" className="mt-3 inline-block text-sm text-blue-400">
            Add expense →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <ExpenseCard
              key={e._id}
              title={e.title}
              amount={e.amount}
              category={e.category}
              date={e.date}
              vendor={e.vendor}
              hasInvoice={!!e.invoiceName}
              onDelete={() => handleDelete(e._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
