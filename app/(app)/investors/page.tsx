"use client";

import FilterBar, { emptyFilters, filtersToParams, type Filters } from "@/components/FilterBar";
import InvoiceUpload, { ViewInvoiceButton, type InvoiceData } from "@/components/InvoiceUpload";
import { ListSkeleton } from "@/components/ListSkeleton";
import {
  INVESTOR_ROLES,
  INVESTMENT_TYPES,
  PAYMENT_METHODS,
} from "@/lib/constants";
import { formatPKR } from "@/lib/format";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface Investor {
  _id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  sharePercent: number;
  contributions: number;
  returns: number;
  netFund: number;
}

interface Investment {
  _id: string;
  investorName: string;
  type: "contribution" | "return";
  amount: number;
  date: string;
  paymentMethod: string;
  reference: string;
  note: string;
  invoiceName?: string;
}

const typeOptions = [
  { value: "contribution", label: "Contributions" },
  { value: "return", label: "Returns" },
];

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showInvestorForm, setShowInvestorForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData>({ name: "", data: "", mime: "" });
  const [formError, setFormError] = useState("");

  const filtersKey = useMemo(() => filtersToParams(filters), [filters]);

  const { items: investments, meta, loading, loadingMore, hasMore, loadMore, refresh } =
    usePaginatedList<Investment>({
      baseUrl: "/api/investments",
      filtersKey,
      getItems: (d) => (d.investments as Investment[]) ?? [],
      getHasMore: (d) => !!d.hasMore,
    });

  const fund = (meta.fund as { contributions: number; returns: number; netFund: number }) ?? {
    contributions: 0,
    returns: 0,
    netFund: 0,
  };
  const availableBalance = (meta.availableBalance as number) ?? 0;
  const totalExpenses = (meta.totalExpenses as number) ?? 0;
  const utilization = (meta.utilization as number) ?? 0;
  const totalCount = (meta.totalCount as number) ?? 0;

  function loadInvestors() {
    fetch("/api/investors")
      .then((r) => r.json())
      .then(setInvestors);
  }

  useEffect(loadInvestors, []);

  async function handleAddInvestor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/investors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        role: form.get("role"),
        phone: form.get("phone"),
        email: form.get("email"),
        sharePercent: form.get("sharePercent"),
        notes: form.get("notes"),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowInvestorForm(false);
      loadInvestors();
      refresh();
      (e.target as HTMLFormElement).reset();
    }
  }

  async function handleRecordTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        investorId: form.get("investorId"),
        type: form.get("type"),
        amount: form.get("amount"),
        date: form.get("date"),
        paymentMethod: form.get("paymentMethod"),
        reference: form.get("reference"),
        note: form.get("note"),
        invoiceName: invoice.name,
        invoiceData: invoice.data,
        invoiceMime: invoice.mime,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowTransactionForm(false);
      setInvoice({ name: "", data: "", mime: "" });
      loadInvestors();
      refresh();
      (e.target as HTMLFormElement).reset();
    } else {
      const data = await res.json();
      setFormError(data.error || "Failed to save");
    }
  }

  async function handleDeleteInvestor(id: string, name: string) {
    if (!confirm(`Remove investor "${name}"?`)) return;
    const res = await fetch(`/api/investors/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not delete");
      return;
    }
    loadInvestors();
    refresh();
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-lg font-bold sm:text-xl">Investor Funding</h1>
        <p className="text-xs text-slate-400 sm:text-sm">Capital & project fund</p>
      </div>

      <div className="page-header">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">Total Fund</p>
            <p className="text-lg font-bold text-emerald-400 sm:text-xl">{formatPKR(fund.netFund)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">Available</p>
            <p className={`text-lg font-bold sm:text-xl ${availableBalance >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {formatPKR(availableBalance)}
            </p>
            <p className="text-[10px] text-slate-500">{formatPKR(totalExpenses)} spent</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Utilization</span>
            <span>{utilization}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700">
            <div className={`h-full rounded-full ${utilization > 90 ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${utilization}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { setShowTransactionForm(!showTransactionForm); setShowInvestorForm(false); }}
          className="btn-primary py-3 text-sm"
        >
          Record
        </button>
        <button
          type="button"
          onClick={() => { setShowInvestorForm(!showInvestorForm); setShowTransactionForm(false); }}
          className="btn-secondary py-3 text-sm"
        >
          Add Investor
        </button>
      </div>

      {showTransactionForm && (
        <form onSubmit={handleRecordTransaction} className="card space-y-3 p-3 sm:p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Record Transaction</h3>
          <select name="investorId" required className="input-field">
            <option value="">Select investor</option>
            {investors.map((inv) => (
              <option key={inv._id} value={inv._id}>{inv.name}</option>
            ))}
          </select>
          <select name="type" required className="input-field" defaultValue="contribution">
            {INVESTMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t === "contribution" ? "Contribution (In)" : "Return (Out)"}</option>
            ))}
          </select>
          <input name="amount" type="number" min="1" step="1" required className="input-field" placeholder="Amount (PKR)" />
          <input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="input-field" />
          <select name="paymentMethod" className="input-field" defaultValue="Bank Transfer">
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input name="reference" className="input-field" placeholder="Reference no." />
          <input name="note" className="input-field" placeholder="Note (optional)" />
          <InvoiceUpload onChange={setInvoice} onError={setFormError} />
          {formError && <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{formError}</p>}
          <button type="submit" disabled={submitting || !investors.length} className="btn-primary w-full py-3 text-sm">
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      {showInvestorForm && (
        <form onSubmit={handleAddInvestor} className="card space-y-3 p-3 sm:p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">New Investor</h3>
          <input name="name" required className="input-field" placeholder="Full name" />
          <select name="role" className="input-field" defaultValue="Investor">
            {INVESTOR_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input name="phone" type="tel" className="input-field" placeholder="Phone" />
          <input name="email" type="email" className="input-field" placeholder="Email" />
          <input name="sharePercent" type="number" min="0" max="100" step="0.1" className="input-field" placeholder="Share %" />
          <input name="notes" className="input-field" placeholder="Notes" />
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm">
            {submitting ? "Saving..." : "Save Investor"}
          </button>
        </form>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Investors ({investors.length})
        </h2>
        {!investors.length ? (
          <div className="card py-6 text-center text-sm text-slate-500">No investors yet</div>
        ) : (
          <div className="space-y-2">
            {investors.map((inv) => (
              <div key={inv._id} className="card p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{inv.name}</p>
                    <p className="text-xs text-slate-500">{inv.role}{inv.sharePercent > 0 ? ` · ${inv.sharePercent}%` : ""}</p>
                  </div>
                  <p className="shrink-0 font-bold text-emerald-400">{formatPKR(inv.netFund ?? 0)}</p>
                </div>
                <button type="button" onClick={() => handleDeleteInvestor(inv._id, inv.name)} className="mt-2 min-h-[36px] text-xs text-slate-500">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        showType
        showInvestor
        collapsible
        typeOptions={typeOptions}
        investors={investors.map((i) => ({ _id: i._id, name: i.name }))}
      />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Transactions</h2>
          <span className="text-xs text-slate-500">{totalCount} total</span>
        </div>

        {loading && !investments.length ? (
          <ListSkeleton rows={4} />
        ) : !investments.length ? (
          <p className="py-8 text-center text-sm text-slate-500">No transactions found</p>
        ) : (
          <>
            <div className="space-y-2">
              {investments.map((item) => (
                <div key={item._id} className="card p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-medium">{item.investorName}</p>
                        {item.invoiceName && (
                          <span className="rounded bg-emerald-900 px-1.5 py-0.5 text-[10px] text-emerald-400">Invoice</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.type === "contribution" ? "In" : "Out"} · {new Date(item.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </p>
                      <ViewInvoiceButton type="investments" id={item._id} invoiceName={item.invoiceName} />
                    </div>
                    <span className={`shrink-0 text-sm font-bold sm:text-base ${item.type === "contribution" ? "text-emerald-400" : "text-red-400"}`}>
                      {item.type === "contribution" ? "+" : "-"}{formatPKR(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && (
              <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-secondary mt-2 w-full py-3 text-sm">
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
