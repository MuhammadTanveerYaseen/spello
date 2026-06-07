import mongoose, { Schema, models } from "mongoose";

const ExpenseSchema = new Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    vendor: { type: String, default: "" },
    invoiceName: { type: String, default: "" },
    invoiceData: { type: String, default: "" },
    invoiceMime: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Expense || mongoose.model("Expense", ExpenseSchema);
