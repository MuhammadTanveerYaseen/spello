import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import Investor from "@/models/Investor";
import Investment from "@/models/Investment";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const investor = await Investor.findById(id);
  if (!investor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const linked = await Investment.countDocuments({ investorId: id });
  if (linked > 0) {
    return NextResponse.json(
      { error: "Cannot delete investor with existing transactions" },
      { status: 400 }
    );
  }

  await Investor.findByIdAndDelete(id);
  await logActivity("Investor removed", investor.name, "investor");

  return NextResponse.json({ success: true });
}
