import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST() {
  await clearSessionCookie();
  await logActivity("Logged out", "", "auth");
  return NextResponse.json({ success: true });
}
