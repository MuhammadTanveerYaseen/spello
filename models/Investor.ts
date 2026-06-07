import mongoose, { Schema, models } from "mongoose";

const InvestorSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "Investor" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    sharePercent: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Investor || mongoose.model("Investor", InvestorSchema);
