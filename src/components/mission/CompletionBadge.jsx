import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export default function CompletionBadge({ unlocked, score, mistakes, onRetry }) {
  return (
    <article className={`panel p-6 ${unlocked ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-500/15" : ""}`}>
      <motion.div animate={unlocked ? { scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] } : {}} transition={{ duration: 0.7 }}>
        <Trophy className="mb-4 text-cyanx" size={42} />
      </motion.div>
      <h3 className="text-3xl font-black">{unlocked ? "Complete Blockchain Practitioner" : "Badge locked"}</h3>
      <p className="mt-3 font-bold text-slate-600 dark:text-slate-300">Score: {score} · Mistakes: {mistakes}</p>
      <button type="button" onClick={onRetry} className="btn-secondary mt-5">Retry Mission</button>
    </article>
  );
}
