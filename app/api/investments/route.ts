import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { formatPKR } from "@/lib/format";
import { getFundSummary, sumInvestments } from "@/lib/investment";
import { buildDateFilter, buildSearchFilter } from "@/lib/query";
import Expense from "@/models/Expense";
import Investment from "@/models/Investment";
import Investor from "@/models/Investor";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const investorId = searchParams.get("investorId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");

  await connectDB();

  const query: Record<string, unknown> = {};
  if (type === "contribution" || type === "return") query.type = type;
  if (investorId) query.investorId = investorId;

  const dateFilter = buildDateFilter(from, to);
  if (Object.keys(dateFilter).length) query.date = dateFilter;

  const searchFilter = buildSearchFilter(
    ["investorName", "reference", "note", "paymentMethod", "invoiceName"],
    search
  );
  if (searchFilter) Object.assign(query, searchFilter);

  const [investments, fund, expenses, filteredTotals] = await Promise.all([
    Investment.find(query).sort({ date: -1 }),
    getFundSummary(),
    Expense.find(),
    Investment.find(query),
  ]);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const availableBalance = fund.netFund - totalExpenses;
  const utilization =
    fund.netFund > 0 ? Math.min(100, (totalExpenses / fund.netFund) * 100) : 0;

  return NextResponse.json({
    investments,
    fund,
    totalExpenses,
    availableBalance,
    utilization: Math.round(utilization),
    filteredTotals: sumInvestments(filteredTotals),
    count: investments.length,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { investorId, type, amount, date, paymentMethod, reference, note, invoiceName, invoiceData, invoiceMime } = body;

    if (!investorId || !type || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const investor = await Investor.findById(investorId);
    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    const investment = await Investment.create({
      investorId,
      investorName: investor.name,
      type,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || "Bank Transfer",
      reference: reference || "",
      note: note || "",
      invoiceName: invoiceName || "",
      invoiceData: invoiceData || "",
      invoiceMime: invoiceMime || "",
    });

    const label = type === "contribution" ? "Contribution received" : "Return paid";
    const invoiceNote = invoiceName ? " (invoice attached)" : "";
    await logActivity(
      label,
      `${investor.name} — ${formatPKR(Number(amount))}${invoiceNote}`,
      "investment"
    );

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }
}
