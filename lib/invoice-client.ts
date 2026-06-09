export function hasInvoice(record: {
  invoiceUrl?: string;
  invoiceName?: string;
  invoiceData?: string;
}) {
  return Boolean(record.invoiceUrl || record.invoiceData || record.invoiceName);
}
