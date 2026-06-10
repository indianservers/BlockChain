import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Banknote, CheckCircle2, CircleDollarSign, Landmark, RefreshCw, ShieldAlert, UsersRound, Vote } from "lucide-react";
import { daoTreasuryCaseQuiz } from "../data/daoTreasuryCase.js";
import {
  castVote,
  createDaoTreasuryState,
  createProposal,
  daoMetrics,
  executeTreasuryPayment,
  resetDaoCase
} from "../utils/daoTreasuryCaseEngine.js";
import { hashPreview } from "../utils/blockchainEngine.js";

export default function DaoTreasuryVotingCase() {
  const [state, setState] = useState(() => loadDaoState());
  const [draft, setDraft] = useState({
    title: "Fund regional blockchain student bootcamp",
    recipient: "0xEDUGrants2026",
    amount: 18500,
    reason: "Pay educators, venue, learning kits, and student certificates.",
    malicious: false
  });
  const metrics = useMemo(() => daoMetrics(state), [state]);

  useEffect(() => {
    localStorage.setItem("bfv-dao-treasury-case", JSON.stringify(state));
  }, [state]);

  return (
    <>
      <section id="dao-treasury-case" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Landmark size={17} /> Case Study
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">DAO Treasury Voting</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Govern a shared treasury by creating proposals, calculating token-weighted voting power, meeting quorum, and executing approved payments.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Treasury balance" value={`$${state.treasury.balance.toLocaleString()}`} />
            <HeroStat label="Governance holders" value={state.holders.length} />
            <HeroStat label="Quorum needed" value={`${state.treasury.quorumPercent}%`} />
            <HeroStat label="Badge" value={state.completed ? "Earned" : "Pending"} />
          </div>
        </div>
      </section>

      <section id="dao-dashboard" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={CircleDollarSign} eyebrow="DAO dashboard" title="Shared treasury and governance token holders" description="Each holder controls votes proportional to their governance token balance. Treasury payments should follow the passed proposal." />
        <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <article className="panel overflow-hidden">
            <div className="bg-slate-950 p-6 text-white">
              <Banknote className="mb-4 text-cyanx" size={34} />
              <h3 className="text-3xl font-black">{state.treasury.name}</h3>
              <p className="mt-3 text-5xl font-black">${state.treasury.balance.toLocaleString()}</p>
              <p className="mt-3 text-slate-300">Payments unlock only after quorum and majority approval.</p>
            </div>
            <div className="grid gap-3 p-5">
              <Field label="Token symbol" value={state.treasury.tokenSymbol} />
              <Field label="Total voting power" value={`${metrics.total} ${state.treasury.tokenSymbol}`} />
              <Field label="Quorum requirement" value={`${metrics.quorumNeeded} votes (${state.treasury.quorumPercent}%)`} />
            </div>
          </article>
          <div className="grid gap-4 md:grid-cols-2">
            {state.holders.map(holder => (
              <HolderCard key={holder.id} holder={holder} total={metrics.total} selected={state.selectedHolderId === holder.id} onSelect={() => setState(current => ({ ...current, selectedHolderId: holder.id }))} />
            ))}
          </div>
        </div>
      </section>

      <section id="dao-proposal" className="section-wrap">
        <PhaseTitle icon={Vote} eyebrow="Proposal creation" title="Create a treasury payment proposal" description="A proposal asks token holders to approve a payment from the shared treasury. Malicious proposals are intentionally blocked in this lab." />
        <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <article className="panel p-5">
            <div className="grid gap-3">
              <Input label="Proposal title" value={draft.title} onChange={value => setDraft(current => ({ ...current, title: value }))} />
              <Input label="Recipient wallet" value={draft.recipient} onChange={value => setDraft(current => ({ ...current, recipient: value }))} />
              <Input label="Payment amount" type="number" value={draft.amount} onChange={value => setDraft(current => ({ ...current, amount: Number(value) }))} />
              <label>
                <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Reason</span>
                <textarea value={draft.reason} onChange={event => setDraft(current => ({ ...current, reason: event.target.value }))} className="min-h-28 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 font-black text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                <input type="checkbox" checked={draft.malicious} onChange={event => setDraft(current => ({ ...current, malicious: event.target.checked }))} className="h-5 w-5" />
                Mark as suspicious drain proposal
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => createProposal(current, draft))} className="btn-primary">Create Proposal</button>
              <button type="button" onClick={() => setState(resetDaoCase())} className="btn-secondary"><RefreshCw size={18} /> Reset Case</button>
            </div>
          </article>
          <ProposalCard state={state} metrics={metrics} />
        </div>
      </section>

      <section id="dao-voting" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={UsersRound} eyebrow="Voting power and quorum" title="Cast weighted votes and watch quorum" description="Select a token holder, vote for or against, and see the live governance result." />
        <div className="grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Selected voter</h3>
            <select value={state.selectedHolderId} onChange={event => setState(current => ({ ...current, selectedHolderId: event.target.value }))} className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-bold dark:border-white/10 dark:bg-slate-900">
              {state.holders.map(holder => <option key={holder.id} value={holder.id}>{holder.name} - {holder.tokens} GOV</option>)}
            </select>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => castVote(current, current.selectedHolderId, "for"))} className="btn-primary">Vote For</button>
              <button type="button" onClick={() => setState(current => castVote(current, current.selectedHolderId, "against"))} className="btn-secondary">Vote Against</button>
            </div>
            <p className="mt-4 rounded-lg bg-slate-50 p-4 font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
              A holder can update their vote. The latest vote replaces the previous one.
            </p>
          </article>
          <VotingBars state={state} metrics={metrics} />
        </div>
      </section>

      <section id="dao-execution" className="section-wrap">
        <PhaseTitle icon={Banknote} eyebrow="Treasury flow animation" title="Execute only passed treasury payments" description="The payment path activates after quorum is met, for-votes win, and the proposal is not flagged as malicious." />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <TreasuryFlow state={state} metrics={metrics} />
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Payment execution</h3>
            <div className="mt-5 grid gap-3">
              <Status ok={Boolean(state.proposal)} label="Proposal exists" />
              <Status ok={metrics.quorumMet} label="Quorum requirement met" />
              <Status ok={metrics.passed} label="For votes beat against votes" />
              <Status ok={!state.proposal?.malicious} label="No malicious warning" />
            </div>
            <button type="button" onClick={() => setState(current => executeTreasuryPayment(current))} className="btn-primary mt-5">Execute Treasury Payment</button>
            {state.proposal?.paymentTx && <Field label="Payment transaction hash" value={hashPreview(state.proposal.paymentTx, 18)} mono className="mt-4" />}
          </article>
        </div>
      </section>

      <section id="dao-risk-audit" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={ShieldAlert} eyebrow="Warnings and audit" title="Detect malicious proposals and inspect governance events" description="A DAO can still be harmed by deceptive proposals, voter apathy, or concentrated token ownership. Governance needs review, quorum, and transparency." />
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-soft dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            <AlertTriangle className="mb-4" size={34} />
            <h3 className="text-2xl font-black">Malicious proposal warning</h3>
            <p className="mt-3 leading-8 font-bold">
              A proposal can look legitimate while routing funds to a hostile wallet, overpaying a vendor, or hiding risk in vague wording. Token holders must inspect recipient, amount, purpose, and execution conditions before voting.
            </p>
            <p className={`mt-5 rounded-lg p-4 font-black ${state.proposal?.malicious ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100" : "bg-white/60 text-amber-900 dark:bg-white/10 dark:text-amber-100"}`}>
              Current proposal: {state.proposal?.malicious ? "Flagged as suspicious" : "No malicious flag"}
            </p>
          </article>
          <EventLog events={state.events} />
        </div>
      </section>

      <section id="dao-quiz" className="section-wrap">
        <PhaseTitle icon={CheckCircle2} eyebrow="Case quiz and badge" title="Check DAO treasury governance understanding" description="Review treasury balance, voting power, quorum, pass/reject results, and safe payment execution." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <DaoQuiz />
          <article className="panel p-6">
            <BadgeCheck className="mb-4 text-cyanx" size={34} />
            <h3 className="text-3xl font-black">Completion badge</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">DAO Treasury Voting</p>
            <p className={`mt-5 rounded-lg p-4 font-black ${state.completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
              {state.completed ? "Badge earned: treasury payment executed through valid governance." : "Pass and execute a safe proposal to earn the case badge."}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function HolderCard({ holder, total, selected, onSelect }) {
  const percent = Math.round((holder.tokens / total) * 100);
  return (
    <button type="button" onClick={onSelect} className={`panel p-5 text-left transition hover:-translate-y-1 ${selected ? "border-cyanx" : ""}`}>
      <UsersRound className="mb-4 text-cyanx" size={28} />
      <h3 className="text-2xl font-black">{holder.name}</h3>
      <p className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400">{holder.wallet}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full bg-gradient-to-r from-bluex to-cyanx" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 font-black">{holder.tokens} GOV · {percent}% voting power</p>
    </button>
  );
}

function ProposalCard({ state, metrics }) {
  const proposal = state.proposal;
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Active proposal</h3>
      {proposal ? (
        <div className="mt-5 grid gap-3">
          <Field label="Title" value={proposal.title} />
          <Field label="Recipient" value={proposal.recipient} mono />
          <Field label="Amount" value={`$${proposal.amount.toLocaleString()}`} />
          <Field label="Status" value={proposal.status} />
          <Field label="Votes counted" value={`${metrics.participated}/${metrics.total} GOV`} />
          {proposal.malicious && <p className="rounded-lg bg-red-50 p-4 font-black text-red-700 dark:bg-red-500/15 dark:text-red-200">Warning: suspicious treasury drain proposal.</p>}
        </div>
      ) : (
        <p className="mt-5 rounded-lg bg-slate-50 p-5 font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">Create a proposal to begin voting.</p>
      )}
    </article>
  );
}

function VotingBars({ state, metrics }) {
  const votes = state.proposal?.votes ?? [];
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Live vote bars</h3>
      <VoteBar label="For" value={metrics.forPower} total={metrics.total} percent={metrics.forPercent} color="bg-emerald-500" />
      <VoteBar label="Against" value={metrics.againstPower} total={metrics.total} percent={metrics.againstPercent} color="bg-red-500" />
      <VoteBar label="Quorum" value={metrics.participated} total={metrics.quorumNeeded} percent={Math.min(100, Math.round((metrics.participated / metrics.quorumNeeded) * 100))} color="bg-cyanx" />
      <div className="mt-5 grid gap-2">
        {votes.length ? votes.map(vote => (
          <div key={vote.holderId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 font-bold dark:bg-white/5">
            <span>{vote.name}</span>
            <span className={vote.side === "for" ? "text-emerald-600" : "text-red-500"}>{vote.side.toUpperCase()} · {vote.power} GOV</span>
          </div>
        )) : <p className="rounded-lg bg-slate-50 p-4 font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">No votes cast yet.</p>}
      </div>
    </article>
  );
}

function VoteBar({ label, value, total, percent, color }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span>{value}/{total}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
    </div>
  );
}

function TreasuryFlow({ state, metrics }) {
  const active = state.proposal && metrics.passed && !state.proposal.malicious;
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Treasury payment flow</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <FlowNode label="Proposal" status={state.proposal?.status ?? "Not created"} active={Boolean(state.proposal)} />
        <FlowNode label="Token votes" status={`${metrics.participated} GOV`} active={metrics.participated > 0} />
        <FlowNode label="Quorum gate" status={metrics.quorumMet ? "Met" : "Waiting"} active={metrics.quorumMet} />
        <FlowNode label="Treasury payment" status={state.proposal?.executed ? "Executed" : active ? "Ready" : "Locked"} active={state.proposal?.executed || active} />
      </div>
      <div className="mt-6 rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-200">
        treasury.balance - proposal.amount = ${state.proposal?.executed ? state.treasury.balance.toLocaleString() : "locked until execution"}
      </div>
    </article>
  );
}

function FlowNode({ label, status, active }) {
  return (
    <div className={`relative rounded-lg border p-4 text-center ${active ? "border-cyanx bg-cyanx/10 text-cyanx" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5"}`}>
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-current/10">
        <CheckCircle2 size={24} />
      </div>
      <p className="font-black">{label}</p>
      <p className="mt-1 text-sm font-bold">{status}</p>
    </div>
  );
}

