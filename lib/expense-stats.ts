import Expense from "@/models/Expense";
import { LABOR_CATEGORY, MATERIAL_CATEGORIES } from "@/lib/constants";

export async function getExpenseStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await Expense.aggregate([
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
  const [row] = await Expense.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  return { total: row?.total ?? 0, count: row?.count ?? 0 };
}
