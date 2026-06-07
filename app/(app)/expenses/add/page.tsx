"use client";

import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

export default function AddExpensePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState({ name: "", data: "", mime: "" });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Invoice must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setInvoicePreview(file.type.startsWith("image/") ? result : null);
      setInvoiceData({
        name: file.name,
        data: result,
        mime: file.type,
      });
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      amount: form.get("amount"),
      category: form.get("category"),
      description: form.get("description"),
      date: form.get("date"),
      vendor: form.get("vendor"),
      invoiceName: invoiceData.name,
      invoiceData: invoiceData.data,
      invoiceMime: invoiceData.mime,
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      router.push("/expenses");
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Record Expense</h1>
        <p className="text-sm text-slate-400">Log a construction-related payment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Title *</label>
          <input name="title" required className="input-field" placeholder="Floor tiles - main area" />
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
              className="input-field"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Date</label>
            <input
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Category *</label>
          <select name="category" required className="input-field">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#1a1033]">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Vendor</label>
          <input name="vendor" className="input-field" placeholder="Supplier name" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Description</label>
          <textarea
            name="description"
            rows={2}
            className="input-field resize-none"
            placeholder="Additional notes..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Upload Invoice</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="input-field file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:text-white"
          />
          {invoiceData.name && (
            <p className="mt-1 text-xs text-emerald-300">✓ {invoiceData.name}</p>
          )}
          {invoicePreview && (
            <img
              src={invoicePreview}
              alt="Invoice preview"
              className="mt-2 max-h-32 rounded-lg border border-slate-600 object-cover"
            />
          )}
        </div>

        {error && (
          <p className="rounded-xl bg-rose-500/20 px-3 py-2 text-sm text-rose-300">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
