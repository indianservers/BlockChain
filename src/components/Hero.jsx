import { motion } from "framer-motion";
import { ArrowDown, PlayCircle } from "lucide-react";

export default function Hero({ stats }) {
  return (
    <section id="hero" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-70">
        <svg viewBox="0 0 1200 700" className="h-full w-full">
          <defs>
            <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#2563eb" />
              <stop offset="1" stopColor="#18b7a8" />
            </linearGradient>
          </defs>
          {[160, 320, 480, 640, 800, 960].map((x, index) => (
            <g key={x}>
              <motion.circle
                cx={x}
                cy={index % 2 ? 260 : 430}
                r="34"
                fill="none"
                stroke="url(#heroLine)"
                strokeWidth="3"
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.35, 0.8, 0.35] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.28 }}
              />
              {index < 5 && <line x1={x + 36} y1={index % 2 ? 278 : 412} x2={x + 124} y2={index % 2 ? 412 : 278} stroke="url(#heroLine)" strokeWidth="3" opacity=".36" />}
            </g>
          ))}
        </svg>
      </div>

      <div className="section-wrap flex min-h-[calc(100vh-4.25rem)] items-center">
        <div className="max-w-5xl">
          <motion.p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-cyanx shadow-sm dark:border-white/10 dark:bg-white/10" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <PlayCircle size={17} /> Blockchain Foundations
          </motion.p>
          <motion.h1 className="text-5xl font-black tracking-tight md:text-7xl lg:text-8xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            Blockchain Foundations Visualizer
          </motion.h1>
          <motion.p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600 dark:text-slate-300" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            A professional simulation workspace where students operate blockchain systems, inspect live state, diagnose failures, and complete guided missions.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <a href="#interactive-lab-console" className="btn-primary">
              Start Interactive Lab <ArrowDown size={18} />
            </a>
            <a href="#practice" className="btn-secondary">Try Practice</a>
          </motion.div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="panel p-4">
                <Icon className="mb-3 text-cyanx" size={22} />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-lg font-black">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