function EventLog({ events }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">DAO event log</h3>
      </div>
      <div className="max-h-96 overflow-auto p-4 font-mono text-sm">
        {events.map(item => (
          <div key={item.id} className="mb-3 text-slate-200">
            <span className="text-cyanx">[{item.time}]</span> <span className="text-emerald-300">{item.name}</span> {item.message}
          </div>
        ))}
      </div>
    </article>
  );
}

function DaoQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-dao-treasury-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = daoTreasuryCaseQuiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-dao-treasury-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${daoTreasuryCaseQuiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <h3 className="text-3xl font-black">Case score: {score}/{daoTreasuryCaseQuiz.length}</h3>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === daoTreasuryCaseQuiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function Status({ ok, label }) {
  return (
    <div className={`rounded-lg p-3 font-bold ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
      {label}
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

function Field({ label, value, mono, className = "" }) {
  return (
    <div className={`rounded-lg bg-slate-50 p-3 dark:bg-white/5 ${className}`}>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`${mono ? "font-mono text-xs" : ""} break-words font-black`}>{value}</p>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-5">
      <p className="text-sm font-black uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
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

function loadDaoState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-dao-treasury-case") || "null");
    return stored?.treasury ? stored : createDaoTreasuryState();
  } catch {
    return createDaoTreasuryState();
  }
}
