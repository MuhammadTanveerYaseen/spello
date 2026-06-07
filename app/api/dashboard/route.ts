import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { LABOR_CATEGORY, MATERIAL_CATEGORIES } from "@/lib/constants";
import { getFundSummary } from "@/lib/investment";
import Expense from "@/models/Expense";
import Investment from "@/models/Investment";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [expenses, fund, recentInvestments] = await Promise.all([
    Expense.find().sort({ date: -1 }),
    getFundSummary(),
    Investment.find().sort({ date: -1 }).limit(3),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const thisMonthExpenses = expenses
    .filter((e) => new Date(e.date) >= startOfMonth)
    .reduce((s, e) => s + e.amount, 0);
  const materialExpenses = expenses
    .filter((e) => MATERIAL_CATEGORIES.includes(e.category as (typeof MATERIAL_CATEGORIES)[number]))
    .reduce((s, e) => s + e.amount, 0);
  const laborExpenses = expenses
    .filter((e) => e.category === LABOR_CATEGORY)
    .reduce((s, e) => s + e.amount, 0);

  const availableBalance = fund.netFund - totalExpenses;
  const utilization =
    fund.netFund > 0 ? Math.min(100, Math.round((totalExpenses / fund.netFund) * 100)) : 0;

  const breakdownMap: Record<string, number> = {};
  for (const e of expenses) {
    breakdownMap[e.category] = (breakdownMap[e.category] || 0) + e.amount;
  }
  const categoryBreakdown = Object.entries(breakdownMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([category, amount]) => ({ category, amount }));

  return NextResponse.json({
    totalExpenses,
    thisMonthExpenses,
    materialExpenses,
    laborExpenses,
    expenseCount: expenses.length,
    totalFund: fund.netFund,
    totalContributions: fund.contributions,
    totalReturns: fund.returns,
    availableBalance,
    utilization,
    categoryBreakdown,
    recentExpenses: expenses.slice(0, 5),
    recentInvestments,
  });
}
