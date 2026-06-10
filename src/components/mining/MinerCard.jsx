import { BatteryCharging, CheckCircle2, Pickaxe } from "lucide-react";
import { hashPreview } from "../../utils/blockchainEngine.js";

export default function MinerCard({ miner, winner }) {
  const won = winner === miner.name;
  return (
    <article className={`rounded-lg border p-5 transition ${won ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-4 ring-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-100" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black">{miner.name}</h3>
          <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{miner.profile}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${won ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
          {won ? <CheckCircle2 size={13} /> : <Pickaxe size={13} />} {miner.status}
        </span>
      </div>
      <div className="grid gap-3">
        <Metric label="Current nonce" value={miner.nonce} />
        <Metric label="Attempts" value={miner.attempts} />
        <Metric label="Current hash" value={hashPreview(miner.hash, 12)} mono />
        <Metric label="Speed" value={`${miner.speed} tries/tick`} />
        <Metric label="Energy units" value={<span className="inline-flex items-center gap-1"><BatteryCharging size={14} /> {miner.energy}</span>} />
      </div>
    </article>
  );
}

function Metric({ label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950/40">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`${mono ? "font-mono text-xs" : ""} break-words font-black`}>{value}</p>
    </div>
  );
}
