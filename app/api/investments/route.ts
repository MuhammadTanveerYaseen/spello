import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getExpenseTotal } from "@/lib/expense-stats";
import { INVESTMENT_LIST_FIELDS, DEFAULT_PAGE_SIZE } from "@/lib/fields";
import { formatPKR } from "@/lib/format";
import { getFundSummary, getFilteredFundSummary } from "@/lib/investment";
import { buildDateFilter, buildSearchFilter } from "@/lib/query";
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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10));

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

  const skip = (page - 1) * limit;

  const [investments, fund, expenseStats, filteredTotals, totalCount] = await Promise.all([
    Investment.find(query)
      .select(INVESTMENT_LIST_FIELDS)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    getFundSummary(),
    getExpenseTotal(),
    getFilteredFundSummary(query),
    Investment.countDocuments(query),
  ]);

  const availableBalance = fund.netFund - expenseStats.total;
  const utilization =
    fund.netFund > 0 ? Math.min(100, Math.round((expenseStats.total / fund.netFund) * 100)) : 0;

  return NextResponse.json({
    investments,
    fund,
    totalExpenses: expenseStats.total,
    availableBalance,
    utilization: Math.round(utilization),
    filteredTotals,
    count: investments.length,
    totalCount,
    page,
    hasMore: skip + investments.length < totalCount,
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
    const investor = await Investor.findById(investorId).lean();
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

    const { invoiceData: _, ...safe } = investment.toObject();
    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }
}
