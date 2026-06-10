import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { concepts } from "../data/content.js";

export default function ConceptGrid() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="concepts" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">Core concepts</p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Click through the vocabulary of blockchain</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">Each idea includes a simple definition, analogy, and mini example.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {concepts.map(item => (
          <button key={item.title} type="button" onClick={() => setSelected(item)} className="panel p-5 text-left transition hover:-translate-y-1 hover:border-cyanx focus:outline-none focus:ring-4 focus:ring-blue-500/20">
            <item.icon className="mb-5 text-cyanx" size={28} />
            <h3 className="text-xl font-black">{item.title}</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{item.definition}</p>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.article className="panel max-w-xl p-6" initial={{ y: 24, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.96 }} onClick={event => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-cyanx">Concept</p>
                  <h3 className="mt-2 text-3xl font-black">{selected.title}</h3>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="btn-secondary h-10 min-h-10 w-10 p-0" aria-label="Close concept modal">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-6 grid gap-4">
                <Info label="Simple definition" text={selected.definition} />
                <Info label="Real-world analogy" text={selected.analogy} />
                <Info label="Mini example" text={selected.example} />
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Info({ label, text }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <p className="font-black">{label}</p>
      <p className="mt-1 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  );
}
