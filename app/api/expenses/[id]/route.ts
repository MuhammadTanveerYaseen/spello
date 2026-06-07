import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { EXPENSE_LIST_FIELDS } from "@/lib/fields";
import { formatPKR } from "@/lib/format";
import Expense from "@/models/Expense";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const expense = await Expense.findById(id).select(EXPENSE_LIST_FIELDS).lean();
  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(expense);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, amount, category, description, date, vendor, invoiceName, invoiceData, invoiceMime, removeInvoice } = body;

    if (!title || amount === undefined || amount === "" || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const update: Record<string, unknown> = {
      title: String(title).trim(),
      amount: Number(amount),
      category,
      description: description || "",
      date: date ? new Date(date) : new Date(),
      vendor: vendor || "",
    };

    if (removeInvoice) {
      update.invoiceName = "";
      update.invoiceData = "";
      update.invoiceMime = "";
    } else if (invoiceData) {
      update.invoiceName = invoiceName || "";
      update.invoiceData = invoiceData;
      update.invoiceMime = invoiceMime || "";
    }

    const expense = await Expense.findByIdAndUpdate(id, update, { new: true })
      .select(EXPENSE_LIST_FIELDS)
      .lean();

    if (!expense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await logActivity(
      "Expense updated",
      `${expense.title} — ${formatPKR(expense.amount)} (${expense.category})`,
      "expense"
    );

    return NextResponse.json(expense);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const expense = await Expense.findByIdAndDelete(id);

  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity(
    "Expense deleted",
    `${expense.title} — ${formatPKR(expense.amount)}`,
    "expense"
  );

  return NextResponse.json({ success: true });
}
