import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function BlockchainStatusPanel({ validation, tampered }) {
  const healthy = validation.invalidBlocks === 0;
  return (
    <article className="panel p-5">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-cyanx">
        <ShieldCheck size={17} /> Chain status
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Metric label="Total" value={validation.totalBlocks} />
        <Metric label="Valid" value={validation.validBlocks} good={healthy} />
        <Metric label="Invalid" value={validation.invalidBlocks} danger={!healthy} />
      </div>
      <p className={`mt-4 flex items-start gap-2 rounded-lg p-4 font-bold ${healthy ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
        {healthy ? <CheckCircle2 className="mt-0.5 shrink-0" size={19} /> : <AlertTriangle className="mt-0.5 shrink-0" size={19} />}
        {healthy ? "All block hashes and previous-hash links are valid." : `Invalid link detected. First broken block: #${validation.firstBrokenBlock + 1}.`}
      </p>
      {tampered && (
        <p className="mt-3 rounded-lg bg-amber-50 p-4 font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-100">
          Block 2 is modified. Later blocks are marked invalid until the chain is repaired.
        </p>
      )}
    </article>
  );
}

function Metric({ label, value, good, danger }) {
  return (
    <div className={`rounded-lg p-3 ${danger ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200" : good ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 dark:bg-white/5"}`}>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs font-black uppercase tracking-wide">{label}</p>
    </div>
  );
}
