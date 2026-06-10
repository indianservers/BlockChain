import { AlertTriangle, CheckCircle2, Clock, DollarSign } from "lucide-react";

export default function TransactionQueueCard({ transaction, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(transaction.id)}
      className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${
        selected
          ? "border-cyanx bg-cyanx/10 ring-4 ring-cyanx/15"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-black">{transaction.id}</h4>
          <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{transaction.sender} {"->"} {transaction.receiver}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${transaction.valid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
          {transaction.valid ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />} {transaction.valid ? "Valid" : "Invalid"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <Metric icon={DollarSign} label="Amount" value={transaction.amount} />
        <Metric icon={DollarSign} label="Fee" value={transaction.fee} />
        <Metric icon={Clock} label="Age" value={`${transaction.age}s`} />
      </div>
    </button>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950/40">
      <p className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400"><Icon size={12} /> {label}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}
