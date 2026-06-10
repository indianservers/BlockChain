import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import { hashPreview } from "../../utils/blockchainEngine.js";

export default function HashLinkHighlighter({ chain, validation, hoveredLink, setHoveredLink, tampered }) {
  return (
    <article className="panel p-5">
      <h3 className="mb-4 inline-flex items-center gap-2 text-2xl font-black">
        <Link2 className="text-cyanx" size={24} /> Previous hash link highlighter
      </h3>
      <div className="relative grid gap-4 lg:grid-cols-3">
        {chain.map((block, index) => {
          const result = validation.results[index];
          const modified = tampered && index === 1;
          const invalid = tampered && index > 1;
          const highlightPrevious = hoveredLink === index - 1;
          const highlightCurrent = hoveredLink === index;
          return (
            <motion.div
              key={`${block.index}-${block.hash}`}
              animate={tampered && index >= 1 ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.42 }}
              className={`relative rounded-lg border p-4 ${
                modified
                  ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100"
                  : invalid || !result.valid
                    ? "border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-100"
                    : "border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              {tampered && index === 1 && <CrackBurst />}
              {index < chain.length - 1 && (
                <motion.div
                  className={`pointer-events-none absolute -right-5 top-1/2 hidden h-1 w-10 -translate-y-1/2 rounded-full lg:block ${tampered ? "bg-red-400/50" : "bg-cyanx/40"}`}
                  animate={highlightCurrent ? { boxShadow: "0 0 24px rgba(24,183,168,.95)", scaleX: 1.18 } : { boxShadow: "0 0 0 rgba(24,183,168,0)", scaleX: 1 }}
                />
              )}
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="text-xl font-black">Block {index + 1}</h4>
                <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${modified ? "bg-amber-200 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100" : invalid || !result.valid ? "bg-red-200 text-red-900 dark:bg-red-400/20 dark:text-red-100" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"}`}>
                  {modified ? "Modified" : invalid || !result.valid ? "Invalid" : "Valid"}
                </span>
              </div>
              <HashRow
                label="Current hash"
                value={hashPreview(block.hash, 14)}
                active={highlightCurrent}
                onMouseEnter={() => index < chain.length - 1 && setHoveredLink(index)}
                onMouseLeave={() => setHoveredLink(null)}
              />
              <HashRow label="Previous hash" value={hashPreview(block.previousHash, 14)} active={highlightPrevious} />
              {highlightPrevious && <p className="mt-3 rounded-lg bg-cyanx/10 p-3 text-sm font-black text-cyanx">This previous hash links the blocks together.</p>}
              {(invalid || !result.linkValid) && index > 0 && <p className="mt-3 rounded-lg bg-red-100 p-3 text-sm font-black text-red-700 dark:bg-red-500/20 dark:text-red-100">Invalid Link</p>}
            </motion.div>
          );
        })}
      </div>
    </article>
  );
}

function HashRow({ label, value, active, onMouseEnter, onMouseLeave }) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`mt-3 rounded-lg p-3 transition ${active ? "bg-cyanx/15 ring-2 ring-cyanx/50" : "bg-slate-50 dark:bg-slate-950/40"}`}
    >
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="break-all font-mono text-xs font-black">{value}</p>
    </div>
  );
}

function CrackBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
      {Array.from({ length: 8 }, (_, index) => (
        <motion.span
          key={index}
          className="absolute left-1/2 top-1/2 h-1 w-8 origin-left rounded-full bg-amber-400"
          initial={{ opacity: 0.9, scaleX: 0, rotate: index * 45 }}
          animate={{ opacity: 0, scaleX: 1.4, x: Math.cos(index) * 28, y: Math.sin(index) * 28 }}
          transition={{ duration: 0.7 }}
        />
      ))}
    </div>
  );
}
