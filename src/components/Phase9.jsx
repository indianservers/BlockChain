import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Banknote, CheckCircle2, Clock, Landmark, Plus, RefreshCw, Scale, ShieldAlert, Shuffle, Sprout, Truck, Vote } from "lucide-react";
import { phase9Quiz, realWorldUseCases, riskCards } from "../data/phase9.js";
import {
  addCheckpoint,
  addLiquidity,
  advanceStakingTime,
  createDeFiState,
  createProposal,
  daoMetrics,
  executeProposal,
  lendingMetrics,
  removeLiquidity,
  stakeTokens,
  swapTokens,
  unstakeTokens,
  updateLending,
  voteProposal
} from "../utils/defiEngine.js";
import { hashPreview } from "../utils/blockchainEngine.js";

export default function Phase9() {
  const [state, setState] = useState(() => loadDeFiState());
  const [swapAmount, setSwapAmount] = useState(1);
  const [swapInput, setSwapInput] = useState("ETH");
  const [liquidity, setLiquidity] = useState({ a: 5, b: 10000, remove: 10 });
  const [stakeAmount, setStakeAmount] = useState(50);
  const [proposalTitle, setProposalTitle] = useState("Fund public goods education");
  const [checkpoint, setCheckpoint] = useState({ label: "Packed at origin", actor: "Factory" });
  const lending = useMemo(() => lendingMetrics(state.lending), [state.lending]);
  const dao = useMemo(() => daoMetrics(state.dao), [state.dao]);

  useEffect(() => {
    localStorage.setItem("bfv-phase9-state", JSON.stringify(state));
  }, [state]);

  return (
    <>
      <section id="phase9" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Landmark size={17} /> DeFi & DAO
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">DeFi, DAO & Real-World Blockchain Lab</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Practice swaps, liquidity, lending, staking, DAO governance, supply-chain tracking, and real-world blockchain risk analysis.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Pool ETH" value={state.pool.reserveA.toFixed(2)} />
            <HeroStat label="Pool USDC" value={state.pool.reserveB.toFixed(0)} />
            <HeroStat label="DAO votes" value={dao.total} />
            <HeroStat label="Checkpoints" value={state.supplyChain.checkpoints.length} />
          </div>
        </div>
      </section>

      <section id="defi-flow" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Shuffle} eyebrow="DeFi visual explanation" title="Wallets interact with smart contracts, pools, and rewards" description="DeFi replaces many manual financial steps with transparent contract rules and shared state." />
        <div className="grid gap-3 md:grid-cols-5">
          {["Wallet", "Smart Contract", "Pool", "Reward / Loan / Swap", "Event Log"].map((step, index) => (
            <article key={step} className="panel p-4 text-center">
              <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg bg-cyanx/10 font-black text-cyanx">{index + 1}</span>
              <h3 className="font-black">{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="swap-liquidity" className="section-wrap">
        <PhaseTitle icon={Banknote} eyebrow="Swap and liquidity pool" title="Use x * y = k and manage liquidity" description="Swaps change reserves according to a constant-product curve. Liquidity providers add reserves and earn fees." />
        <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Token swap</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Select label="Input token" value={swapInput} onChange={setSwapInput} options={[state.pool.tokenA, state.pool.tokenB]} />
              <Input label="Amount" type="number" value={swapAmount} onChange={setSwapAmount} />
            </div>
            <button type="button" onClick={() => setState(current => swapTokens(current, swapInput, swapAmount))} className="btn-primary mt-4">Swap</button>
            <h3 className="mt-8 text-2xl font-black">Liquidity</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Input label="ETH" type="number" value={liquidity.a} onChange={value => setLiquidity(current => ({ ...current, a: value }))} />
              <Input label="USDC" type="number" value={liquidity.b} onChange={value => setLiquidity(current => ({ ...current, b: value }))} />
              <Input label="Remove shares" type="number" value={liquidity.remove} onChange={value => setLiquidity(current => ({ ...current, remove: value }))} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => addLiquidity(current, liquidity.a, liquidity.b))} className="btn-secondary">Add Liquidity</button>
              <button type="button" onClick={() => setState(current => removeLiquidity(current, liquidity.remove))} className="btn-secondary">Remove Liquidity</button>
            </div>
          </article>
          <PoolCards pool={state.pool} />
        </div>
      </section>

      <section id="lending-staking" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Sprout} eyebrow="Lending and staking" title="Borrow against collateral, then earn staking rewards" description="Lending risk depends on collateral value and borrowed amount. Staking rewards grow over simulated time." />
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Lending and borrowing</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Input label="Collateral ETH" type="number" value={state.lending.collateral} onChange={value => setState(current => updateLending(current, { collateral: Number(value) }))} />
              <Input label="ETH price" type="number" value={state.lending.collateralPrice} onChange={value => setState(current => updateLending(current, { collateralPrice: Number(value) }))} />
              <Input label="Borrowed USDC" type="number" value={state.lending.borrowed} onChange={value => setState(current => updateLending(current, { borrowed: Number(value) }))} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric title="LTV" value={`${(lending.ltv * 100).toFixed(1)}%`} />
              <Metric title="Health" value={Number.isFinite(lending.healthFactor) ? lending.healthFactor.toFixed(2) : "∞"} />
              <Metric title="Collateral" value={`$${lending.collateralValue.toFixed(0)}`} />
            </div>
            {lending.liquidationRisk && <p className="mt-4 rounded-lg bg-red-50 p-4 font-black text-red-700 dark:bg-red-500/15 dark:text-red-200">Liquidation warning: health factor is too low.</p>}
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Staking simulator</h3>
            <Input label="Stake amount" type="number" value={stakeAmount} onChange={setStakeAmount} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => stakeTokens(current, stakeAmount))} className="btn-secondary">Stake</button>
              <button type="button" onClick={() => setState(current => advanceStakingTime(current, 7))} className="btn-secondary"><Clock size={18} /> Advance 7 Days</button>
              <button type="button" onClick={() => setState(current => unstakeTokens(current))} className="btn-secondary">Unstake</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric title="Staked" value={state.staking.staked.toFixed(2)} />
              <Metric title="Rewards" value={state.staking.pendingRewards.toFixed(3)} />
              <Metric title="Days" value={state.staking.days} />
            </div>
          </article>
        </div>
      </section>

      <section id="dao-governance" className="section-wrap">
        <PhaseTitle icon={Vote} eyebrow="DAO governance" title="Create proposal, vote, quorum, execute" description="DAO decisions require participation and majority support before execution." />
        <article className="panel p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input label="Proposal title" value={proposalTitle} onChange={setProposalTitle} />
            <button type="button" onClick={() => setState(current => createProposal(current, proposalTitle))} className="btn-primary self-end"><Plus size={18} /> Create Proposal</button>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <h3 className="text-2xl font-black">{state.dao.proposal ?? "No active proposal"}</h3>
              <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">Quorum required: {state.dao.quorum}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => setState(current => voteProposal(current, "for", 25))} className="btn-secondary">Vote For +25</button>
                <button type="button" onClick={() => setState(current => voteProposal(current, "against", 15))} className="btn-secondary">Vote Against +15</button>
                <button type="button" onClick={() => setState(current => executeProposal(current))} className="btn-primary">Execute</button>
              </div>
            </div>
            <DaoBars dao={state.dao} metrics={dao} />
          </div>
        </article>
      </section>

      <section id="real-world-supply" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Truck} eyebrow="Real-world blockchain" title="Explore use cases and track supply chain checkpoints" description="Real-world systems often use hashes, timestamps, and shared records to verify process history." />
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <UseCaseExplorer />
          <SupplyChainTracker state={state} setState={setState} checkpoint={checkpoint} setCheckpoint={setCheckpoint} />
        </div>
      </section>

      <section id="defi-risks" className="section-wrap">
        <PhaseTitle icon={ShieldAlert} eyebrow="Risks and limitations" title="Professional tools must show risk, not just upside" description="DeFi and blockchain systems can fail through code, incentives, users, or external dependencies." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {riskCards.map(([title, text]) => (
            <article key={title} className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-soft dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              <AlertTriangle className="mb-3" size={24} />
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-2 leading-7 font-bold">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="phase9-events" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Scale} eyebrow="DeFi event log" title="Every lab action emits a record" description="Swaps, liquidity, lending updates, staking, DAO votes, and supply-chain checkpoints are logged." />
        <EventConsole events={state.events} />
      </section>

      <section id="phase9-practice" className="section-wrap">
        <PhaseTitle icon={CheckCircle2} eyebrow="Practice and challenge" title="Complete the DeFi and DAO workflow" description="Swap, add liquidity, borrow, stake, vote, and complete a supply-chain tracker." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Phase9Quiz />
          <ChallengePanel challenge={state.challenge} reset={() => setState(createDeFiState())} />
        </div>
      </section>
    </>
  );
}

function PoolCards({ pool }) {
  const k = pool.reserveA * pool.reserveB;
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Pool state</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric title={`${pool.tokenA} reserve`} value={pool.reserveA.toFixed(4)} />
        <Metric title={`${pool.tokenB} reserve`} value={pool.reserveB.toFixed(2)} />
        <Metric title="x * y = k" value={k.toFixed(0)} />
        <Metric title="LP shares" value={pool.lpShares.toFixed(2)} />
        <Metric title="Your shares" value={pool.userShares.toFixed(2)} />
        <Metric title="Fees earned" value={pool.feesEarned.toFixed(4)} />
      </div>
    </article>
  );
}

