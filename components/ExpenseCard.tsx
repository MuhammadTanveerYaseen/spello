import { formatPKR } from "@/lib/format";

interface ExpenseCardProps {
  title: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  hasInvoice?: boolean;
  onDelete?: () => void;
}

export default function ExpenseCard({
  title,
  amount,
  category,
  date,
  vendor,
  hasInvoice,
  onDelete,
}: ExpenseCardProps) {
  return (
    <div className="card flex items-start justify-between p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{title}</h3>
          {hasInvoice && (
            <span className="shrink-0 rounded bg-emerald-900 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              Invoice
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-slate-400">
          {category}
          {vendor ? ` · ${vendor}` : ""}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {new Date(date).toLocaleDateString("en-PK", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="ml-3 flex flex-col items-end gap-2">
        <span className="text-base font-bold text-red-400">
          -{formatPKR(amount)}
        </span>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-xs text-slate-500 hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
