import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { EXPENSE_LIST_FIELDS, INVESTMENT_LIST_FIELDS } from "@/lib/fields";
import { getCachedDashboardStats } from "@/lib/dashboard-stats";
import { getCafeName } from "@/lib/settings";
import Expense from "@/models/Expense";
import Investment from "@/models/Investment";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [{ stats, fund }, cafeName, recentExpenses, recentInvestments] = await Promise.all([
    getCachedDashboardStats(),
    getCafeName(),
    Expense.find().select(EXPENSE_LIST_FIELDS).sort({ date: -1 }).limit(5).lean(),
    Investment.find().select(INVESTMENT_LIST_FIELDS).sort({ date: -1 }).limit(3).lean(),
  ]);

  const { totalExpenses } = stats;
  const availableBalance = fund.netFund - totalExpenses;
  const utilization =
    fund.netFund > 0 ? Math.min(100, Math.round((totalExpenses / fund.netFund) * 100)) : 0;

  return NextResponse.json({
    ...stats,
    totalFund: fund.netFund,
    totalContributions: fund.contributions,
    totalReturns: fund.returns,
    availableBalance,
    utilization,
    cafeName,
    recentExpenses,
    recentInvestments,
  });
}
