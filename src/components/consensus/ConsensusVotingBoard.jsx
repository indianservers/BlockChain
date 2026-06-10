import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Vote } from "lucide-react";
import EventLogTerminal, { createLogEvent } from "../common/EventLogTerminal.jsx";
import NodeVoteCard from "./NodeVoteCard.jsx";

const stateKey = "bfv-consensus-board-state";
const completeKey = "bfv-consensus-demo-complete";
const logKey = "bfv-consensus-board-events";
const thresholds = { "51%": 0.51, "67%": 0.67, "75%": 0.75 };

export default function ConsensusVotingBoard() {
  const [nodes, setNodes] = useState(() => loadState());
  const [threshold, setThreshold] = useState("67%");
  const [events, setEvents] = useState(() => loadEvents(logKey));
  const metrics = useMemo(() => calculate(nodes, threshold), [nodes, threshold]);

  useEffect(() => localStorage.setItem(stateKey, JSON.stringify(nodes)), [nodes]);
  useEffect(() => localStorage.setItem(logKey, JSON.stringify(events)), [events]);
  useEffect(() => {
    if (metrics.reached) localStorage.setItem(completeKey, "true");
  }, [metrics.reached]);

  function log(name, details, status = "Success") {
    setEvents(current => [createLogEvent(name, details, status), ...current].slice(0, 40));
  }

  function castVote(id, vote) {
    setNodes(current => current.map(node => node.id === id ? { ...node, vote } : node));
    log("ConsensusVoteCast", `Node ${id} voted ${vote}.`, vote === "Malicious" ? "Warning" : "Success");
  }

  return (
    <section id="consensus-voting-board" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <Vote size={17} /> Consensus Voting Board
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Seven nodes vote on whether a block is accepted</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Choose each node's behavior, set the threshold, and watch the approval meter fill.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <article className="panel p-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <label>
              <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Threshold selector</span>
              <select value={threshold} onChange={event => setThreshold(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-bold dark:border-white/10 dark:bg-slate-900">
                {Object.keys(thresholds).map(item => <option key={item}>{item}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => { setNodes(defaultNodes()); log("BlockMined", "Fresh block proposal broadcast to voting board."); }} className="btn-secondary">Reset Votes</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {nodes.map(node => <NodeVoteCard key={node.id} node={node} onVote={castVote} />)}
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
              <span>Approval progress</span>
              <span>{metrics.approves}/{metrics.needed}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <motion.div className="h-full bg-gradient-to-r from-bluex to-cyanx" animate={{ width: `${Math.min(100, (metrics.approves / Math.max(1, metrics.needed)) * 100)}%` }} />
            </div>
          </div>
        </article>

        <div className="grid content-start gap-5">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Voting result</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Online nodes" value={metrics.online} />
              <Metric label="Votes needed" value={metrics.needed} />
              <Metric label="Votes received" value={metrics.approves} />
              <Metric label="Rejects" value={metrics.rejects} />
            </div>
            <p className={`mt-5 rounded-lg p-4 font-black ${metrics.reached ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
              {metrics.reached ? "Consensus reached" : "Consensus failed or still pending"}
            </p>
          </article>
          <EventLogTerminal title="Consensus event terminal" events={events} />
        </div>
      </div>
    </section>
  );
}

function calculate(nodes, threshold) {
  const onlineNodes = nodes.filter(node => node.vote !== "Offline");
  const approves = onlineNodes.filter(node => node.vote === "Approve").length;
  const rejects = onlineNodes.filter(node => node.vote === "Reject" || node.vote === "Malicious").length;
  const needed = Math.ceil(onlineNodes.length * thresholds[threshold]);
  return { online: onlineNodes.length, approves, rejects, needed, reached: approves >= needed && onlineNodes.length > 0 };
}

function defaultNodes() {
  return Array.from({ length: 7 }, (_, index) => ({ id: index + 1, name: `Node ${index + 1}`, vote: index < 4 ? "Approve" : "Reject" }));
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(stateKey) || "null");
    return Array.isArray(stored) ? stored : defaultNodes();
  } catch {
    return defaultNodes();
  }
}

function loadEvents(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
