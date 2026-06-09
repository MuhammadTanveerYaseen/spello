import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { clearSettingsCache, ensureAppSettings, getProfileSettings } from "@/lib/settings";
import AppSettings from "@/models/AppSettings";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileSettings();
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ownerName, cafeName, email, phone, address } = body;

    const settings = await ensureAppSettings();
    const updated = await AppSettings.findByIdAndUpdate(
      settings._id,
      { ownerName, cafeName, email, phone, address },
      { new: true }
    )
      .select("-securityKeyHash")
      .lean();

    void logActivity("Profile updated", cafeName || "Spello Cafe", "profile");
    clearSettingsCache();

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
