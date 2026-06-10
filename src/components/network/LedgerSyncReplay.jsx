import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Database, Pause, Play, Plus, RotateCcw } from "lucide-react";

const completeKey = "bfv-ledger-sync-complete";

export default function LedgerSyncReplay() {
  const baseNodes = useMemo(() => createLedgerNodes(), []);
  const [nodes, setNodes] = useState(baseNodes);
  const [record, setRecord] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!syncing || paused || !record) return undefined;
    const timer = window.setInterval(() => {
      setTick(value => value + 1);
      setNodes(current => current.map((node, index) => {
        if (index > tick) return node;
        return node.records.includes(record) ? node : { ...node, records: [...node.records, record], status: "Updated" };
      }));
      if (tick >= nodes.length) {
        setSyncing(false);
        localStorage.setItem(completeKey, "true");
      }
    }, 420);
    return () => window.clearInterval(timer);
  }, [syncing, paused, record, tick, nodes.length]);

  function addRecord() {
    const nextRecord = `REC-${Date.now().toString().slice(-5)}`;
    setRecord(nextRecord);
    setNodes(baseNodes.map((node, index) => index === 0 ? { ...node, records: [...node.records, nextRecord], status: "Proposer" } : { ...node, status: "Waiting" }));
    setTick(1);
    setPaused(false);
    setSyncing(true);
  }

  function replay() {
    if (!record) return addRecord();
    setNodes(baseNodes.map((node, index) => index === 0 ? { ...node, records: [...node.records, record], status: "Proposer" } : { ...node, status: "Waiting" }));
    setTick(1);
    setPaused(false);
    setSyncing(true);
  }

  return (
    <section id="ledger-sync-replay" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <Database size={17} /> Ledger Sync Replay
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Watch every honest node update its ledger copy</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          All honest nodes update their ledger after validation.
        </p>
      </div>

      <div className="panel p-5">
        <div className="relative mb-6 min-h-72 overflow-hidden rounded-lg border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/30">
          <div className="grid gap-4 md:grid-cols-5">
            {nodes.map((node, index) => (
              <article key={node.name} className="relative rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                {record && index > 0 && nodes[index].records.includes(record) && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyanx px-2 py-1 text-xs font-black text-white">
                    Synced
                  </motion.div>
                )}
                <h3 className="font-black">{node.name}</h3>
                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${node.status === "Updated" || node.status === "Proposer" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
                  {node.status}
                </span>
                <div className="mt-4 grid gap-2">
                  {node.records.map(item => <span key={item} className="rounded bg-white px-2 py-1 font-mono text-xs font-black dark:bg-slate-950">{item}</span>)}
                </div>
              </article>
            ))}
          </div>
          {syncing && !paused && record && (
            <motion.div
              key={`${record}-${tick}`}
              className="absolute left-[10%] top-8 rounded-full bg-gradient-to-r from-bluex to-cyanx px-3 py-2 text-xs font-black text-white shadow-lg"
              initial={{ x: 0, opacity: 1 }}
              animate={{ x: `${Math.min(84, tick * 20)}%`, opacity: [1, 1, 0.65] }}
              transition={{ duration: 0.38 }}
            >
              {record}
            </motion.div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={addRecord} className="btn-primary"><Plus size={18} /> Add Record</button>
          <button type="button" onClick={replay} className="btn-secondary"><RotateCcw size={18} /> Replay</button>
          <button type="button" onClick={() => setPaused(value => !value)} disabled={!syncing} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-45">
            {paused ? <Play size={18} /> : <Pause size={18} />} {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>
    </section>
  );
}

function createLedgerNodes() {
  return Array.from({ length: 5 }, (_, index) => ({
    name: index === 0 ? "Proposer Node" : `Node ${index + 1}`,
    status: index === 0 ? "Ready" : "Waiting",
    records: ["GEN-001"]
  }));
}
