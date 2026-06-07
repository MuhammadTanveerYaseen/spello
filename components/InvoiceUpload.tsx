"use client";

import { useState } from "react";

export interface InvoiceData {
  name: string;
  data: string;
  mime: string;
}

interface InvoiceUploadProps {
  onChange: (data: InvoiceData) => void;
  onError?: (message: string) => void;
}

export default function InvoiceUpload({ onChange, onError }: InvoiceUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError?.("Invoice must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(file.type.startsWith("image/") ? result : null);
      setFileName(file.name);
      onChange({ name: file.name, data: result, mime: file.type });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-slate-400">
        Upload Invoice <span className="text-slate-600">(optional)</span>
      </label>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="input-field file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:text-white"
      />
      {fileName && (
        <p className="mt-1 text-xs text-emerald-400">Attached: {fileName}</p>
      )}
      {preview && (
        <img
          src={preview}
          alt="Invoice preview"
          className="mt-2 max-h-32 rounded-lg border border-slate-600 object-cover"
        />
      )}
    </div>
  );
}

export function ViewInvoiceButton({
  type,
  id,
  invoiceName,
}: {
  type: "expenses" | "investments";
  id: string;
  invoiceName?: string;
}) {
  const [loading, setLoading] = useState(false);

  if (!invoiceName) return null;

  async function openInvoice() {
    setLoading(true);
    try {
      const res = await fetch(`/api/${type}/${id}/invoice`);
      const data = await res.json();
      if (data.invoiceData) window.open(data.invoiceData, "_blank");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openInvoice}
      disabled={loading}
      className="min-h-[36px] text-xs font-medium text-blue-400 active:text-blue-300 disabled:opacity-50"
    >
      {loading ? "Opening..." : "View invoice"}
    </button>
  );
}
