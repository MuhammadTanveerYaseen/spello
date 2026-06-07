import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { buildDateFilter, buildSearchFilter } from "@/lib/query";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");

  await connectDB();

  const query: Record<string, unknown> = {};
  if (type) query.type = type;

  const dateFilter = buildDateFilter(from, to);
  if (Object.keys(dateFilter).length) query.createdAt = dateFilter;

  const searchFilter = buildSearchFilter(["action", "details"], search);
  if (searchFilter) Object.assign(query, searchFilter);

  const logs = await ActivityLog.find(query).sort({ createdAt: -1 });

  return NextResponse.json({ logs, count: logs.length });
}
