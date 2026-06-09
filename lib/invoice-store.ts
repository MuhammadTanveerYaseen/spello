import { deleteInvoiceFile } from "@/lib/cloudinary";

export interface InvoicePayload {
  invoiceName?: string;
  invoiceUrl?: string;
  invoicePublicId?: string;
  invoiceMime?: string;
  invoiceResourceType?: "image" | "raw";
  invoiceData?: string;
  removeInvoice?: boolean;
}

export function hasInvoice(record: {
  invoiceUrl?: string;
  invoiceName?: string;
  invoiceData?: string;
}) {
  return Boolean(record.invoiceUrl || record.invoiceData || record.invoiceName);
}

export async function applyInvoiceUpdate(
  body: InvoicePayload,
  update: Record<string, unknown>,
  existing?: {
    invoicePublicId?: string;
    invoiceResourceType?: string;
    invoiceMime?: string;
    invoiceName?: string;
  }
) {
  if (body.removeInvoice) {
    if (existing?.invoicePublicId) {
      const rt = (existing.invoiceResourceType as "image" | "raw") ||
        (existing.invoiceMime === "application/pdf" ? "raw" : "image");
      void deleteInvoiceFile(existing.invoicePublicId, rt);
    }
    update.invoiceName = "";
    update.invoiceUrl = "";
    update.invoicePublicId = "";
    update.invoiceMime = "";
    update.invoiceResourceType = "";
    update.invoiceData = "";
    return;
  }

  if (body.invoiceUrl) {
    if (existing?.invoicePublicId && existing.invoicePublicId !== body.invoicePublicId) {
      const rt = (existing.invoiceResourceType as "image" | "raw") ||
        (existing.invoiceMime === "application/pdf" ? "raw" : "image");
      void deleteInvoiceFile(existing.invoicePublicId, rt);
    }
    update.invoiceName = body.invoiceName || "";
    update.invoiceUrl = body.invoiceUrl;
    update.invoicePublicId = body.invoicePublicId || "";
    update.invoiceMime = body.invoiceMime || "";
    update.invoiceResourceType = body.invoiceResourceType || "";
    update.invoiceData = "";
    return;
  }

  if (body.invoiceData) {
    update.invoiceName = body.invoiceName || "";
    update.invoiceData = body.invoiceData;
    update.invoiceMime = body.invoiceMime || "";
  }
}

export function invoiceCreateFields(body: InvoicePayload) {
  if (body.invoiceUrl) {
    return {
      invoiceName: body.invoiceName || "",
      invoiceUrl: body.invoiceUrl,
      invoicePublicId: body.invoicePublicId || "",
      invoiceMime: body.invoiceMime || "",
      invoiceResourceType: body.invoiceResourceType || "",
      invoiceData: "",
    };
  }
  return {
    invoiceName: body.invoiceName || "",
    invoiceUrl: "",
    invoicePublicId: "",
    invoiceMime: body.invoiceMime || "",
    invoiceResourceType: "",
    invoiceData: body.invoiceData || "",
  };
}
