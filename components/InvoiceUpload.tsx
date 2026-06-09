"use client";

import { useState } from "react";

export interface InvoiceData {
  name: string;
  url: string;
  publicId: string;
  mime: string;
  resourceType?: "image" | "raw";
}

interface InvoiceUploadProps {
  onChange: (data: InvoiceData) => void;
  onClear?: () => void;
  onError?: (message: string) => void;
  existingName?: string;
  existingUrl?: string;
}

export default function InvoiceUpload({
  onChange,
  onClear,
  onError,
  existingName,
  existingUrl,
}: InvoiceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(existingName || "");
  const [preview, setPreview] = useState<string | null>(
    existingUrl && existingUrl.includes("res.cloudinary.com") ? existingUrl : null
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onError?.("File must be under 10MB");
      return;
    }

    setUploading(true);
    onError?.("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        onError?.(data.error || "Upload failed");
        return;
      }

      setFileName(data.name);
      setPreview(data.mime?.startsWith("image/") ? data.url : null);
      onChange({
        name: data.name,
        url: data.url,
        publicId: data.publicId,
        mime: data.mime,
        resourceType: data.resourceType,
      });
    } catch {
      onError?.("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function clearFile() {
    setFileName("");
    setPreview(null);
    onClear?.();
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-slate-400">
        Receipt / Invoice <span className="text-slate-600">(optional)</span>
      </label>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        disabled={uploading}
        className="input-field file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:text-white disabled:opacity-50"
      />
      {uploading && <p className="mt-1 text-xs text-blue-400">Uploading to Cloudinary...</p>}
      {fileName && !uploading && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-emerald-400">✓ {fileName}</p>
          <button type="button" onClick={clearFile} className="text-xs text-slate-500 hover:text-red-400">
            Remove
          </button>
        </div>
      )}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Receipt preview"
          className="mt-2 max-h-32 rounded-lg border border-slate-600 object-cover"
        />
      )}
    </div>
  );
}

export { ViewInvoiceButton } from "@/components/InvoiceViewer";
