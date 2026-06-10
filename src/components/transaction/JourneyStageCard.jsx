import { CheckCircle2, Circle } from "lucide-react";

export default function JourneyStageCard({ stage, index, active, complete, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${
        active
          ? "border-cyanx bg-cyanx/10 text-cyanx ring-4 ring-cyanx/15"
          : complete
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100"
            : "border-slate-200 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      }`}
    >
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide">
        {complete ? <CheckCircle2 size={15} /> : <Circle size={15} />}
        Stage {index + 1}
      </span>
      <span className="block text-base font-black">{stage.title}</span>
      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${stage.badgeClass}`}>
        {stage.status}
      </span>
    </button>
  );
}
