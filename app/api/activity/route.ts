import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import { ACTIVITY_LIST_FIELDS, DEFAULT_PAGE_SIZE } from "@/lib/fields";
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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10));

  await connectDB();

  const query: Record<string, unknown> = {};
  if (type) query.type = type;

  const dateFilter = buildDateFilter(from, to);
  if (Object.keys(dateFilter).length) query.createdAt = dateFilter;

  const searchFilter = buildSearchFilter(["action", "details"], search);
  if (searchFilter) Object.assign(query, searchFilter);

  const skip = (page - 1) * limit;

  const [logs, totalCount] = await Promise.all([
    ActivityLog.find(query)
      .select(ACTIVITY_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  return NextResponse.json({
    logs,
    count: logs.length,
    totalCount,
    page,
    hasMore: skip + logs.length < totalCount,
  });
}
