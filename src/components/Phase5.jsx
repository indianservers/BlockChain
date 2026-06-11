import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, BatteryCharging, Blocks, CheckCircle2, Gauge, Hammer, Pause, Pickaxe, Play, RotateCcw, Trophy, Zap } from "lucide-react";
import Phase5MiningScene from "../scenes/Phase5MiningScene.jsx";
import { energyProfiles, phase5Quiz } from "../data/phase5.js";
import {
  createCandidateBlock,
  createMinedBlockFrom,
  difficulties,
  mineBatch,
  minerProfiles,
  setNonce,
  tamperMinedBlock,
  validateProof
} from "../utils/miningEngine.js";
import { hashPreview } from "../utils/blockchainEngine.js";

export default function Phase5() {
  const [difficulty, setDifficulty] = useState("Easy");
  const [candidate, setCandidate] = useState(() => createCandidateBlock());
  const [isMining, setIsMining] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [rewardTotal, setRewardTotal] = useState(0);
  const [energy, setEnergy] = useState(45);
  const [minedBlocks, setMinedBlocks] = useState(() => loadMinedBlocks());
  const [race, setRace] = useState(() => initialRaceState());
  const intervalRef = useRef(null);
  const raceRef = useRef(null);
  const proof = useMemo(() => validateProof(candidate, difficulty), [candidate, difficulty]);
  const energyProfile = energyProfiles[energy < 35 ? 0 : energy < 75 ? 1 : 2];
  const estimatedCost = (attempts * energyProfile[2]).toFixed(2);

  useEffect(() => {
    if (!isMining) return undefined;
    intervalRef.current = window.setInterval(() => {
      setCandidate(current => {
        const result = mineBatch(current, difficulty);
        setAttempts(value => value + result.attempts);
        if (result.found) {
          setIsMining(false);
          setRewardTotal(total => total + result.block.reward);
          return result.block;
        }
        return result.block;
      });
    }, 35);
    return () => window.clearInterval(intervalRef.current);
  }, [isMining, difficulty]);

  useEffect(() => {
    localStorage.setItem("bfv-phase5-mined", JSON.stringify(minedBlocks));
  }, [minedBlocks]);

  function tryNextNonce() {
    setCandidate(current => setNonce(current, current.nonce + 1));
    setAttempts(current => current + 1);
  }

  function resetCandidate() {
    setIsMining(false);
    setCandidate(createCandidateBlock({ index: minedBlocks.length + 1 }));
    setAttempts(0);
  }

  function saveMinedBlock() {
    const result = validateProof(candidate, difficulty);
    if (!result.meetsTarget || !result.validHash) return;
    setMinedBlocks(current => [...current, candidate]);
    setCandidate(createMinedBlockFrom(candidate, `Candidate block ${minedBlocks.length + 2}`, "Learner Miner"));
    setAttempts(0);
  }

  function startRace() {
    window.clearInterval(raceRef.current);
    setRace(initialRaceState());
    raceRef.current = window.setInterval(() => {
      setRace(current => {
        if (current.winner) return current;
        const nextMiners = current.miners.map(miner => {
          let block = miner.block;
          let localAttempts = 0;
          for (let i = 0; i < miner.speed; i += 1) {
            block = setNonce(block, block.nonce + 1);
            localAttempts += 1;
            if (validateProof(block, "Medium").meetsTarget) {
              return { ...miner, block, attempts: miner.attempts + localAttempts, won: true };
            }
          }
          return { ...miner, block, attempts: miner.attempts + localAttempts };
        });
        const winner = nextMiners.find(miner => miner.won);
        if (winner) window.clearInterval(raceRef.current);
        return { miners: nextMiners, winner: winner?.name ?? null };
      });
    }, 80);
  }

  return (
    <>
      <section id="phase5" className="section-wrap bg-slate-950 text-white">
        <div className="grid items-center gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Pickaxe size={17} /> Mining
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Mining, Nonce & Proof of Work Simulator</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Search for a nonce, satisfy a difficulty target, earn rewards, compare miners, and see why tampering destroys proof.
            </p>
          </div>
          <div className="h-[430px] overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-soft">
            <Phase5MiningScene />
          </div>
        </div>
      </section>

      <section id="mining-simulator" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Hammer} eyebrow="Candidate block builder" title="Mine a candidate block without freezing the browser" description="Manual mode tries one nonce. Auto mode searches in controlled batches, updating state between intervals." />
        <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <article className="panel p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Block data</span>
                <textarea value={candidate.data} onChange={event => setCandidate(current => createCandidateBlock({ ...current, data: event.target.value, index: current.index, previousHash: current.previousHash, miner: current.miner }))} rows={3} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-semibold dark:border-white/10 dark:bg-white/5" />
              </label>
              <Select label="Difficulty" value={difficulty} onChange={setDifficulty} options={Object.keys(difficulties)} />
              <label>
                <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Nonce slider</span>
                <input type="range" min="0" max="20000" value={candidate.nonce} onChange={event => setCandidate(current => setNonce(current, event.target.value))} className="w-full accent-cyanx" />
                <p className="mt-1 font-mono text-sm font-black">{candidate.nonce}</p>
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={tryNextNonce} className="btn-secondary"><Zap size={18} /> Try Next Nonce</button>
              <button type="button" onClick={() => setIsMining(true)} disabled={isMining || proof.meetsTarget} className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"><Play size={18} /> Start Auto</button>
              <button type="button" onClick={() => setIsMining(false)} className="btn-secondary"><Pause size={18} /> Pause</button>
              <button type="button" onClick={resetCandidate} className="btn-secondary"><RotateCcw size={18} /> Reset</button>
            </div>
          </article>

          <MiningStatus candidate={candidate} proof={proof} difficulty={difficulty} attempts={attempts} isMining={isMining} rewardTotal={rewardTotal} saveMinedBlock={saveMinedBlock} />
        </div>
      </section>

      <section id="difficulty-race" className="section-wrap">
        <PhaseTitle icon={Gauge} eyebrow="Difficulty and miner race" title="Compare targets and watch miners compete" description="Higher difficulty means fewer hashes pass. Faster miners try more nonces per interval." />
        <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <DifficultyComparison active={difficulty} />
          <MinerRace race={race} startRace={startRace} />
        </div>
      </section>

      <section id="reward-energy" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={BatteryCharging} eyebrow="Reward, energy, and cost awareness" title="Mining has incentives and resource costs" description="Rewards motivate miners, but proof-of-work also consumes compute and energy." />
        <div className="grid gap-5 lg:grid-cols-3">
          <MetricCard title="Total rewards" value={`${rewardTotal.toFixed(1)} tokens`} />
          <MetricCard title="Attempts" value={attempts} />
          <article className="panel p-5">
            <h3 className="text-xl font-black">Energy intensity</h3>
            <input type="range" min="1" max="100" value={energy} onChange={event => setEnergy(Number(event.target.value))} className="mt-5 w-full accent-cyanx" />
            <p className="mt-3 font-black">{energyProfile[0]}: {energyProfile[1]}</p>
            <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">Estimated learning cost units: {estimatedCost}</p>
          </article>
        </div>
      </section>

      <section id="tamper-remine" className="section-wrap">
        <PhaseTitle icon={AlertTriangle} eyebrow="Tamper after mining" title="Tampering destroys proof of work" description="If mined data changes, the stored hash no longer matches the block contents. Re-mine to find a new valid nonce." />
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <article className="panel p-5">
            <button type="button" onClick={() => setCandidate(current => tamperMinedBlock(current))} className="btn-secondary"><AlertTriangle size={18} /> Tamper Current Block</button>
            <button type="button" onClick={() => { setCandidate(current => setNonce({ ...current, hash: "" }, 0)); setIsMining(true); }} className="btn-primary ml-0 mt-3 sm:ml-3 sm:mt-0"><Pickaxe size={18} /> Re-mine Block</button>
            <p className="mt-5 rounded-lg bg-amber-50 p-4 font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              A tampered block may still show the old hash, but validation recalculates the expected hash and rejects the proof.
            </p>
          </article>
          <MiningStatus candidate={candidate} proof={proof} difficulty={difficulty} attempts={attempts} isMining={isMining} rewardTotal={rewardTotal} saveMinedBlock={saveMinedBlock} compact />
        </div>
      </section>

      <section id="phase5-practice" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Trophy} eyebrow="Practice and challenge" title="Mine 3 valid blocks" description="Answer the quiz, then add three proof-valid blocks into your learning chain." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Phase5Quiz />
          <MiningChallenge minedBlocks={minedBlocks} proof={proof} candidate={candidate} saveMinedBlock={saveMinedBlock} />
        </div>
      </section>
    </>
  );
}