function DaoBars({ dao, metrics }) {
  const total = Math.max(1, metrics.total);
  return (
    <div className="grid gap-4">
      <VoteBar label="For" value={dao.votesFor} total={total} color="bg-emerald-500" />
      <VoteBar label="Against" value={dao.votesAgainst} total={total} color="bg-red-500" />
      <div className={`rounded-lg p-4 font-black ${metrics.passed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"}`}>
        {metrics.passed ? "Proposal can execute" : metrics.quorumMet ? "Quorum met, but yes votes must win" : "Quorum not met"}
      </div>
    </div>
  );
}

function VoteBar({ label, value, total, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between font-black"><span>{label}</span><span>{value}</span></div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className={`h-full ${color}`} style={{ width: `${(value / total) * 100}%` }} />
      </div>
    </div>
  );
}

function SupplyChainTracker({ state, setState, checkpoint, setCheckpoint }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Supply chain tracker</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Input label="Checkpoint" value={checkpoint.label} onChange={value => setCheckpoint(current => ({ ...current, label: value }))} />
        <Input label="Actor" value={checkpoint.actor} onChange={value => setCheckpoint(current => ({ ...current, actor: value }))} />
        <button type="button" onClick={() => setState(current => addCheckpoint(current, checkpoint.label, checkpoint.actor))} className="btn-primary self-end"><Plus size={18} /> Add</button>
      </div>
      <div className="mt-5 grid gap-3">
        {state.supplyChain.checkpoints.map(item => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap justify-between gap-3">
              <p className="font-black">#{item.id} {item.label}</p>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{item.time}</p>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">Actor: {item.actor}</p>
            <p className="mt-2 font-mono text-sm text-cyanx">hash {hashPreview(item.hash, 14)}</p>
            <p className="font-mono text-xs text-slate-500">prev {hashPreview(item.previousHash, 10)}</p>
          </div>
        ))}
        {!state.supplyChain.checkpoints.length && <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">No checkpoints yet.</p>}
      </div>
    </article>
  );
}

