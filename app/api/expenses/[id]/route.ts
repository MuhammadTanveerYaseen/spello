import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { formatPKR } from "@/lib/format";
import Expense from "@/models/Expense";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const expense = await Expense.findByIdAndDelete(id);

  if (expense) {
    await logActivity(
      "Expense deleted",
      `${expense.title} — ${formatPKR(expense.amount)}`,
      "expense"
    );
  }

  return NextResponse.json({ success: true });
}
