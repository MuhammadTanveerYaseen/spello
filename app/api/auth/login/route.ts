import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activity";
import { setSessionCookie, signToken } from "@/lib/auth";
import { ensureAppSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const { securityKey } = await req.json();

    if (!securityKey) {
      return NextResponse.json({ error: "Security key required" }, { status: 400 });
    }

    const settings = await ensureAppSettings();
    const valid = await bcrypt.compare(securityKey, settings.securityKeyHash);

    if (!valid) {
      await logActivity("Failed login attempt", "Invalid security key", "auth");
      return NextResponse.json({ error: "Invalid security key" }, { status: 401 });
    }

    const token = signToken();
    await setSessionCookie(token);
    await logActivity("Logged in", "Security key verified", "auth");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
