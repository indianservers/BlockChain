import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { hashPreview } from "../../utils/blockchainEngine.js";

export default function BlockCard({ block, validation, active = false, compact = false, onEdit }) {
  const valid = validation?.valid ?? true;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border bg-white p-4 shadow-soft transition dark:bg-slate-900/85 ${
        active ? "border-cyanx ring-4 ring-cyanx/15" : valid ? "border-slate-200 dark:border-white/10" : "border-red-400 ring-4 ring-red-500/10"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black">Block #{block.index}</h3>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${valid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
          {valid ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {valid ? "Valid" : "Invalid"}
        </span>
      </div>

      <div className="grid gap-2 text-sm">
        <Field label="Timestamp" value={new Date(block.timestamp).toLocaleTimeString()} />
        <Field label="Data" value={block.data} strong />
        {!compact && <Field label="Nonce" value={block.nonce} />}
        <Field label="Previous hash" value={hashPreview(block.previousHash)} mono status={validation?.linkValid === false ? "broken" : "ok"} />
        <Field label="Current hash" value={hashPreview(block.hash)} mono status={validation?.ownHashValid === false ? "broken" : "ok"} />
      </div>

      {onEdit && (
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Edit block data</span>
          <input
            value={block.data}
            onChange={event => onEdit(block.index, event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-semibold outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5"
          />
        </label>
      )}
    </motion.article>
  );
}

function Field({ label, value, mono, strong, status }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`${mono ? "font-mono" : ""} ${strong ? "font-black" : "font-bold"} break-words ${status === "broken" ? "text-red-500" : ""}`}>{value}</p>
    </div>
  );
}
