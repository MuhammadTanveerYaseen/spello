import bcrypt from "bcryptjs";
import AppSettings from "@/models/AppSettings";
import { connectDB } from "./mongodb";

export const DEFAULT_SECURITY_KEY = "spello-shafiq";

let cafeNameCache: { name: string; expires: number } | null = null;

export async function getCafeName() {
  if (cafeNameCache && cafeNameCache.expires > Date.now()) {
    return cafeNameCache.name;
  }

  await connectDB();
  const settings = await AppSettings.findOne().select("cafeName").lean();
  const name = settings?.cafeName || "Spello Cafe";
  cafeNameCache = { name, expires: Date.now() + 60_000 };
  return name;
}

export function clearSettingsCache() {
  cafeNameCache = null;
}

export async function getProfileSettings() {
  await connectDB();
  const settings = await AppSettings.findOne().select("-securityKeyHash").lean();
  if (settings) return settings;
  const created = await ensureAppSettings();
  const { securityKeyHash: _, ...profile } = created.toObject();
  return profile;
}

export async function ensureAppSettings() {
  await connectDB();
  let settings = await AppSettings.findOne();
  if (!settings) {
    const hash = await bcrypt.hash(DEFAULT_SECURITY_KEY, 10);
    settings = await AppSettings.create({
      securityKeyHash: hash,
      cafeName: "Spello Cafe",
      isSetup: true,
    });
  }
  return settings;
}
