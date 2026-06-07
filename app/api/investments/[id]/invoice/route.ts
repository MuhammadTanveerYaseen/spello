import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
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

  const item = await Investment.findById(id).select("invoiceName invoiceData invoiceMime").lean();
  if (!item?.invoiceData) {
    return NextResponse.json({ error: "No invoice" }, { status: 404 });
  }

  return NextResponse.json({
    invoiceName: item.invoiceName,
    invoiceData: item.invoiceData,
    invoiceMime: item.invoiceMime,
  });
}
