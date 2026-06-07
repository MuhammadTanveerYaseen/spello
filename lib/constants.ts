export const EXPENSE_CATEGORIES = [
  "Civil & Structural",
  "Electrical Work",
  "Plumbing & Gas",
  "HVAC & Exhaust",
  "Interior & Finishing",
  "Kitchen Equipment",
  "Furniture & Fixtures",
  "Signage & Branding",
  "Permits & Legal",
  "Architect & Design",
  "Labor & Contractor",
  "Raw Materials",
  "Tools & Machinery",
  "Utilities Setup",
  "Transport & Delivery",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const MATERIAL_CATEGORIES: ExpenseCategory[] = [
  "Kitchen Equipment",
  "Raw Materials",
  "Tools & Machinery",
  "Furniture & Fixtures",
];

export const LABOR_CATEGORY: ExpenseCategory = "Labor & Contractor";

export const INVESTOR_ROLES = ["Investor", "Partner", "Silent Partner", "Sponsor"] as const;
export type InvestorRole = (typeof INVESTOR_ROLES)[number];

export const INVESTMENT_TYPES = ["contribution", "return"] as const;
export type InvestmentType = (typeof INVESTMENT_TYPES)[number];

export const PAYMENT_METHODS = [
  "Bank Transfer",
  "Cash",
  "Cheque",
  "Online Payment",
  "Other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
