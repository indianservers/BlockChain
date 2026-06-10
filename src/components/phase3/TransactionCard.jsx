import { AlertTriangle, CheckCircle2, Clock3, KeyRound } from "lucide-react";
import { shortKey } from "../../utils/transactionEngine.js";

export default function TransactionCard({ transaction, verification, compact = false }) {
  const valid = verification?.valid;
  const status = valid ? "Verified" : transaction.status;

  return (
    <article className={`rounded-lg border bg-white p-4 shadow-soft dark:bg-slate-900/85 ${valid ? "border-emerald-300 dark:border-emerald-500/30" : transaction.status === "Rejected" || transaction.status === "Tampered" ? "border-red-300 dark:border-red-500/30" : "border-slate-200 dark:border-white/10"}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">{transaction.sender} → {transaction.receiver}</h3>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{transaction.amount} tokens</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${valid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : status === "Rejected" || status === "Tampered" ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"}`}>
          {valid ? <CheckCircle2 size={14} /> : status === "Draft" ? <Clock3 size={14} /> : <AlertTriangle size={14} />}
          {status}
        </span>
      </div>
      <div className="grid gap-2 text-sm">
        <Field label="Timestamp" value={new Date(transaction.timestamp).toLocaleTimeString()} />
        <Field label="Hash" value={`${transaction.hash.slice(0, 14)}...${transaction.hash.slice(-8)}`} mono />
        {!compact && <Field label="Signature" value={transaction.signature ? shortKey(transaction.signature) : "Missing"} mono icon={<KeyRound size={14} />} />}
        {verification && !verification.valid && <Field label="Rejection reason" value={verification.reason} danger />}
      </div>
    </article>
  );
}

function Field({ label, value, mono, danger, icon }) {
  return (
    <div className={`rounded-lg p-2 ${danger ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200" : "bg-slate-50 dark:bg-white/5"}`}>
      <p className="flex items-center gap-1 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{icon}{label}</p>
      <p className={`${mono ? "font-mono" : ""} break-words font-bold`}>{value}</p>
    </div>
  );
}
