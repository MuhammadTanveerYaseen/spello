import Investment from "@/models/Investment";

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
  const investments = await Investment.find();
  return sumInvestments(investments);
}

export function investorTotals(
  investments: Array<{ investorId: unknown; type: string; amount: number }>,
  investorId: string
) {
  const mine = investments.filter((i) => String(i.investorId) === investorId);
  return sumInvestments(mine);
}