function UseCaseExplorer() {
  const [active, setActive] = useState(realWorldUseCases[0]);
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Use case explorer</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {realWorldUseCases.map(item => (
          <button key={item[0]} type="button" onClick={() => setActive(item)} className={`rounded-lg border p-3 text-left font-bold ${active[0] === item[0] ? "border-cyanx bg-cyanx/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>{item[0]}</button>
        ))}
      </div>
      <p className="mt-5 rounded-lg bg-cyanx/10 p-4 text-lg font-bold leading-8 text-cyanx">{active[1]}</p>
    </article>
  );
}

function EventConsole({ events }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">Event log</h3>
      </div>
      <div className="max-h-96 overflow-auto p-4 font-mono text-sm">
        {events.map(event => (
          <div key={event.id} className="mb-3 text-slate-200">
            <span className="text-cyanx">[{event.time}]</span> <span className="text-emerald-300">{event.name}</span> {event.message}
          </div>
        ))}
      </div>
    </article>
  );
}

function Phase9Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-phase9-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = phase9Quiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-phase9-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${phase9Quiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <>
          <h3 className="text-3xl font-black">DeFi score: {score}/{phase9Quiz.length}</h3>
          <button type="button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false); localStorage.setItem("bfv-phase9-quiz", "0"); }} className="btn-primary mt-6">Restart</button>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === phase9Quiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function ChallengePanel({ challenge, reset }) {
  const rows = [
    ["Swap", challenge.swapped],
    ["Add liquidity", challenge.liquidity],
    ["Borrow", challenge.borrowed],
    ["Stake", challenge.staked],
    ["Vote", challenge.voted],
    ["Supply chain tracker", challenge.supplyTracked]
  ];
  return (
    <article className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-black">Challenge checklist</h3>
        <button type="button" onClick={reset} className="btn-secondary"><RefreshCw size={18} /> Reset</button>
      </div>
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
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-5">
      <p className="text-sm font-black uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input type={type} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5">
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
    </label>
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

function loadDeFiState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-phase9-state") || "null");
    return stored?.pool ? stored : createDeFiState();
  } catch {
    return createDeFiState();
  }
}
