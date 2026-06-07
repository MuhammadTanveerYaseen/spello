import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { parseInvoiceData, safeInvoiceFilename } from "@/lib/invoice";
import Expense from "@/models/Expense";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const expense = await Expense.findById(id).select("invoiceName invoiceData invoiceMime").lean();
  if (!expense?.invoiceData) {
    return NextResponse.json({ error: "No invoice" }, { status: 404 });
  }

  const { buffer, mime } = parseInvoiceData(expense.invoiceData, expense.invoiceMime);
  const filename = safeInvoiceFilename(expense.invoiceName);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
