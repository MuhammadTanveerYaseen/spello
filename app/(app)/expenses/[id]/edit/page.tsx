"use client";

import InvoiceUpload, { type InvoiceData } from "@/components/InvoiceUpload";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  vendor?: string;
  invoiceName?: string;
  invoiceUrl?: string;
  invoiceMime?: string;
}

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [removeInvoice, setRemoveInvoice] = useState(false);

  useEffect(() => {
    fetch(`/api/expenses/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setExpense)
      .catch(() => setError("Expense not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      title: form.get("title"),
      amount: form.get("amount"),
      category: form.get("category"),
      description: form.get("description"),
      date: form.get("date"),
      vendor: form.get("vendor"),
    };

    if (removeInvoice) {
      body.removeInvoice = true;
    } else if (invoice?.url) {
      body.invoiceName = invoice.name;
      body.invoiceUrl = invoice.url;
      body.invoicePublicId = invoice.publicId;
      body.invoiceMime = invoice.mime;
      body.invoiceResourceType = invoice.resourceType;
    }

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }

      router.push("/expenses");
    } catch {
      setError("Connection failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-800" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-800" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="card py-10 text-center">
        <p className="text-sm text-slate-400">{error || "Expense not found"}</p>
        <Link href="/expenses" className="mt-3 inline-block text-sm text-blue-400">
          Back to expenses →
        </Link>
      </div>
    );
  }

  const dateValue = new Date(expense.date).toISOString().split("T")[0];
  const hasExistingInvoice =
    !!(expense.invoiceUrl || expense.invoiceName) && !removeInvoice && !invoice;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Edit Expense</h1>
        <p className="text-sm text-slate-400">Update or correct this record anytime</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Title *</label>
          <input
            name="title"
            required
            defaultValue={expense.title}
            className="input-field"
            placeholder="Floor tiles - main area"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Amount (PKR) *</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={expense.amount}
              className="input-field"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Date</label>
            <input name="date" type="date" defaultValue={dateValue} className="input-field" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Category *</label>
          <select name="category" required defaultValue={expense.category} className="input-field">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#1a1033]">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Vendor</label>
          <input
            name="vendor"
            defaultValue={expense.vendor || ""}
            className="input-field"
            placeholder="Supplier name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={expense.description || ""}
            className="input-field resize-none"
            placeholder="Additional notes..."
          />
        </div>

        {hasExistingInvoice && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2">
            <p className="text-xs text-emerald-400">Current: {expense.invoiceName}</p>
            <button
              type="button"
              onClick={() => setRemoveInvoice(true)}
              className="mt-1 text-xs text-red-400 hover:text-red-300"
            >
              Remove receipt
            </button>
          </div>
        )}

        {removeInvoice && (
          <p className="text-xs text-amber-400">
            Receipt will be removed on save.{" "}
            <button type="button" onClick={() => setRemoveInvoice(false)} className="text-blue-400">
              Undo
            </button>
          </p>
        )}

        {(!hasExistingInvoice || invoice) && !removeInvoice && (
          <InvoiceUpload
            onChange={setInvoice}
            onClear={() => setInvoice(null)}
            onError={setError}
            existingName={expense.invoiceName}
            existingUrl={expense.invoiceUrl}
          />
        )}

        {error && (
          <p className="rounded-xl bg-rose-500/20 px-3 py-2 text-sm text-rose-300">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Saving..." : "Update Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
