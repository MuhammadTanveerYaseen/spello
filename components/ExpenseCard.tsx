import { formatPKR } from "@/lib/format";
import Link from "next/link";
import { ViewInvoiceButton } from "@/components/InvoiceUpload";

interface ExpenseCardProps {
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  invoiceName?: string;
  onDelete?: () => void;
}

export default function ExpenseCard({
  id,
  title,
  amount,
  category,
  date,
  vendor,
  invoiceName,
  onDelete,
}: ExpenseCardProps) {
  const hasInvoice = !!invoiceName;
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
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
        <span className="shrink-0 text-base font-bold text-red-400">-{formatPKR(amount)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3">
        {id && (
          <Link
            href={`/expenses/${id}/edit`}
            className="min-h-[36px] text-xs font-medium text-blue-400 active:text-blue-300"
          >
            Edit
          </Link>
        )}
        {id && hasInvoice && (
          <ViewInvoiceButton type="expenses" id={id} invoiceName={invoiceName} />
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="min-h-[36px] text-xs font-medium text-slate-500 active:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
