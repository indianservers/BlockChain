import { CheckCircle2, Lock, Play } from "lucide-react";

export default function MissionStepCard({ step, index, active, complete, locked, onRun }) {
  return (
    <article className={`rounded-lg border p-4 shadow-soft ${complete ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-500/15" : active ? "border-cyanx bg-cyanx/10 ring-4 ring-cyanx/15" : locked ? "border-slate-200 bg-slate-100 opacity-70 dark:border-white/10 dark:bg-slate-800" : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/80"}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Action {index + 1}</p>
        {complete ? <CheckCircle2 className="text-emerald-500" size={20} /> : locked ? <Lock size={18} /> : null}
      </div>
      <h3 className="text-xl font-black">{step.title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-600 dark:text-slate-300">{step.instruction}</p>
      <button type="button" onClick={onRun} disabled={locked || complete} className="btn-primary mt-4 min-h-10 disabled:cursor-not-allowed disabled:opacity-45">
        <Play size={16} /> Complete Action
      </button>
    </article>
  );
}
