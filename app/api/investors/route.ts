import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { investorTotals } from "@/lib/investment";
import Investor from "@/models/Investor";
import Investment from "@/models/Investment";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const [investors, investments] = await Promise.all([
    Investor.find().sort({ name: 1 }),
    Investment.find(),
  ]);

  const list = investors.map((inv) => {
    const { contributions, returns, netFund } = investorTotals(
      investments.map((i) => ({
        investorId: i.investorId,
        type: i.type,
        amount: i.amount,
      })),
      inv._id.toString()
    );
    return {
      _id: inv._id,
      name: inv.name,
      role: inv.role,
      phone: inv.phone,
      email: inv.email,
      sharePercent: inv.sharePercent,
      notes: inv.notes,
      contributions,
      returns,
      netFund,
    };
  });

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, role, phone, email, sharePercent, notes } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Investor name is required" }, { status: 400 });
    }

    await connectDB();
    const investor = await Investor.create({
      name: name.trim(),
      role: role || "Investor",
      phone: phone || "",
      email: email || "",
      sharePercent: Number(sharePercent) || 0,
      notes: notes || "",
    });

    await logActivity("Investor added", name.trim(), "investor");

    return NextResponse.json(investor, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add investor" }, { status: 500 });
  }
}
