export function parseInvoiceData(invoiceData: string, invoiceMime = "") {
  let base64 = invoiceData;
  let mime = invoiceMime;

  if (invoiceData.startsWith("data:")) {
    const match = invoiceData.match(/^data:([^;]+);base64,(.+)$/s);
    if (match) {
      mime = mime || match[1];
      base64 = match[2];
    }
  }

  return {
    buffer: Buffer.from(base64, "base64"),
    mime: mime || "application/octet-stream",
  };
}

export function safeInvoiceFilename(name: string) {
  const cleaned = name.replace(/[^\w.\-() ]+/g, "_").trim();
  return cleaned || "invoice";
}
