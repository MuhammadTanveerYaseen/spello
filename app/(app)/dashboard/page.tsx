"use client";

import StatCard from "@/components/StatCard";
import ExpenseCard from "@/components/ExpenseCard";
import { ListSkeleton, PageHeaderSkeleton, StatSkeleton } from "@/components/ListSkeleton";
import { formatPKR } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";

const SUMMARY_CACHE_KEY = "spello-dashboard-summary";

interface SummaryData {
  totalExpenses: number;
  thisMonthExpenses: number;
  materialExpenses: number;
  laborExpenses: number;
  expenseCount: number;
  totalFund: number;
  availableBalance: number;
  utilization: number;
  cafeName: string;
  categoryBreakdown: Array<{ category: string; amount: number }>;
}

interface RecentData {
  recentExpenses: Array<{
    _id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    vendor?: string;
    invoiceName?: string;
    invoiceUrl?: string;
    invoiceMime?: string;
  }>;
  recentInvestments: Array<{
    _id: string;
    investorName: string;
    type: string;
    amount: number;
    date: string;
  }>;
}

function readSummaryCache(): SummaryData | null {
  try {
    const raw = sessionStorage.getItem(SUMMARY_CACHE_KEY);
    return raw ? (JSON.parse(raw) as SummaryData) : null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recent, setRecent] = useState<RecentData | null>(null);

  useEffect(() => {
    const cached = readSummaryCache();
    if (cached) setSummary(cached);

    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then((data) => {
        setSummary(data);
        sessionStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(data));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/recent")
      .then((r) => r.json())
      .then(setRecent)
      .catch(() => {});
  }, []);

  const maxCategory = summary?.categoryBreakdown[0]?.amount ?? 1;

  if (!summary) {
    return (
      <div className="space-y-4">
        <PageHeaderSkeleton />
        <StatSkeleton />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="page-header">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Construction Phase
        </p>
        <h1 className="mt-1 text-xl font-bold sm:text-2xl">{summary.cafeName}</h1>
        <p className="mt-1 text-sm text-slate-400">Financial overview</p>
      </div>

      <div className="page-header">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-500">Project Fund</p>
          <Link href="/investors" className="text-xs text-blue-400">Manage</Link>
        </div>
        <p className="text-xl font-bold text-emerald-400 sm:text-2xl">{formatPKR(summary.totalFund)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Available</p>
            <p className={`font-semibold ${summary.availableBalance >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {formatPKR(summary.availableBalance)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Utilization</p>
            <p className="font-semibold">{summary.utilization}%</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${summary.utilization}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <StatCard label="Total Spent" value={formatPKR(summary.totalExpenses)} sub={`${summary.expenseCount} expenses`} variant="expense" />
        <StatCard label="This Month" value={formatPKR(summary.thisMonthExpenses)} sub={new Date().toLocaleDateString("en-PK", { month: "short", year: "numeric" })} variant="info" />
        <StatCard label="Materials" value={formatPKR(summary.materialExpenses)} sub="Equipment" variant="default" />
        <StatCard label="Labor" value={formatPKR(summary.laborExpenses)} sub="Contractors" variant="balance" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/expenses/add" className="btn-primary py-3 text-center text-sm">Record Expense</Link>
        <Link href="/investors" className="btn-secondary py-3 text-center text-sm">Funding</Link>
      </div>

      {!!summary.categoryBreakdown.length && (
        <section className="card p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">By Category</h2>
            <Link href="/expenses" className="text-xs text-blue-400">All</Link>
          </div>
          <div className="space-y-2.5">
            {summary.categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-slate-300">{item.category}</span>
                  <span className="shrink-0 font-medium">{formatPKR(item.amount)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(4, (item.amount / maxCategory) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!recent ? (
        <ListSkeleton rows={3} />
      ) : (
        <>
          {!!recent.recentInvestments.length && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Funding</h2>
                <Link href="/investors" className="text-xs text-blue-400">All</Link>
              </div>
              <div className="space-y-2">
                {recent.recentInvestments.map((item) => (
                  <div key={item._id} className="card flex items-center justify-between gap-2 px-3 py-3 sm:px-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.investorName}</p>
                      <p className="text-xs text-slate-500">
                        {item.type === "contribution" ? "In" : "Out"} · {new Date(item.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className={`shrink-0 text-sm font-bold sm:text-base ${item.type === "contribution" ? "text-emerald-400" : "text-red-400"}`}>
                      {item.type === "contribution" ? "+" : "-"}{formatPKR(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Expenses</h2>
              <Link href="/expenses" className="text-xs text-blue-400">All</Link>
            </div>
            {!recent.recentExpenses.length ? (
              <div className="card py-8 text-center">
                <p className="text-sm text-slate-500">No expenses yet</p>
                <Link href="/expenses/add" className="mt-2 inline-block text-sm text-blue-400">Record first</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.recentExpenses.map((e) => (
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
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
