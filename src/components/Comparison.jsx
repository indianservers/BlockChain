import { useState } from "react";
import { Database, Network } from "lucide-react";

export default function Comparison() {
  const [mode, setMode] = useState("database");

  return (
    <section id="compare" className="section-wrap">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">Compare models</p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Traditional database vs blockchain network</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">The main shift is from one central authority to many synchronized participants.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        <div className="panel overflow-hidden">
          {[
            ["Traditional Database", "Blockchain"],
            ["Centralized control", "Distributed control"],
            ["One main authority", "Multiple participants"],
            ["Easier to edit records", "Tamper-resistant records"],
            ["Single point of failure", "No single point of failure"]
          ].map((row, index) => (
            <div key={row.join("-")} className={`grid grid-cols-2 ${index === 0 ? "bg-slate-100 font-black dark:bg-white/10" : ""}`}>
              <span className="border-b border-r border-slate-200 p-4 dark:border-white/10">{row[0]}</span>
              <span className="border-b border-slate-200 p-4 dark:border-white/10">{row[1]}</span>
            </div>
          ))}
        </div>

        <div className="panel p-5">
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setMode("database")} className={mode === "database" ? "btn-primary" : "btn-secondary"}>
              <Database size={18} /> Traditional Database
            </button>
            <button type="button" onClick={() => setMode("blockchain")} className={mode === "blockchain" ? "btn-primary" : "btn-secondary"}>
              <Network size={18} /> Blockchain Network
            </button>
          </div>
          <NetworkDiagram mode={mode} />
        </div>
      </div>
    </section>
  );
}

function NetworkDiagram({ mode }) {
  const nodes = mode === "database"
    ? [
        ["User A", 18, 20],
        ["User B", 75, 22],
        ["Server", 47, 45],
        ["User C", 18, 72],
        ["User D", 75, 72]
      ]
    : [
        ["Node 1", 47, 14],
        ["Node 2", 78, 35],
        ["Node 3", 65, 72],
        ["Node 4", 25, 72],
        ["Node 5", 14, 35]
      ];

  return (
    <div className="relative h-[340px] overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-slate-950/60">
      <svg className="absolute inset-0 h-full w-full">
        {mode === "database"
          ? nodes.filter(n => n[0] !== "Server").map(node => <line key={node[0]} x1={`${node[1]}%`} y1={`${node[2]}%`} x2="50%" y2="50%" stroke="#2563eb" strokeWidth="2" opacity=".45" />)
          : nodes.map((node, index) => {
              const next = nodes[(index + 1) % nodes.length];
              return <line key={node[0]} className="network-line" x1={`${node[1]}%`} y1={`${node[2]}%`} x2={`${next[1]}%`} y2={`${next[2]}%`} stroke="#18b7a8" strokeWidth="2" opacity=".72" />;
            })}
      </svg>
      {nodes.map(([label, x, y]) => (
        <div key={label} className="absolute grid h-20 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border border-slate-200 bg-white text-center text-sm font-black shadow-lg dark:border-white/10 dark:bg-slate-900" style={{ left: `${x}%`, top: `${y}%` }}>
          {label}
          {mode === "blockchain" && <span className="text-xs font-bold text-cyanx">Ledger copy</span>}
        </div>
      ))}
    </div>
  );
}
