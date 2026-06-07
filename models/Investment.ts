import mongoose, { Schema, models } from "mongoose";

const InvestmentSchema = new Schema(
  {
    investorId: { type: Schema.Types.ObjectId, ref: "Investor", required: true },
    investorName: { type: String, required: true },
    type: { type: String, enum: ["contribution", "return"], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: "Bank Transfer" },
    reference: { type: String, default: "" },
    note: { type: String, default: "" },
    invoiceName: { type: String, default: "" },
    invoiceData: { type: String, default: "" },
    invoiceMime: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Investment ||
  mongoose.model("Investment", InvestmentSchema);
