import { connectDB } from "@/lib/mongodb";
import { getExpenseStats } from "@/lib/expense-stats";
import { getFundSummary } from "@/lib/investment";

type DashboardStats = {
  stats: Awaited<ReturnType<typeof getExpenseStats>>;
  fund: Awaited<ReturnType<typeof getFundSummary>>;
};

let memoryCache: { data: DashboardStats; expires: number } | null = null;

export async function getCachedDashboardStats(): Promise<DashboardStats> {
  if (memoryCache && memoryCache.expires > Date.now()) {
    return memoryCache.data;
  }

  await connectDB();
  const [stats, fund] = await Promise.all([getExpenseStats(), getFundSummary()]);
  const data = { stats, fund };

  memoryCache = { data, expires: Date.now() + 60_000 };
  return data;
}

export function invalidateDashboardCache() {
  memoryCache = null;
}
