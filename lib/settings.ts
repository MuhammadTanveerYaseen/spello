import bcrypt from "bcryptjs";
import AppSettings from "@/models/AppSettings";
import { connectDB } from "./mongodb";

export const DEFAULT_SECURITY_KEY = "spello-shafiq";

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
