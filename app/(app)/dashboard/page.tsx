"use client";

import StatCard from "@/components/StatCard";
import ExpenseCard from "@/components/ExpenseCard";
import { formatPKR } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardData {
  totalExpenses: number;
  thisMonthExpenses: number;
  materialExpenses: number;
  laborExpenses: number;
  expenseCount: number;
  totalFund: number;
  availableBalance: number;
  utilization: number;
  categoryBreakdown: Array<{ category: string; amount: number }>;
  recentExpenses: Array<{
    _id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    vendor?: string;
    invoiceName?: string;
  }>;
  recentInvestments: Array<{
    _id: string;
    investorName: string;
    type: string;
    amount: number;
    date: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [cafeName, setCafeName] = useState("Spello Cafe");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => p.cafeName && setCafeName(p.cafeName));
  }, []);

  const maxCategory = data?.categoryBreakdown[0]?.amount ?? 1;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Construction Phase
        </p>
        <h1 className="mt-1 text-2xl font-bold">{cafeName}</h1>
        <p className="mt-1 text-sm text-slate-400">Financial overview</p>
      </div>

      <div className="page-header">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-500">Project Fund</p>
          <Link href="/investors" className="text-xs text-blue-400">Manage</Link>
        </div>
        <p className="text-2xl font-bold text-emerald-400">{formatPKR(data?.totalFund ?? 0)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Available</p>
            <p className={`font-semibold ${(data?.availableBalance ?? 0) >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {formatPKR(data?.availableBalance ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Utilization</p>
            <p className="font-semibold">{data?.utilization ?? 0}%</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${data?.utilization ?? 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Spent"
          value={formatPKR(data?.totalExpenses ?? 0)}
          sub={`${data?.expenseCount ?? 0} expenses`}
          variant="expense"
        />
        <StatCard
          label="This Month"
          value={formatPKR(data?.thisMonthExpenses ?? 0)}
          sub={new Date().toLocaleDateString("en-PK", { month: "long", year: "numeric" })}
          variant="info"
        />
        <StatCard
          label="Materials"
          value={formatPKR(data?.materialExpenses ?? 0)}
          sub="Equipment & supplies"
          variant="default"
        />
        <StatCard
          label="Labor"
          value={formatPKR(data?.laborExpenses ?? 0)}
          sub="Contractor & wages"
          variant="balance"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/expenses/add" className="btn-primary text-center text-sm">
          Record Expense
        </Link>
        <Link href="/investors" className="btn-secondary text-center text-sm">
          Investor Funding
        </Link>
      </div>

      {!!data?.categoryBreakdown.length && (
        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Expenses by Category
            </h2>
            <Link href="/expenses" className="text-xs text-blue-400">View all</Link>
          </div>
          <div className="space-y-3">
            {data.categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate text-slate-300">{item.category}</span>
                  <span className="ml-2 shrink-0 font-medium">{formatPKR(item.amount)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${Math.max(4, (item.amount / maxCategory) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!data?.recentInvestments?.length && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Recent Funding
            </h2>
            <Link href="/investors" className="text-xs text-blue-400">Full history</Link>
          </div>
          <div className="space-y-2">
            {data.recentInvestments.map((item) => (
              <div key={item._id} className="card flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium">{item.investorName}</p>
                  <p className="text-xs text-slate-500">
                    {item.type === "contribution" ? "Contribution" : "Return"} ·{" "}
                    {new Date(item.date).toLocaleDateString("en-PK")}
                  </p>
                </div>
                <span className={`font-bold ${item.type === "contribution" ? "text-emerald-400" : "text-red-400"}`}>
                  {item.type === "contribution" ? "+" : "-"}
                  {formatPKR(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Recent Expenses
          </h2>
          <Link href="/expenses" className="text-xs text-blue-400">Full history</Link>
        </div>
        <div className="space-y-2">
          {!data?.recentExpenses?.length ? (
            <div className="card py-10 text-center">
              <p className="text-sm text-slate-500">No expenses recorded yet</p>
              <Link href="/expenses/add" className="mt-2 inline-block text-sm text-blue-400">
                Record first expense
              </Link>
            </div>
          ) : (
            data.recentExpenses.map((e) => (
              <ExpenseCard
                key={e._id}
                title={e.title}
                amount={e.amount}
                category={e.category}
                date={e.date}
                vendor={e.vendor}
                hasInvoice={!!e.invoiceName}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
