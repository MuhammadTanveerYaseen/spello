import mongoose, { Schema, models } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    action: { type: String, required: true },
    details: { type: String, default: "" },
    type: {
      type: String,
      enum: ["expense", "investment", "investor", "inventory", "auth", "profile", "system"],
      default: "system",
    },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });

export default models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
