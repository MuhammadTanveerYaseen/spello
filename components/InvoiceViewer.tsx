"use client";

import { cloudinaryThumb } from "@/lib/cloudinary-client";
import { useCallback, useEffect, useState } from "react";

interface InvoicePreviewModalProps {
  open: boolean;
  url: string;
  invoiceName: string;
  mime: string;
  onClose: () => void;
}

export function InvoicePreviewModal({
  open,
  url,
  invoiceName,
  mime,
  onClose,
}: InvoicePreviewModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const isImage = mime.startsWith("image/") || /\.(jpe?g|png|gif|webp)$/i.test(invoiceName);
  const isPdf = mime === "application/pdf" || invoiceName.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0f]"
      role="dialog"
      aria-modal="true"
      aria-label="Invoice preview"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 safe-top">
        <p className="min-w-0 truncate text-sm font-medium text-slate-200">{invoiceName}</p>
        <div className="flex shrink-0 items-center gap-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-400"
          >
            Open
          </a>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] text-sm font-medium text-slate-300"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto p-3">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={invoiceName}
            className="max-h-[calc(100dvh-4rem)] max-w-full object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={url}
            title={invoiceName}
            className="h-[calc(100dvh-4rem)] w-full rounded-lg bg-white"
          />
        ) : (
          <div className="text-center">
            <p className="mb-3 text-sm text-slate-400">Preview not available</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block px-4 py-2 text-sm">
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

interface ViewInvoiceButtonProps {
  type: "expenses" | "investments";
  id: string;
  invoiceName?: string;
  invoiceUrl?: string;
  invoiceMime?: string;
  compact?: boolean;
}

export function ViewInvoiceButton({
  type,
  id,
  invoiceName,
  invoiceUrl,
  invoiceMime = "",
  compact = false,
}: ViewInvoiceButtonProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [mime, setMime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = `/api/${type}/${id}/invoice`;
  const label = compact ? "Preview" : "View invoice";

  const close = useCallback(() => {
    setOpen(false);
    setUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  async function viewInvoice() {
    setError("");

    if (invoiceUrl) {
      setUrl(invoiceUrl);
      setMime(invoiceMime);
      setOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl, { credentials: "same-origin" });
      if (!res.ok) {
        setError(res.status === 404 ? "No file" : "Failed");
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.url) {
          setUrl(data.url);
          setMime(data.mime || invoiceMime);
          setOpen(true);
          return;
        }
      }

      const blob = await res.blob();
      if (!blob.size) {
        setError("Empty file");
        return;
      }

      setMime(blob.type || contentType);
      setUrl(URL.createObjectURL(blob));
      setOpen(true);
    } catch {
      setError("Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!invoiceName && !invoiceUrl) return null;

  const thumb =
    invoiceUrl && (invoiceMime.startsWith("image/") || !invoiceMime)
      ? cloudinaryThumb(invoiceUrl, 64)
      : null;

  return (
    <>
      <span className="inline-flex items-center gap-2">
        {thumb && compact && (
          <button type="button" onClick={viewInvoice} className="shrink-0 overflow-hidden rounded-lg border border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt="" className="h-10 w-10 object-cover" />
          </button>
        )}
        <span className="inline-flex flex-col gap-0.5">
          <button
            type="button"
            onClick={viewInvoice}
            disabled={loading}
            className="min-h-[36px] text-xs font-medium text-blue-400 active:text-blue-300 disabled:opacity-50"
          >
            {loading ? "Loading..." : label}
          </button>
          {error && <span className="text-[10px] text-red-400">{error}</span>}
        </span>
      </span>

      {open && url && (
        <InvoicePreviewModal
          open={open}
          url={url}
          invoiceName={invoiceName || "Invoice"}
          mime={mime || invoiceMime}
          onClose={close}
        />
      )}
    </>
  );
}
