export function parseInvoiceData(invoiceData: string, invoiceMime = "") {
  let base64 = invoiceData;
  let mime = invoiceMime;

  if (invoiceData.startsWith("data:")) {
    const comma = invoiceData.indexOf(",");
    if (comma > 0) {
      mime = mime || invoiceData.slice(5, invoiceData.indexOf(";"));
      base64 = invoiceData.slice(comma + 1);
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
