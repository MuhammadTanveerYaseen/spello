import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCachedDashboardStats } from "@/lib/dashboard-stats";
import { getCafeName } from "@/lib/settings";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ stats, fund }, cafeName] = await Promise.all([getCachedDashboardStats(), getCafeName()]);

  const { totalExpenses } = stats;
  const availableBalance = fund.netFund - totalExpenses;
  const utilization =
    fund.netFund > 0 ? Math.min(100, Math.round((totalExpenses / fund.netFund) * 100)) : 0;

  return NextResponse.json(
    {
      ...stats,
      totalFund: fund.netFund,
      totalContributions: fund.contributions,
      totalReturns: fund.returns,
      availableBalance,
      utilization,
      cafeName,
    },
    {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" },
    }
  );
}
