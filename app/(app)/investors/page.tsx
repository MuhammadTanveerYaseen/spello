"use client";

import FilterBar, { emptyFilters, filtersToParams, type Filters } from "@/components/FilterBar";
import InvoiceUpload, { ViewInvoiceButton, type InvoiceData } from "@/components/InvoiceUpload";
import {
  INVESTOR_ROLES,
  INVESTMENT_TYPES,
  PAYMENT_METHODS,
} from "@/lib/constants";
import { formatPKR } from "@/lib/format";
import { FormEvent, useCallback, useEffect, useState } from "react";

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
  investorId: string;
  investorName: string;
  type: "contribution" | "return";
  amount: number;
  date: string;
  paymentMethod: string;
  reference: string;
  note: string;
  invoiceName?: string;
  invoiceData?: string;
  invoiceMime?: string;
}

const typeOptions = [
  { value: "contribution", label: "Contributions" },
  { value: "return", label: "Returns" },
];

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [fund, setFund] = useState({ contributions: 0, returns: 0, netFund: 0 });
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [utilization, setUtilization] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showInvestorForm, setShowInvestorForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData>({ name: "", data: "", mime: "" });
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const qs = filtersToParams(filters);
    const [invRes, txRes] = await Promise.all([
      fetch("/api/investors").then((r) => r.json()),
      fetch(`/api/investments${qs ? `?${qs}` : ""}`).then((r) => r.json()),
    ]);
    setInvestors(invRes);
    setInvestments(txRes.investments ?? []);
    setFund(txRes.fund ?? { contributions: 0, returns: 0, netFund: 0 });
    setAvailableBalance(txRes.availableBalance ?? 0);
    setTotalExpenses(txRes.totalExpenses ?? 0);
    setUtilization(txRes.utilization ?? 0);
    setCount(txRes.count ?? 0);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

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
      load();
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
      load();
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
    load();
  }

  const investorListForFilters = investors.map((i) => ({ _id: i._id, name: i.name }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Investor Funding</h1>
        <p className="text-sm text-slate-400">Capital contributions & project fund</p>
      </div>

      <div className="page-header">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Fund</p>
            <p className="text-xl font-bold text-emerald-400">{formatPKR(fund.netFund)}</p>
            <p className="text-xs text-slate-500">
              {formatPKR(fund.contributions)} in · {formatPKR(fund.returns)} returned
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Available</p>
            <p className={`text-xl font-bold ${availableBalance >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {formatPKR(availableBalance)}
            </p>
            <p className="text-xs text-slate-500">{formatPKR(totalExpenses)} spent</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Fund utilization</span>
            <span>{utilization}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full ${utilization > 90 ? "bg-red-500" : "bg-blue-600"}`}
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setShowTransactionForm(!showTransactionForm);
            setShowInvestorForm(false);
            if (showTransactionForm) {
              setInvoice({ name: "", data: "", mime: "" });
              setFormError("");
            }
          }}
          className="btn-primary text-sm"
        >
          Record Transaction
        </button>
        <button
          type="button"
          onClick={() => {
            setShowInvestorForm(!showInvestorForm);
            setShowTransactionForm(false);
          }}
          className="btn-secondary text-sm"
        >
          Add Investor
        </button>
      </div>

      {showTransactionForm && (
        <form onSubmit={handleRecordTransaction} className="card space-y-3 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Record Transaction
          </h3>
          <select name="investorId" required className="input-field">
            <option value="">Select investor</option>
            {investors.map((inv) => (
              <option key={inv._id} value={inv._id}>
                {inv.name}
              </option>
            ))}
          </select>
          <select name="type" required className="input-field" defaultValue="contribution">
            {INVESTMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "contribution" ? "Contribution (Money In)" : "Return (Money Out)"}
              </option>
            ))}
          </select>
          <input name="amount" type="number" min="1" step="1" required className="input-field" placeholder="Amount (PKR)" />
          <input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="input-field" />
          <select name="paymentMethod" className="input-field" defaultValue="Bank Transfer">
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input name="reference" className="input-field" placeholder="Reference / receipt no." />
          <input name="note" className="input-field" placeholder="Note (optional)" />
          <InvoiceUpload onChange={setInvoice} onError={setFormError} />
          {formError && (
            <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{formError}</p>
          )}
          <button type="submit" disabled={submitting || !investors.length} className="btn-primary w-full text-sm">
            {submitting ? "Saving..." : "Save Transaction"}
          </button>
          {!investors.length && (
            <p className="text-xs text-amber-400">Add an investor first before recording transactions.</p>
          )}
        </form>
      )}

      {showInvestorForm && (
        <form onSubmit={handleAddInvestor} className="card space-y-3 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            New Investor
          </h3>
          <input name="name" required className="input-field" placeholder="Full name" />
          <select name="role" className="input-field" defaultValue="Investor">
            {INVESTOR_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input name="phone" type="tel" className="input-field" placeholder="Phone" />
          <input name="email" type="email" className="input-field" placeholder="Email" />
          <input name="sharePercent" type="number" min="0" max="100" step="0.1" className="input-field" placeholder="Share % (optional)" />
          <input name="notes" className="input-field" placeholder="Notes (optional)" />
          <button type="submit" disabled={submitting} className="btn-primary w-full text-sm">
            {submitting ? "Saving..." : "Save Investor"}
          </button>
        </form>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Investors ({investors.length})
        </h2>
        {!investors.length ? (
          <div className="card py-8 text-center text-sm text-slate-500">
            No investors added yet
          </div>
        ) : (
          <div className="space-y-2">
            {investors.map((inv) => (
              <div key={inv._id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{inv.name}</p>
                    <p className="text-xs text-slate-500">
                      {inv.role}
                      {inv.sharePercent > 0 ? ` · ${inv.sharePercent}% share` : ""}
                    </p>
                    {(inv.phone || inv.email) && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {[inv.phone, inv.email].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{formatPKR(inv.netFund ?? 0)}</p>
                    <p className="text-[10px] text-slate-500">net contributed</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteInvestor(inv._id, inv.name)}
                  className="mt-2 text-xs text-slate-500 hover:text-red-400"
                >
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
        typeOptions={typeOptions}
        investors={investorListForFilters}
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Transaction History
          </h2>
          <span className="text-xs text-slate-500">{count} records</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : !investments.length ? (
          <p className="py-8 text-center text-sm text-slate-500">No transactions match your filters</p>
        ) : (
          <div className="space-y-2">
            {investments.map((item) => (
              <div key={item._id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.investorName}</p>
                      {item.invoiceName && (
                        <span className="shrink-0 rounded bg-emerald-900 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                          Invoice
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {item.type === "contribution" ? "Contribution" : "Return"}
                      {item.paymentMethod ? ` · ${item.paymentMethod}` : ""}
                    </p>
                    {item.reference && (
                      <p className="text-xs text-slate-500">Ref: {item.reference}</p>
                    )}
                    {item.note && <p className="text-xs text-slate-500">{item.note}</p>}
                    <p className="mt-1 text-xs text-slate-600">
                      {new Date(item.date).toLocaleDateString("en-PK")}
                    </p>
                    <ViewInvoiceButton
                      invoiceName={item.invoiceName}
                      invoiceData={item.invoiceData}
                    />
                  </div>
                  <span
                    className={`shrink-0 font-bold ${
                      item.type === "contribution" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {item.type === "contribution" ? "+" : "-"}
                    {formatPKR(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
