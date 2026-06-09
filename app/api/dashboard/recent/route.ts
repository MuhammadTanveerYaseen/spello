import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { EXPENSE_LIST_FIELDS, INVESTMENT_LIST_FIELDS } from "@/lib/fields";
import Expense from "@/models/Expense";
import Investment from "@/models/Investment";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [recentExpenses, recentInvestments] = await Promise.all([
    Expense.find()
      .select(EXPENSE_LIST_FIELDS)
      .sort({ date: -1 })
      .limit(5)
      .lean(),
    Investment.find()
      .select(INVESTMENT_LIST_FIELDS)
      .sort({ date: -1 })
      .limit(3)
      .lean(),
  ]);

  return NextResponse.json(
    { recentExpenses, recentInvestments },
    { headers: { "Cache-Control": "private, max-age=15" } }
  );
}
