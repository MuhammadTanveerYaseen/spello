import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import Investor from "@/models/Investor";
import Investment from "@/models/Investment";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [investors, totals] = await Promise.all([
    Investor.find().sort({ name: 1 }).lean(),
    Investment.aggregate([
      {
        $group: {
          _id: "$investorId",
          contributions: {
            $sum: { $cond: [{ $eq: ["$type", "contribution"] }, "$amount", 0] },
          },
          returns: {
            $sum: { $cond: [{ $eq: ["$type", "return"] }, "$amount", 0] },
          },
        },
      },
    ]),
  ]);

  const totalsMap = new Map(
    totals.map((t: { _id: string; contributions: number; returns: number }) => [
      String(t._id),
      { contributions: t.contributions, returns: t.returns, netFund: t.contributions - t.returns },
    ])
  );

  const list = investors.map((inv) => {
    const stats = totalsMap.get(String(inv._id)) ?? { contributions: 0, returns: 0, netFund: 0 };
    return { ...inv, ...stats };
  });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
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
