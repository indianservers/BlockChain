import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Hammer, Plus, RotateCcw, Search, ShieldAlert, Sparkles } from "lucide-react";
import {
  addBlock,
  buildDefaultChain,
  createHash,
  repairChain,
  tamperBlock,
  validateChain
} from "../utils/blockchainEngine.js";
import BlockCard from "./phase2/BlockCard.jsx";

const WORKBENCH_STORAGE = "bfv-learning-workbench";

const missions = [
  ["hash", "Generate a hash from your own text"],
  ["add", "Add a new block to the chain"],
  ["inspect", "Inspect a block's previous hash"],
  ["tamper", "Tamper with block data and break the chain"],
  ["repair", "Repair the chain and restore validity"]
];

export default function LearningWorkbench() {
  const [chain, setChain] = useState(() => loadWorkbenchChain());
  const [hashInput, setHashInput] = useState("Try changing one word");
  const [newBlockData, setNewBlockData] = useState("Student creates a learning record");
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [completed, setCompleted] = useState(() => new Set(JSON.parse(localStorage.getItem("bfv-workbench-missions") || "[]")));
  const validation = useMemo(() => validateChain(chain), [chain]);
  const selectedBlock = chain[selectedIndex] ?? chain[0];
  const selectedValidation = validation.results[selectedIndex] ?? validation.results[0];
  const missionPercent = Math.round((completed.size / missions.length) * 100);
  const generatedHash = createHash(hashInput);

  useEffect(() => {
    localStorage.setItem(WORKBENCH_STORAGE, JSON.stringify(chain));
  }, [chain]);

  useEffect(() => {
    localStorage.setItem("bfv-workbench-missions", JSON.stringify([...completed]));
  }, [completed]);

  function completeMission(id) {
    setCompleted(current => new Set(current).add(id));
  }

  function addLearnerBlock() {
    if (!newBlockData.trim()) return;
    setChain(current => addBlock(current, newBlockData.trim()));
    setSelectedIndex(chain.length);
    setNewBlockData("");
    completeMission("add");
  }

  function editBlockData(index, data) {
    setChain(current => tamperBlock(current, index, data));
    completeMission("tamper");
  }

  function repairLearnerChain() {
    setChain(current => repairChain(current));
    completeMission("repair");
  }

  function resetWorkbench() {
    setChain(buildDefaultChain());
    setSelectedIndex(1);
    setNewBlockData("Student creates a learning record");
    setCompleted(new Set());
    localStorage.removeItem("bfv-workbench-missions");
  }

  return (
    <section id="learning-tool" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
            <Sparkles size={17} /> Interactive learning tool
          </p>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Learn blockchain by building, breaking, and fixing one</h2>
          <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
            This is the active workspace: type data, create blocks, inspect links, tamper with records, and repair the chain while the validation engine responds.
          </p>
        </div>
        <div className="panel min-w-64 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-black">
            <span>Mission progress</span>
            <span>{missionPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <motion.div className="h-full bg-gradient-to-r from-bluex to-cyanx" animate={{ width: `${missionPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
        <aside className="panel p-5">
          <h3 className="text-xl font-black">Learner missions</h3>
          <div className="mt-4 grid gap-3">
            {missions.map(([id, label]) => {
              const done = completed.has(id);
              return (
                <div key={id} className={`flex items-start gap-3 rounded-lg border p-3 ${done ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
                  {done ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <Circle size={20} className="mt-0.5 shrink-0 text-slate-400" />}
                  <span className="font-bold leading-6">{label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/50">
            <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Live chain health</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Metric label="Total" value={validation.totalBlocks} />
              <Metric label="Valid" value={validation.validBlocks} />
              <Metric label="Broken" value={validation.invalidBlocks} danger={validation.invalidBlocks > 0} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
              First broken block: {validation.firstBrokenBlock === null ? "None" : `#${validation.firstBrokenBlock}`}
            </p>
          </div>
        </aside>

        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="panel p-5">
              <div className="mb-4 flex items-center gap-2">
                <Search className="text-cyanx" size={21} />
                <h3 className="text-xl font-black">Hash experiment</h3>
              </div>
              <textarea
                value={hashInput}
                onChange={event => {
                  setHashInput(event.target.value);
                  completeMission("hash");
                }}
                rows={4}
                className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 font-semibold outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5"
              />
              <motion.p key={generatedHash} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 break-all rounded-lg bg-cyanx/10 p-3 font-mono text-sm font-black text-cyanx">
                {generatedHash}
              </motion.p>
            </article>

            <article className="panel p-5">
              <div className="mb-4 flex items-center gap-2">
                <Plus className="text-cyanx" size={21} />
                <h3 className="text-xl font-black">Block builder controls</h3>
              </div>
              <input
                value={newBlockData}
                onChange={event => setNewBlockData(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5"
                placeholder="Enter data for a new block"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={addLearnerBlock} className="btn-primary">
                  <Plus size={18} /> Add Block
                </button>
                <button type="button" onClick={repairLearnerChain} className="btn-secondary">
                  <Hammer size={18} /> Repair
                </button>
                <button type="button" onClick={resetWorkbench} className="btn-secondary">
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </article>
          </div>

          <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
            <article className="panel p-5">
              <h3 className="mb-4 text-xl font-black">Clickable chain</h3>
              <div className="grid gap-3">
                {chain.map((block, index) => {
                  const result = validation.results[index];
                  return (
                    <button
                      key={`${block.index}-${block.hash}`}
                      type="button"
                      onClick={() => {
                        setSelectedIndex(index);
                        completeMission("inspect");
                      }}
                      className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition hover:-translate-y-0.5 ${selectedIndex === index ? "border-cyanx ring-4 ring-cyanx/15" : result.valid ? "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5" : "border-red-400 bg-red-50 dark:bg-red-500/10"}`}
                    >
                      <span>
                        <strong className="block">Block #{block.index}</strong>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{block.data}</span>
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-black ${result.valid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
                        {result.valid ? "Valid" : "Broken"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>

            <div>
              <div className="mb-3 flex items-center gap-2 font-black text-slate-600 dark:text-slate-300">
                <ShieldAlert size={18} className={selectedValidation?.valid ? "text-emerald-500" : "text-red-500"} />
                Inspect and tamper with the selected block
              </div>
              <BlockCard block={selectedBlock} validation={selectedValidation} active onEdit={selectedBlock.index === 0 ? undefined : editBlockData} />
              {selectedBlock.index === 0 && (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                  Genesis is locked in this guided lab. Select a later block to tamper safely.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, danger }) {
  return (
    <div className={`rounded-lg p-3 ${danger ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200" : "bg-slate-50 dark:bg-white/5"}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-black uppercase tracking-wide">{label}</p>
    </div>
  );
}

function loadWorkbenchChain() {
  try {
    const stored = JSON.parse(localStorage.getItem(WORKBENCH_STORAGE) || "null");
    return Array.isArray(stored) && stored.length ? stored : buildDefaultChain();
  } catch {
    return buildDefaultChain();
  }
}
