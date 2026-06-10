import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleSlash, WifiOff } from "lucide-react";

const voteConfig = {
  Approve: { icon: CheckCircle2, style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" },
  Reject: { icon: CircleSlash, style: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200" },
  Offline: { icon: WifiOff, style: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300" },
  Malicious: { icon: AlertTriangle, style: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100" }
};

export default function NodeVoteCard({ node, onVote }) {
  const config = voteConfig[node.vote];
  const Icon = config.icon;
  return (
    <motion.article layout className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-black">{node.name}</h3>
        <motion.span
          animate={node.vote === "Approve" || node.vote === "Reject" ? { y: [0, -8, 0] } : { y: 0 }}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${config.style}`}
        >
          <Icon size={13} /> {node.vote}
        </motion.span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.keys(voteConfig).map(vote => (
          <button key={vote} type="button" onClick={() => onVote(node.id, vote)} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-black transition hover:border-cyanx dark:border-white/10">
            {vote}
          </button>
        ))}
      </div>
    </motion.article>
  );
}
