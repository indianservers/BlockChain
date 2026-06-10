import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Trophy } from "lucide-react";
import { createHash } from "../../utils/blockchainEngine.js";
import MinerCard from "./MinerCard.jsx";

const resultKey = "bfv-mining-race-result";
const targetPrefix = "000";

export default function MiningRaceArena() {
  const [miners, setMiners] = useState(createMiners);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState(() => localStorage.getItem(resultKey) || "");
  const [blocksAdded, setBlocksAdded] = useState(() => winner ? 1 : 0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running || winner) return undefined;
    intervalRef.current = window.setInterval(() => {
      setMiners(current => {
        let found = "";
        const next = current.map(miner => {
          if (found) return miner;
          let nonce = miner.nonce;
          let hash = miner.hash;
          let attempts = miner.attempts;
          for (let i = 0; i < miner.speed; i += 1) {
            nonce += 1;
            attempts += 1;
            hash = createHash(`${miner.name}|race-block|${nonce}`);
            if (hash.startsWith(targetPrefix)) {
              found = miner.name;
              break;
            }
          }
          return { ...miner, nonce, attempts, hash, energy: miner.energy + miner.energyPerTick, status: found === miner.name ? "Winner" : "Mining" };
        });
        if (found) {
          setWinner(found);
          setRunning(false);
          setBlocksAdded(value => value + 1);
          localStorage.setItem(resultKey, found);
          return next.map(miner => miner.name === found ? miner : { ...miner, status: "Stopped" });
        }
        return next;
      });
    }, 85);
    return () => window.clearInterval(intervalRef.current);
  }, [running, winner]);

  function start() {
    if (!winner) setRunning(true);
  }

  function reset() {
    window.clearInterval(intervalRef.current);
    setRunning(false);
    setWinner("");
    setBlocksAdded(0);
    setMiners(createMiners());
    localStorage.removeItem(resultKey);
  }

  return (
    <section id="mining-race-arena" className="section-wrap">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <Trophy size={17} /> Mining Race Arena
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Three miners race to satisfy the difficulty target</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Miner C is fastest but consumes more energy. The first miner to find a hash starting with 000 wins and adds the block.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {miners.map(miner => <MinerCard key={miner.name} miner={miner} winner={winner} />)}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <article className="panel p-5">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={start} disabled={running || Boolean(winner)} className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"><Play size={18} /> Start Race</button>
            <button type="button" onClick={() => setRunning(false)} className="btn-secondary"><Pause size={18} /> Pause Race</button>
            <button type="button" onClick={reset} className="btn-secondary"><RotateCcw size={18} /> Reset Race</button>
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 p-4 font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
            Attempts are capped per tick to keep the browser responsive.
          </p>
        </article>
        <article className="panel overflow-hidden">
          <div className="bg-slate-950 p-6 text-white">
            <h3 className="text-3xl font-black">Race result</h3>
            <p className="mt-3 text-slate-300">Difficulty target: hash starts with {targetPrefix}</p>
          </div>
          <div className="p-6">
            {winner ? (
              <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-lg bg-emerald-50 p-5 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100">
                <Trophy className="mb-3" size={34} />
                <h4 className="text-2xl font-black">{winner} wins the reward</h4>
                <p className="mt-2 font-bold">Reward animation complete. Blocks added to chain: {blocksAdded}</p>
              </motion.div>
            ) : (
              <p className="rounded-lg bg-slate-50 p-5 font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">Start the race to find a valid hash.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function createMiners() {
  return [
    miner("Miner A", "slow but steady", 8, 1),
    miner("Miner B", "medium speed", 16, 2),
    miner("Miner C", "fast but costly", 28, 4)
  ];
}

function miner(name, profile, speed, energyPerTick) {
  return {
    name,
    profile,
    speed,
    energyPerTick,
    nonce: 0,
    attempts: 0,
    hash: createHash(`${name}|race-block|0`),
    energy: 0,
    status: "Ready"
  };
}
