import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getExpenseTotal, getExpenseStats } from "@/lib/expense-stats";
import { EXPENSE_LIST_FIELDS, DEFAULT_PAGE_SIZE } from "@/lib/fields";
import { formatPKR } from "@/lib/format";
import { buildDateFilter, buildSearchFilter } from "@/lib/query";
import Expense from "@/models/Expense";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10));

  await connectDB();

  const query: Record<string, unknown> = {};
  if (category) query.category = category;

  const dateFilter = buildDateFilter(from, to);
  if (Object.keys(dateFilter).length) query.date = dateFilter;

  const searchFilter = buildSearchFilter(["title", "vendor", "description", "category"], search);
  if (searchFilter) Object.assign(query, searchFilter);

  const skip = (page - 1) * limit;

  const [expenses, stats] = await Promise.all([
    Expense.find(query)
      .select(EXPENSE_LIST_FIELDS)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    getExpenseTotal(query),
  ]);

  return NextResponse.json({
    expenses,
    total: stats.total,
    count: stats.count,
    page,
    limit,
    hasMore: skip + expenses.length < stats.count,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, amount, category, description, date, vendor, invoiceName, invoiceData, invoiceMime } = body;

    if (!title || !amount || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category,
      description: description || "",
      date: date ? new Date(date) : new Date(),
      vendor: vendor || "",
      invoiceName: invoiceName || "",
      invoiceData: invoiceData || "",
      invoiceMime: invoiceMime || "",
    });

    await logActivity(
      "Expense added",
      `${title} — ${formatPKR(Number(amount))} (${category})`,
      "expense"
    );

    const { invoiceData: _, ...safe } = expense.toObject();
    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
