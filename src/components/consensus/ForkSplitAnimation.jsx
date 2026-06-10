import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitFork, Plus, RefreshCw } from "lucide-react";
import EventLogTerminal, { createLogEvent } from "../common/EventLogTerminal.jsx";

const stateKey = "bfv-fork-demo-state";
const logKey = "bfv-fork-demo-events";

export default function ForkSplitAnimation() {
  const [state, setState] = useState(loadState);
  const [events, setEvents] = useState(loadEvents);

  useEffect(() => localStorage.setItem(stateKey, JSON.stringify(state)), [state]);
  useEffect(() => localStorage.setItem(logKey, JSON.stringify(events)), [events]);

  function log(name, details, status = "Success") {
    setEvents(current => [createLogEvent(name, details, status), ...current].slice(0, 40));
  }

  function addBlock(branch) {
    setState(current => ({ ...current, [branch]: current[branch] + 1, resolved: false, orphan: "" }));
    log("BlockMined", `Added a block to Chain ${branch.toUpperCase()}.`);
  }

  function resolve() {
    const winner = state.a >= state.b ? "A" : "B";
    const loser = winner === "A" ? "B" : "A";
    setState(current => ({ ...current, resolved: true, orphan: loser }));
    localStorage.setItem("bfv-fork-demo-complete", "true");
    log("ForkResolved", `Chain ${winner} wins by length and support. Chain ${loser} becomes orphaned.`);
  }

  return (
    <section id="fork-split-animation" className="section-wrap">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <GitFork size={17} /> Fork Split Animation
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">A chain can split, then resolve to one winning branch</h2>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <article className="panel p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Branch title="Chain A" count={state.a} support={state.a >= state.b ? 62 : 38} orphan={state.orphan === "B" ? false : state.orphan === "A"} />
            <Branch title="Chain B" count={state.b} support={state.b > state.a ? 62 : 38} orphan={state.orphan === "A" ? false : state.orphan === "B"} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => addBlock("a")} className="btn-secondary"><Plus size={18} /> Add Block to A</button>
            <button type="button" onClick={() => addBlock("b")} className="btn-secondary"><Plus size={18} /> Add Block to B</button>
            <button type="button" onClick={resolve} className="btn-primary"><RefreshCw size={18} /> Resolve Fork</button>
          </div>
        </article>
        <EventLogTerminal title="Fork event terminal" events={events} />
      </div>
    </section>
  );
}

function Branch({ title, count, support, orphan }) {
  return (
    <motion.article animate={orphan ? { opacity: 0.42, scale: 0.97 } : { opacity: 1, scale: 1 }} className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {Array.from({ length: count }, (_, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid h-14 w-14 place-items-center rounded-lg bg-gradient-to-br from-bluex to-cyanx font-black text-white">
            {index + 1}
          </motion.div>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        <p className="font-bold">Chain length: {count}</p>
        <p className="font-bold">Confirmations: {Math.max(0, count - 1)}</p>
        <p className="font-bold">Network support: {support}%</p>
        {orphan && <p className="rounded-lg bg-red-50 p-3 font-black text-red-700 dark:bg-red-500/15 dark:text-red-200">Orphaned branch</p>}
      </div>
    </motion.article>
  );
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(stateKey) || "null") ?? { a: 3, b: 2, resolved: false, orphan: "" };
  } catch {
    return { a: 3, b: 2, resolved: false, orphan: "" };
  }
}

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(logKey) || "[]");
  } catch {
    return [];
  }
}
