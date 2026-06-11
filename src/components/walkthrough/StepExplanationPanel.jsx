import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BookOpen, Lightbulb, ShieldCheck } from "lucide-react";

export default function StepExplanationPanel({ step, currentStep }) {
  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={step.title}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.22 }}
        className="panel overflow-hidden"
      >
        <div className="bg-slate-950 p-6 text-white">
          <p className="text-sm font-black uppercase tracking-wide text-cyanx">Action {currentStep + 1}</p>
          <h3 className="mt-2 text-3xl font-black">{step.title}</h3>
          <p className="mt-3 leading-7 text-slate-300">{step.summary}</p>
        </div>
        <div className="grid gap-3 p-5">
          <InfoRow icon={BookOpen} label="What happens" text={step.what} />
          <InfoRow icon={ShieldCheck} label="Why it matters" text={step.why} />
          <InfoRow icon={Lightbulb} label="Beginner analogy" text={step.analogy} />
          <InfoRow icon={AlertTriangle} label="Common mistake" text={step.mistake} warning />
        </div>
      </motion.article>
    </AnimatePresence>
  );
}

function InfoRow({ icon: Icon, label, text, warning }) {
  return (
    <div className={`rounded-lg p-4 ${warning ? "bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100" : "bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-slate-200"}`}>
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide">
        <Icon size={17} /> {label}
      </p>
      <p className="leading-7 font-semibold">{text}</p>
    </div>
  );
}
