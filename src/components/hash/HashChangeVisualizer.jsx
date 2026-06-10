import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { createHash } from "../../utils/blockchainEngine.js";
import HashDiff from "./HashDiff.jsx";

const storageKey = "bfv-hash-lab-sample";

export default function HashChangeVisualizer() {
  const [blockData, setBlockData] = useState(() => localStorage.getItem(storageKey) || "Block 2: Alice sends 12.5 LRN to Bob");
  const currentHash = useMemo(() => createHash(blockData), [blockData]);
  const [previousHash, setPreviousHash] = useState(currentHash);
  const lastHash = useRef(currentHash);

  useEffect(() => {
    localStorage.setItem(storageKey, blockData);
    setPreviousHash(lastHash.current);
    lastHash.current = currentHash;
  }, [blockData, currentHash]);

  return (
    <section id="hash-change-visualizer" className="section-wrap">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <Fingerprint size={17} /> Live Hash Change Visualizer
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Watch one character change reshape the entire hash</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Same input creates the same hash every time. Change even one character and the output changes visibly.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.88fr_1.12fr]">
        <article className="panel p-5">
          <label>
            <span className="mb-2 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Block data</span>
            <textarea
              value={blockData}
              onChange={event => setBlockData(event.target.value)}
              rows={8}
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-4 font-semibold outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => setBlockData(value => `${value}!`)} className="btn-primary">Change One Character</button>
            <button type="button" onClick={() => setBlockData("Block 2: Alice sends 12.5 LRN to Bob")} className="btn-secondary">Reset Sample</button>
          </div>
        </article>

        <article className="panel p-5">
          <h3 className="mb-4 text-2xl font-black">Generated hash</h3>
          <motion.div key={currentHash} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <HashDiff previousHash={previousHash} currentHash={currentHash} />
          </motion.div>
          <p className="mt-4 rounded-lg bg-cyanx/10 p-4 font-black text-cyanx">
            Even one character change creates a completely different hash.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniFact label="Hash length" value={`${currentHash.length} characters`} />
            <MiniFact label="Deterministic" value="Same input = same hash" />
          </div>
        </article>
      </div>
    </section>
  );
}

function MiniFact({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
