import Investment from "@/models/Investment";
import type { PipelineStage } from "mongoose";

const FUND_PROJECT = { amount: 1, type: 1 };

export function sumInvestments(investments: Array<{ type: string; amount: number }>) {
  const contributions = investments
    .filter((i) => i.type === "contribution")
    .reduce((s, i) => s + i.amount, 0);
  const returns = investments
    .filter((i) => i.type === "return")
    .reduce((s, i) => s + i.amount, 0);
  return { contributions, returns, netFund: contributions - returns };
}

export async function getFundSummary() {
  const [row] = await Investment.aggregate([
    { $project: FUND_PROJECT },
    {
      $group: {
        _id: null,
        contributions: {
          $sum: { $cond: [{ $eq: ["$type", "contribution"] }, "$amount", 0] },
        },
        returns: {
          $sum: { $cond: [{ $eq: ["$type", "return"] }, "$amount", 0] },
        },
      },
    },
  ]);

  const contributions = row?.contributions ?? 0;
  const returns = row?.returns ?? 0;
  return { contributions, returns, netFund: contributions - returns };
}

export async function getFilteredFundSummary(match: Record<string, unknown> = {}) {
  const pipeline: PipelineStage[] = [];
  if (Object.keys(match).length) pipeline.push({ $match: match });
  pipeline.push({ $project: FUND_PROJECT });
  pipeline.push({
    $group: {
      _id: null,
      contributions: {
        $sum: { $cond: [{ $eq: ["$type", "contribution"] }, "$amount", 0] },
      },
      returns: {
        $sum: { $cond: [{ $eq: ["$type", "return"] }, "$amount", 0] },
      },
    },
  });

  const [row] = await Investment.aggregate(pipeline);
  return sumInvestments([
    { type: "contribution", amount: row?.contributions ?? 0 },
    { type: "return", amount: row?.returns ?? 0 },
  ]);
}

export function investorTotals(
  investments: Array<{ investorId: unknown; type: string; amount: number }>,
  investorId: string
) {
  const mine = investments.filter((i) => String(i.investorId) === investorId);
  return sumInvestments(mine);
}
