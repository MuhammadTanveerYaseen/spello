import Expense from "@/models/Expense";
import { LABOR_CATEGORY, MATERIAL_CATEGORIES } from "@/lib/constants";
import type { PipelineStage } from "mongoose";

/** Only load fields needed for stats — avoids reading multi-MB invoiceData blobs. */
const STATS_PROJECT = { amount: 1, category: 1, date: 1 };

export async function getExpenseStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await Expense.aggregate([
    { $project: STATS_PROJECT },
    {
      $facet: {
        totals: [{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }],
        thisMonth: [
          { $match: { date: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
        material: [
          { $match: { category: { $in: MATERIAL_CATEGORIES } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
        labor: [
          { $match: { category: LABOR_CATEGORY } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
        byCategory: [
          { $group: { _id: "$category", amount: { $sum: "$amount" } } },
          { $sort: { amount: -1 } },
          { $limit: 6 },
        ],
      },
    },
  ]);

  return {
    totalExpenses: result.totals[0]?.total ?? 0,
    expenseCount: result.totals[0]?.count ?? 0,
    thisMonthExpenses: result.thisMonth[0]?.total ?? 0,
    materialExpenses: result.material[0]?.total ?? 0,
    laborExpenses: result.labor[0]?.total ?? 0,
    categoryBreakdown: (result.byCategory as Array<{ _id: string; amount: number }>).map(
      (c) => ({ category: c._id, amount: c.amount })
    ),
  };
}

export async function getExpenseTotal(match: Record<string, unknown> = {}) {
  const pipeline: PipelineStage[] = [];
  if (Object.keys(match).length) pipeline.push({ $match: match });
  pipeline.push({ $project: { amount: 1 } });
  pipeline.push({ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } });

  const [row] = await Expense.aggregate(pipeline);
  return { total: row?.total ?? 0, count: row?.count ?? 0 };
}
