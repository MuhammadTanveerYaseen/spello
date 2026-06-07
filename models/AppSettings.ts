import mongoose, { Schema, models } from "mongoose";

const AppSettingsSchema = new Schema(
  {
    securityKeyHash: { type: String, required: true },
    ownerName: { type: String, default: "" },
    cafeName: { type: String, default: "Spello Cafe" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    isSetup: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.AppSettings ||
  mongoose.model("AppSettings", AppSettingsSchema);
