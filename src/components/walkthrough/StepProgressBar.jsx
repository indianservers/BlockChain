import { CheckCircle2 } from "lucide-react";

export default function StepProgressBar({ steps, currentStep, completedSteps, onJump }) {
  return (
    <div className="grid gap-3">
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full bg-gradient-to-r from-bluex to-cyanx transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => {
          const active = index === currentStep;
          const complete = completedSteps.includes(index);
          return (
            <button
              key={step.title}
              type="button"
              onClick={() => onJump(index)}
              className={`rounded-lg border p-3 text-left transition hover:-translate-y-0.5 ${
                active
                  ? "border-cyanx bg-cyanx/10 text-cyanx"
                  : complete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100"
                    : "border-slate-200 bg-white/70 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
                {complete && <CheckCircle2 size={14} />}
                Step {index + 1}
              </span>
              <span className="mt-1 block text-sm font-black">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
