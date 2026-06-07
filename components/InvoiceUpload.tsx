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
  const [error, setError] = useState("");

  if (!invoiceName) return null;

  async function openInvoice() {
    setLoading(true);
    setError("");

    const tab = window.open("about:blank", "_blank");

    try {
      const res = await fetch(`/api/${type}/${id}/invoice`);
      if (!res.ok) {
        tab?.close();
        setError("Not found");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename = invoiceName || "invoice";

      if (tab) {
        tab.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch {
      tab?.close();
      setError("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={openInvoice}
        disabled={loading}
        className="min-h-[36px] text-xs font-medium text-blue-400 active:text-blue-300 disabled:opacity-50"
      >
        {loading ? "Opening..." : "View invoice"}
      </button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </span>
  );
}