function MiningStatus({ candidate, proof, difficulty, attempts, isMining, rewardTotal, saveMinedBlock, compact }) {
  const ok = proof.validHash && proof.meetsTarget;
  return (
    <article className="panel p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black">Block #{candidate.index}</h3>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{candidate.miner}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-black ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"}`}>
          {ok ? "Proof valid" : isMining ? "Mining..." : "Searching"}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nonce" value={candidate.nonce} />
        <Field label="Difficulty target" value={proof.target} mono />
        <Field label="Current hash" value={hashPreview(candidate.hash, 14)} mono wide />
        <Field label="Attempts" value={attempts} />
        {!compact && <Field label="Reward total" value={`${rewardTotal.toFixed(1)} tokens`} />}
        <Field label="Difficulty" value={`${difficulty} · ${difficulties[difficulty].label}`} />
      </div>
      <div className="mt-5 grid gap-2">
        <Status ok={proof.validHash} label="Stored hash matches block contents" />
        <Status ok={proof.meetsTarget} label={`Hash starts with target prefix "${proof.prefix}"`} />
      </div>
      <button type="button" onClick={saveMinedBlock} disabled={!ok} className="btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-45">
        <Blocks size={18} /> Add Valid Block
      </button>
    </article>
  );
}

function DifficultyComparison({ active }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Difficulty comparison</h3>
      <div className="mt-5 grid gap-3">
        {Object.entries(difficulties).map(([name, config]) => (
          <div key={name} className={`rounded-lg border p-4 ${active === name ? "border-cyanx bg-cyanx/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-black">{name}</p>
              <p className="font-mono text-sm font-black">{config.prefix}***</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full bg-gradient-to-r from-bluex to-cyanx" style={{ width: `${Math.min(100, config.prefix.length * 24)}%` }} />
            </div>
            <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">{config.label}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function MinerRace({ race, startRace }) {
  return (
    <article className="panel p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-black">Miner race simulator</h3>
        <button type="button" onClick={startRace} className="btn-primary"><Play size={18} /> Start Race</button>
      </div>
      <div className="grid gap-4">
        {race.miners.map(miner => {
          const progress = Math.min(100, (miner.attempts % 1000) / 10);
          return (
            <div key={miner.name} className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
              <div className="mb-2 flex justify-between font-black">
                <span>{miner.name}</span>
                <span>{miner.attempts} attempts</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className={`h-full ${miner.color}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {race.winner && <p className="mt-5 rounded-lg bg-emerald-50 p-4 font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">{race.winner} found the valid proof first.</p>}
    </article>
  );
}

function Phase5Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-phase5-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = phase5Quiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-phase5-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${phase5Quiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <>
          <h3 className="text-3xl font-black">Mining score: {score}/{phase5Quiz.length}</h3>
          <button type="button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false); localStorage.setItem("bfv-phase5-quiz", "0"); }} className="btn-primary mt-6">Restart</button>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-black">{question.question}</h3>
          <div className="mt-5 grid gap-3">
            {question.options.map(option => {
              const correct = selected && option === question.answer;
              const wrong = selected === option && option !== question.answer;
              return <button key={option} type="button" onClick={() => choose(option)} className={`rounded-lg border p-4 text-left font-bold transition ${correct ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : wrong ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-200" : "border-slate-200 bg-slate-50 hover:border-cyanx dark:border-white/10 dark:bg-white/5"}`}>{option}</button>;
            })}
          </div>
          <p className={`mt-4 min-h-7 font-black ${selected === question.answer ? "text-emerald-600" : "text-red-500"}`}>{selected ? (selected === question.answer ? "Correct." : `Correct answer: ${question.answer}.`) : ""}</p>
          <button type="button" disabled={!selected} onClick={() => { if (index === phase5Quiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function MiningChallenge({ minedBlocks, proof, candidate, saveMinedBlock }) {
  const complete = minedBlocks.length >= 3;
  return (
    <article className="panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black">Challenge: mine 3 valid blocks</h3>
          <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">Use the simulator to find valid proofs, then add each block to your mined chain.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-black ${complete ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"}`}>{Math.min(3, minedBlocks.length)}/3</span>
      </div>
      <button type="button" onClick={saveMinedBlock} disabled={!proof.meetsTarget || !proof.validHash} className="btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-45">Add Current Valid Block</button>
      <div className="mt-5 grid gap-3">
        {minedBlocks.slice(0, 3).map(block => (
          <div key={`${block.index}-${block.hash}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="font-black">Block #{block.index}</p>
            <p className="font-mono text-sm font-bold text-cyanx">{hashPreview(block.hash, 14)}</p>
          </div>
        ))}
        {!minedBlocks.length && <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">No mined blocks added yet.</p>}
      </div>
      {complete && <p className="mt-5 rounded-lg bg-emerald-50 p-4 font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">Challenge complete. You mined 3 proof-valid blocks.</p>}
    </article>
  );
}

function PhaseTitle({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="mb-7 max-w-3xl">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
        <Icon size={17} /> {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5">
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Field({ label, value, mono, wide }) {
  return (
    <div className={`rounded-lg bg-slate-50 p-3 dark:bg-white/5 ${wide ? "md:col-span-2" : ""}`}>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`${mono ? "font-mono" : ""} break-words font-black`}>{value}</p>
    </div>
  );
}

function Status({ ok, label }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg p-3 font-bold ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
      {ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      {label}
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <article className="panel p-5">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </article>
  );
}

function initialRaceState() {
  return {
    winner: null,
    miners: minerProfiles.map(profile => ({
      ...profile,
      attempts: 0,
      won: false,
      block: createCandidateBlock({ miner: profile.name, data: `${profile.name} race block` })
    }))
  };
}

function loadMinedBlocks() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-phase5-mined") || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}
