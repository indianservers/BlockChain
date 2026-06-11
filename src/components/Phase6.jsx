import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, GitFork, Network, Radio, RefreshCw, Scale, ShieldCheck, Swords, UserCheck, Vote } from "lucide-react";
import Phase6NetworkScene from "../scenes/Phase6NetworkScene.jsx";
import ConsensusVotingBoard from "./consensus/ConsensusVotingBoard.jsx";
import ForkSplitAnimation from "./consensus/ForkSplitAnimation.jsx";
import DoubleSpendAlarm from "./consensus/DoubleSpendAlarm.jsx";
import { phase6Quiz } from "../data/phase6.js";
import {
  bftStatus,
  consensusResult,
  consensusTypes,
  createConsensusNodes,
  createProposal,
  forkStats,
  makeFork,
  resolveFork,
  selectPoSValidator,
  simulateVotes,
  toggleNode
} from "../utils/consensusEngine.js";

export default function Phase6() {
  const [nodes, setNodes] = useState(() => loadNodes());
  const [threshold, setThreshold] = useState("67%");
  const [proposal, setProposal] = useState(() => createProposal("normal"));
  const [validator, setValidator] = useState(null);
  const [challenge, setChallenge] = useState({ consensus: false, doubleSpend: false, fork: false });
  const result = useMemo(() => consensusResult(nodes, threshold), [nodes, threshold]);
  const forks = useMemo(() => forkStats(nodes), [nodes]);
  const bft = useMemo(() => bftStatus(nodes), [nodes]);

  function voteOnProposal(type = "normal", attackMode = false) {
    const nextProposal = createProposal(type);
    setProposal(nextProposal);
    const voted = simulateVotes(nodes, nextProposal, attackMode);
    setNodes(voted);
    if (type === "double-spend") setChallenge(current => ({ ...current, doubleSpend: true }));
    if (type === "normal" && consensusResult(voted, threshold).reached) setChallenge(current => ({ ...current, consensus: true }));
  }

  function updateNodes(next) {
    setNodes(next);
    localStorage.setItem("bfv-phase6-nodes", JSON.stringify(next));
  }

  return (
    <>
      <section id="phase6" className="section-wrap bg-slate-950 text-white">
        <div className="grid items-center gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Network size={17} /> Consensus
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Consensus Mechanisms Visual Lab</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Control network nodes, simulate votes, demonstrate forks and double spends, compare consensus mechanisms, and test Byzantine fault tolerance.
            </p>
          </div>
          <div className="h-[430px] overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-soft">
            <Phase6NetworkScene />
          </div>
        </div>
      </section>

      <section id="node-network" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Radio} eyebrow="Seven-node network" title="Control node availability and behavior" description="Turn nodes online or offline, mark them honest or malicious, then watch how voting changes." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          {nodes.map(node => (
            <NodeCard key={node.id} node={node} onToggle={field => updateNodes(toggleNode(nodes, node.id, field))} />
          ))}
        </div>
      </section>

      <section id="proposal-voting" className="section-wrap">
        <PhaseTitle icon={Vote} eyebrow="Block proposal simulation" title="Propose a block and test majority voting" description="Choose a voting threshold, then simulate how honest and malicious nodes respond to valid or invalid proposals." />
        <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <article className="panel p-5">
            <label>
              <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Majority threshold</span>
              <select value={threshold} onChange={event => setThreshold(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5">
                {["51%", "67%", "75%"].map(item => <option key={item}>{item}</option>)}
              </select>
            </label>
            <div className="mt-5 grid gap-3">
              <button type="button" onClick={() => voteOnProposal("normal")} className="btn-primary">Propose Valid Block</button>
              <button type="button" onClick={() => voteOnProposal("double-spend")} className="btn-secondary">Propose Double Spend</button>
              <button type="button" onClick={() => voteOnProposal("normal", true)} className="btn-secondary">Simulate Malicious Rejection</button>
            </div>
            <ConsensusSummary result={result} threshold={threshold} />
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">{proposal.title}</h3>
            <p className={`mt-2 font-bold ${proposal.valid ? "text-emerald-600" : "text-red-500"}`}>{proposal.issue}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nodes.map(node => <VoteBadge key={node.id} node={node} />)}
            </div>
          </article>
        </div>
      </section>

      <ConsensusVotingBoard />

      <section id="fork-lab" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={GitFork} eyebrow="Fork demonstration" title="Split the network, then resolve to one chain" description="A fork means nodes temporarily disagree on which chain tip is valid. Consensus rules resolve the split." />
        <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <article className="panel p-5">
            <div className="grid gap-3">
              <button type="button" onClick={() => updateNodes(makeFork(nodes))} className="btn-secondary"><GitFork size={18} /> Create Fork</button>
              <button type="button" onClick={() => { updateNodes(resolveFork(nodes, forks.A >= forks.B ? "A" : "B")); setChallenge(current => ({ ...current, fork: true })); }} className="btn-primary"><RefreshCw size={18} /> Resolve Fork</button>
              <button type="button" onClick={() => updateNodes(createConsensusNodes())} className="btn-secondary">Reset Network</button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric title="Chain A" value={forks.A} />
              <Metric title="Chain B" value={forks.B} />
            </div>
          </article>
          <div className="grid gap-4 md:grid-cols-2">
            <ChainVisual title="Chain A" count={forks.A} tone="blue" />
            <ChainVisual title="Chain B" count={forks.B} tone="cyan" />
          </div>
        </div>
      </section>

      <ForkSplitAnimation />

      <section id="double-spend-bft" className="section-wrap">
        <PhaseTitle icon={Swords} eyebrow="Attacks and BFT" title="Detect double spend and measure Byzantine tolerance" description="Consensus should reject conflicting transactions and remain safe when faulty nodes stay below the tolerance limit." />
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Double-spend attack demo</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">The invalid proposal spends Alice's same funds twice. Honest nodes reject it.</p>
            <button type="button" onClick={() => voteOnProposal("double-spend")} className="btn-primary mt-5"><AlertTriangle size={18} /> Run Double Spend Demo</button>
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Byzantine Fault Tolerance</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric title="Online" value={bft.online} />
              <Metric title="Malicious" value={bft.malicious} />
              <Metric title="Max faults" value={bft.maxFaults} />
            </div>
            <p className={`mt-5 rounded-lg p-4 font-black ${bft.safe ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
              {bft.safe ? "BFT condition is safe in this network." : "Too many faulty nodes for BFT safety."}
            </p>
          </article>
        </div>
      </section>

      <DoubleSpendAlarm />

      <section id="consensus-types" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Scale} eyebrow="Consensus comparison" title="Compare major consensus mechanisms" description="Different networks choose different ways to select validators and finalize blocks." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {consensusTypes.map(([name, text]) => (
            <article key={name} className="panel p-5">
              <h3 className="text-xl font-black">{name}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
            </article>
          ))}
        </div>
        <article className="panel mt-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">Proof of Stake validator selector</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Higher stake increases selection chance in this simplified simulation.</p>
            </div>
            <button type="button" onClick={() => setValidator(selectPoSValidator(nodes))} className="btn-primary"><UserCheck size={18} /> Select Validator</button>
          </div>
          {validator && <p className="mt-5 rounded-lg bg-cyanx/10 p-4 font-black text-cyanx">{validator.name} selected with {validator.stake} stake.</p>}
        </article>
      </section>

      <section id="phase6-practice" className="section-wrap">
        <PhaseTitle icon={ShieldCheck} eyebrow="Practice and challenge" title="Reach consensus, detect attack, resolve fork" description="Finish the lab by proving you can guide the network to one valid chain state." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Phase6Quiz />
          <ChallengePanel challenge={challenge} />
        </div>
      </section>
    </>
  );
}

function NodeCard({ node, onToggle }) {
  return (
    <article className={`rounded-lg border p-4 shadow-soft ${node.online ? "bg-white dark:bg-slate-900/85" : "bg-slate-100 opacity-70 dark:bg-slate-800"} ${node.honest ? "border-slate-200 dark:border-white/10" : "border-red-300 dark:border-red-500/30"}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-black">{node.name}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-black ${node.chain === "A" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200" : "bg-cyanx/10 text-cyanx"}`}>Chain {node.chain}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">Stake: {node.stake}</p>
      <div className="mt-4 grid gap-2">
        <button type="button" onClick={() => onToggle("online")} className="btn-secondary min-h-9 py-1 text-sm">{node.online ? "Set Offline" : "Set Online"}</button>
        <button type="button" onClick={() => onToggle("honest")} className="btn-secondary min-h-9 py-1 text-sm">{node.honest ? "Make Malicious" : "Make Honest"}</button>
      </div>
    </article>
  );
}

function VoteBadge({ node }) {
  return (
    <div className={`rounded-lg border p-3 ${node.vote === "accept" ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200" : node.vote === "reject" ? "border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5"}`}>
      <p className="font-black">{node.name}</p>
      <p className="text-sm font-bold">{node.online ? node.vote ?? "No vote" : "Offline"}</p>
    </div>
  );
}

function ConsensusSummary({ result, threshold }) {
  return (
    <div className="mt-5 rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <p className="font-black">Threshold: {threshold}</p>
      <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">Accepts: {result.accepts} / Required: {result.required} / Online: {result.online}</p>
      <p className={`mt-3 font-black ${result.reached ? "text-emerald-600" : "text-red-500"}`}>{result.reached ? "Consensus reached" : "Consensus not reached"}</p>
    </div>
  );
}

function ChainVisual({ title, count, tone }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {Array.from({ length: Math.max(1, count) }, (_, index) => (
          <div key={index} className={`grid h-16 w-16 place-items-center rounded-lg font-black text-white ${tone === "blue" ? "bg-bluex" : "bg-cyanx"}`}>{index + 1}</div>
        ))}
      </div>
      <p className="mt-4 font-bold text-slate-600 dark:text-slate-300">{count} node(s) following this chain.</p>
    </article>
  );
}

function Phase6Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-phase6-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = phase6Quiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-phase6-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${phase6Quiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <>
          <h3 className="text-3xl font-black">Consensus score: {score}/{phase6Quiz.length}</h3>
          <button type="button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false); localStorage.setItem("bfv-phase6-quiz", "0"); }} className="btn-primary mt-6">Restart</button>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === phase6Quiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function ChallengePanel({ challenge }) {
  const rows = [
    ["Reach consensus", challenge.consensus],
    ["Detect double spend", challenge.doubleSpend],
    ["Resolve fork", challenge.fork]
  ];
  return (
    <article className="panel p-6">
      <h3 className="text-2xl font-black">Challenge checklist</h3>
      <div className="mt-5 grid gap-3">
        {rows.map(([label, done]) => (
          <div key={label} className={`flex items-center gap-3 rounded-lg p-4 font-black ${done ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
            {done ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            {label}
          </div>
        ))}
      </div>
    </article>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
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

function loadNodes() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-phase6-nodes") || "null");
    return Array.isArray(stored) && stored.length === 7 ? stored : createConsensusNodes();
  } catch {
    return createConsensusNodes();
  }
}
