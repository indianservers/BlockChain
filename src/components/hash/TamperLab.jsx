import { useEffect, useMemo, useState } from "react";
import { Hammer, RotateCcw, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import {
  buildDefaultChain,
  repairChain,
  tamperBlock,
  validateChain
} from "../../utils/blockchainEngine.js";
import HashLinkHighlighter from "../blockchain/HashLinkHighlighter.jsx";
import BlockchainStatusPanel from "../blockchain/BlockchainStatusPanel.jsx";

const chainKey = "bfv-tamper-lab-chain";
const doneKey = "bfv-tamper-lab-complete";

export default function TamperLab() {
  const [chain, setChain] = useState(loadChain);
  const [tampered, setTampered] = useState(() => localStorage.getItem(doneKey) === "true");
  const [hoveredLink, setHoveredLink] = useState(null);
  const [lastAction, setLastAction] = useState("Hover a current hash to see how it links to the next block.");
  const validation = useMemo(() => validateChain(chain), [chain]);

  useEffect(() => {
    localStorage.setItem(chainKey, JSON.stringify(chain));
  }, [chain]);

  function tamper() {
    setChain(current => tamperBlock(current, 1, `${current[1].data} | changed by learner`));
    setTampered(true);
    setLastAction("Block 2 was modified. Block 3 now points to the old hash, so the link breaks.");
    localStorage.setItem(doneKey, "true");
  }

  function repair() {
    setChain(current => repairChain(current));
    setTampered(false);
    setLastAction("Chain repaired. Previous-hash links were recalculated in sequence.");
  }

  function reset() {
    setChain(buildDefaultChain());
    setTampered(false);
    setLastAction("Chain reset to the original valid sample.");
    localStorage.removeItem(doneKey);
  }

  function validate() {
    setLastAction(validation.invalidBlocks ? `Validation failed: first broken block is #${validation.firstBrokenBlock + 1}.` : "Validation passed: every block hash and previous hash link is valid.");
  }

  return (
    <section id="tamper-link-lab" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <ShieldAlert size={17} /> Previous Hash Link Highlighter and Tamper Lab
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Break the chain and see why previous hashes matter</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Hover hash links, tamper with Block 2, watch invalid links appear, then repair the chain.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <HashLinkHighlighter chain={chain} validation={validation} hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} tampered={tampered} />
        <div className="grid content-start gap-5">
          <BlockchainStatusPanel validation={validation} tampered={tampered} />
          <article className="panel p-5">
            <h3 className="mb-4 inline-flex items-center gap-2 text-2xl font-black">
              <Sparkles className="text-cyanx" size={24} /> Tamper controls
            </h3>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={tamper} className="btn-primary">Tamper with Block</button>
              <button type="button" onClick={repair} className="btn-secondary"><Wrench size={18} /> Repair Chain</button>
              <button type="button" onClick={validate} className="btn-secondary"><Hammer size={18} /> Validate Chain</button>
              <button type="button" onClick={reset} className="btn-secondary"><RotateCcw size={18} /> Reset Chain</button>
            </div>
            <p className="mt-5 rounded-lg bg-slate-50 p-4 font-bold text-slate-700 dark:bg-white/5 dark:text-slate-200">{lastAction}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function loadChain() {
  try {
    const stored = JSON.parse(localStorage.getItem(chainKey) || "null");
    return Array.isArray(stored) && stored.length >= 3 ? stored : buildDefaultChain();
  } catch {
    return buildDefaultChain();
  }
}
