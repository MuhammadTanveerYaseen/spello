import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { parseInvoiceData, safeInvoiceFilename } from "@/lib/invoice";
import Investment from "@/models/Investment";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const item = await Investment.findById(id)
    .select("invoiceName invoiceUrl invoiceData invoiceMime")
    .lean();

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (item.invoiceUrl) {
    return NextResponse.redirect(item.invoiceUrl);
  }

  if (!item.invoiceData) {
    return NextResponse.json({ error: "No invoice" }, { status: 404 });
  }

  const { buffer, mime } = parseInvoiceData(item.invoiceData, item.invoiceMime);
  const filename = safeInvoiceFilename(item.invoiceName);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
