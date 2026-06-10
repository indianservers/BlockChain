import { CheckCircle2, Clock, Loader2, Radio } from "lucide-react";

const statusStyles = {
  Waiting: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  Received: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
  Validating: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100",
  Accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
};

const statusIcons = {
  Waiting: Clock,
  Received: Radio,
  Validating: Loader2,
  Accepted: CheckCircle2
};

export default function NodeStatusCard({ node }) {
  const Icon = statusIcons[node.status] ?? Clock;
  return (
    <article className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-black">{node.name}</h4>
          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{node.role}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${statusStyles[node.status]}`}>
          <Icon size={13} className={node.status === "Validating" ? "animate-spin" : ""} /> {node.status}
        </span>
      </div>
      <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">Propagation: {node.timing} ms</p>
    </article>
  );
}
