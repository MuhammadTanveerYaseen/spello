import ActivityLog from "@/models/ActivityLog";
import { connectDB } from "./mongodb";

export type ActivityType =
  | "expense"
  | "investment"
  | "investor"
  | "auth"
  | "profile"
  | "system";

export async function logActivity(
  action: string,
  details = "",
  type: ActivityType = "system"
) {
  await connectDB();
  await ActivityLog.create({ action, details, type });
}
