import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
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

  await connectDB();

  const query: Record<string, unknown> = {};
  if (category) query.category = category;

  const dateFilter = buildDateFilter(from, to);
  if (Object.keys(dateFilter).length) query.date = dateFilter;

  const searchFilter = buildSearchFilter(["title", "vendor", "description", "category"], search);
  if (searchFilter) Object.assign(query, searchFilter);

  const expenses = await Expense.find(query).sort({ date: -1 });
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return NextResponse.json({ expenses, total, count: expenses.length });
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

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
