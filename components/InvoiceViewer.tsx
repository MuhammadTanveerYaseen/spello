"use client";

import { useCallback, useEffect, useState } from "react";

interface ViewInvoiceButtonProps {
  type: "expenses" | "investments";
  id: string;
  invoiceName?: string;
}

export function ViewInvoiceButton({ type, id, invoiceName }: ViewInvoiceButtonProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [mime, setMime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = `/api/${type}/${id}/invoice`;

  const close = useCallback(() => {
    setOpen(false);
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMime("");
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  async function viewInvoice() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl, { credentials: "same-origin" });
      if (!res.ok) {
        setError(res.status === 404 ? "No file attached" : "Could not load");
        return;
      }

      const blob = await res.blob();
      if (!blob.size) {
        setError("File is empty");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      setMime(blob.type || res.headers.get("content-type") || "");
      setUrl(objectUrl);
      setOpen(true);
    } catch {
      setError("Could not load");
    } finally {
      setLoading(false);
    }
  }

  if (!invoiceName) return null;

  const isImage = mime.startsWith("image/");
  const isPdf =
    mime === "application/pdf" || invoiceName.toLowerCase().endsWith(".pdf");

  return (
    <>
      <span className="inline-flex flex-col gap-0.5">
        <button
          type="button"
          onClick={viewInvoice}
          disabled={loading}
          className="min-h-[36px] text-xs font-medium text-blue-400 active:text-blue-300 disabled:opacity-50"
        >
          {loading ? "Loading..." : "View invoice"}
        </button>
        {error && <span className="text-[10px] text-red-400">{error}</span>}
      </span>

      {open && url && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0f]"
          role="dialog"
          aria-modal="true"
          aria-label="Invoice viewer"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 safe-top">
            <p className="min-w-0 truncate text-sm font-medium text-slate-200">
              {invoiceName}
            </p>
            <div className="flex shrink-0 items-center gap-4">
              <a
                href={apiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-blue-400"
              >
                Open
              </a>
              <button
                type="button"
                onClick={close}
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
              <object
                data={url}
                type="application/pdf"
                className="h-[calc(100dvh-4rem)] w-full rounded-lg bg-white"
              >
                <iframe
                  src={url}
                  title={invoiceName}
                  className="h-[calc(100dvh-4rem)] w-full rounded-lg bg-white"
                />
              </object>
            ) : (
              <div className="text-center">
                <p className="mb-3 text-sm text-slate-400">Preview not available</p>
                <a
                  href={url}
                  download={invoiceName}
                  className="btn-primary inline-block px-4 py-2 text-sm"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
