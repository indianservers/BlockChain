import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Pause, Play, RotateCcw } from "lucide-react";
import { createHash, hashPreview } from "../../utils/blockchainEngine.js";

const targets = {
  Easy: "0",
  Medium: "00",
  Hard: "000",
  Extreme: "0000"
};

export default function DifficultyTargetGate() {
  const [difficulty, setDifficulty] = useState("Easy");
  const [nonce, setNonce] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [running, setRunning] = useState(false);
  const [validHash, setValidHash] = useState("");
  const [packetKey, setPacketKey] = useState(0);
  const prefix = targets[difficulty];
  const hash = useMemo(() => createHash(`gate|${difficulty}|${nonce}`), [difficulty, nonce]);
  const passes = hash.startsWith(prefix);

  useEffect(() => {
    if (!running || validHash) return undefined;
    const timer = window.setInterval(() => {
      setNonce(current => current + 1);
      setAttempts(current => current + 1);
      setPacketKey(current => current + 1);
    }, 120);
    return () => window.clearInterval(timer);
  }, [running, validHash]);

  useEffect(() => {
    if (passes && running) {
      setValidHash(hash);
      setRunning(false);
    }
  }, [passes, running, hash]);

  function reset() {
    setRunning(false);
    setNonce(0);
    setAttempts(0);
    setValidHash("");
    setPacketKey(0);
  }

  return (
    <section id="difficulty-target-gate" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <Gauge size={17} /> Difficulty Target Gate
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Hash attempts must pass the prefix gate</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Invalid hashes bounce away. The first hash that starts with the required zero prefix passes the target gate.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <article className="panel p-5">
          <div className="relative h-64 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 dark:border-white/10">
            <div className="absolute bottom-0 left-1/2 top-0 w-2 -translate-x-1/2 bg-cyanx shadow-[0_0_34px_rgba(24,183,168,.8)]" />
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
              {difficulty}: starts with {prefix}
            </div>
            <motion.div
              key={packetKey}
              className={`absolute top-1/2 rounded-lg px-3 py-2 font-mono text-xs font-black text-white ${passes ? "bg-emerald-500" : "bg-red-500"}`}
              initial={{ x: 24, y: -20, opacity: 0 }}
              animate={passes ? { x: 440, y: -20, opacity: [0, 1, 1] } : { x: [24, 220, 150], y: -20, opacity: [0, 1, 0.85] }}
              transition={{ duration: 0.58 }}
            >
              {hashPreview(hash, 8)}
            </motion.div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {Object.keys(targets).map(item => (
              <button key={item} type="button" onClick={() => { setDifficulty(item); reset(); }} className={item === difficulty ? "btn-primary" : "btn-secondary"}>{item}</button>
            ))}
            <button type="button" onClick={() => setRunning(true)} disabled={running || Boolean(validHash)} className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"><Play size={18} /> Start</button>
            <button type="button" onClick={() => setRunning(false)} className="btn-secondary"><Pause size={18} /> Pause</button>
            <button type="button" onClick={reset} className="btn-secondary"><RotateCcw size={18} /> Reset</button>
          </div>
        </article>
        <article className="panel p-5">
          <h3 className="text-2xl font-black">Gate telemetry</h3>
          <div className="mt-5 grid gap-3">
            <Field label="Nonce" value={nonce} />
            <Field label="Attempts" value={attempts} />
            <Field label="Current hash" value={hashPreview(hash, 18)} mono />
            <Field label="Valid hash" value={validHash ? hashPreview(validHash, 18) : "Not found yet"} mono />
          </div>
        </article>
      </div>
    </section>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`${mono ? "font-mono text-xs" : ""} break-words font-black`}>{value}</p>
    </div>
  );
}
