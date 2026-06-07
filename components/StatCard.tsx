interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "expense" | "income" | "info" | "balance";
}

const variants = {
  default: "border-slate-600 bg-slate-800",
  expense: "border-red-800 bg-red-950",
  income: "border-emerald-800 bg-emerald-950",
  info: "border-blue-800 bg-blue-950",
  balance: "border-indigo-800 bg-indigo-950",
};

export default function StatCard({
  label,
  value,
  sub,
  variant = "default",
}: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${variants[variant]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
