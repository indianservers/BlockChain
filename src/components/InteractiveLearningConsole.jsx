import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Blocks, CheckCircle2, Fingerprint, KeyRound, Pickaxe, RotateCcw, ShieldCheck, Vote } from "lucide-react";
import { addBlock, buildDefaultChain, createHash, hashPreview, repairChain, tamperBlock, validateChain } from "../utils/blockchainEngine.js";
import { createCandidateBlock, mineBatch, validateProof } from "../utils/miningEngine.js";

const storageKey = "bfv-interactive-console";

const labModes = [
  { id: "chain", label: "Build Chain", icon: Blocks },
  { id: "transaction", label: "Verify Tx", icon: KeyRound },
  { id: "mining", label: "Mine Nonce", icon: Pickaxe },
  { id: "consensus", label: "Vote", icon: Vote },
  { id: "security", label: "Security", icon: ShieldCheck }
];

const initialState = {
  activeMode: "chain",
  chain: buildDefaultChain(),
  transaction: { sender: "Alice", receiver: "Bob", amount: 8, signed: false, verified: false, status: "Draft" },
  miningBlock: createCandidateBlock({ data: "Console learner block" }),
  miningAttempts: 0,
  votes: ["approve", "approve", "pending", "pending", "pending", "pending", "pending"],
  securityAnswer: "",
  score: 0,
  feedback: "Choose a lab and complete the required action. This console is the operating surface."
};

export default function InteractiveLearningConsole() {
  const [state, setState] = useState(loadState);
  const validation = useMemo(() => validateChain(state.chain), [state.chain]);
  const proof = useMemo(() => validateProof(state.miningBlock, "Medium"), [state.miningBlock]);
  const currentMode = labModes.find(mode => mode.id === state.activeMode) ?? labModes[0];
  const securityCorrect = state.securityAnswer === "Risky";
  const voteMetrics = useMemo(() => {
    const approvals = state.votes.filter(vote => vote === "approve").length;
    const rejects = state.votes.filter(vote => vote === "reject").length;
    return { approvals, rejects, needed: 4, reached: approvals >= 4 };
  }, [state.votes]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  function patch(update) {
    setState(current => {
      const next = typeof update === "function" ? update(current) : { ...current, ...update };
      return next;
    });
  }

  function award(feedback) {
    patch(current => ({ ...current, score: current.score + 10, feedback }));
  }

  function reset() {
    setState(initialState);
    localStorage.setItem(storageKey, JSON.stringify(initialState));
  }

  function addConsoleBlock() {
    patch(current => ({
      ...current,
      chain: addBlock(current.chain, `Learner action ${current.chain.length}: ${new Date().toLocaleTimeString()}`),
      feedback: "New block added. Validate the chain to confirm every previous-hash link still matches."
    }));
  }

  function tamperConsoleBlock() {
    patch(current => ({
      ...current,
      chain: tamperBlock(current.chain, 1, `${current.chain[1].data} (changed)`),
      feedback: "Block 2 was changed. The validation engine should now detect a broken link."
    }));
  }

  function repairConsoleChain() {
    patch(current => ({ ...current, chain: repairChain(current.chain), feedback: "Chain repaired. Hash links were recalculated." }));
    award("Chain repair mission complete.");
  }

  function signTransaction() {
    const tx = { ...state.transaction, signed: true, status: "Signed", hash: createHash(JSON.stringify(state.transaction)) };
    patch({ ...state, transaction: tx, feedback: "Transaction signed. Now verify it before broadcast." });
  }

  function verifyTransaction() {
    if (!state.transaction.signed) {
      patch({ ...state, transaction: { ...state.transaction, status: "Rejected" }, feedback: "Verification failed: unsigned transactions cannot enter the mempool." });
      return;
    }
    patch({ ...state, transaction: { ...state.transaction, verified: true, status: "Verified" }, feedback: "Transaction verified and ready for mempool." });
    award("Transaction verification mission complete.");
  }

  function mineStep() {
    const result = mineBatch(state.miningBlock, "Medium", 90);
    patch(current => ({
      ...current,
      miningBlock: result.block,
      miningAttempts: current.miningAttempts + result.attempts,
      feedback: result.found ? "Valid proof found. The block can be added." : "Still searching. Nonce and hash changed."
    }));
    if (result.found) award("Mining mission complete.");
  }

  function castVote(index, vote) {
    patch(current => {
      const votes = current.votes.map((item, i) => i === index ? vote : item);
      const approvals = votes.filter(item => item === "approve").length;
      return {
        ...current,
        votes,
        feedback: approvals >= 4 ? "Consensus reached with 4 approvals." : "Vote recorded. Keep working toward threshold."
      };
    });
    if (index >= 0 && vote === "approve" && voteMetrics.approvals + 1 >= 4) award("Consensus mission complete.");
  }

  function answerSecurity(answer) {
    patch(current => ({
      ...current,
      securityAnswer: answer,
      feedback: answer === "Risky" ? "Correct. Unknown transactions can hide approvals or transfers." : "Not safe enough. Unknown transaction signing should be treated as risky."
    }));
    if (answer === "Risky") award("Security mission complete.");
  }

  return (
    <section id="interactive-lab-console" className="section-wrap bg-slate-950 text-white">
      <div className="mb-7 grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
            <CheckCircle2 size={17} /> Interactive Learning Tool
          </p>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">Operate the blockchain, do not just read it</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            This is a mission console: every tab has a required action, live state, feedback, and a score. The deeper modules below become reference labs after this operating surface.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ConsoleStat label="Mode" value={currentMode.label} />
          <ConsoleStat label="Score" value={state.score} />
          <ConsoleStat label="Chain health" value={`${validation.validBlocks}/${validation.totalBlocks}`} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[17rem_1fr_22rem]">
        <aside className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
          <div className="grid gap-2">
            {labModes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => patch({ ...state, activeMode: id })}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left font-black transition ${state.activeMode === id ? "bg-cyanx text-white" : "bg-white/5 text-slate-200 hover:bg-white/10"}`}
              >
                <Icon size={19} /> {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={reset} className="btn-secondary mt-4 w-full">
            <RotateCcw size={18} /> Reset Console
          </button>
        </aside>

        <motion.div key={state.activeMode} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
          {state.activeMode === "chain" && (
            <ChainLab chain={state.chain} validation={validation} onAdd={addConsoleBlock} onTamper={tamperConsoleBlock} onRepair={repairConsoleChain} />
          )}
          {state.activeMode === "transaction" && (
            <TransactionLab transaction={state.transaction} onSign={signTransaction} onVerify={verifyTransaction} />
          )}
          {state.activeMode === "mining" && (
            <MiningLab block={state.miningBlock} attempts={state.miningAttempts} proof={proof} onMine={mineStep} />
          )}
          {state.activeMode === "consensus" && (
            <ConsensusLab votes={state.votes} metrics={voteMetrics} onVote={castVote} />
          )}
          {state.activeMode === "security" && (
            <SecurityLab answer={state.securityAnswer} correct={securityCorrect} onAnswer={answerSecurity} />
          )}
        </motion.div>

        <aside className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
          <h3 className="text-2xl font-black">Live feedback</h3>
          <p className="mt-3 rounded-lg bg-slate-950/70 p-4 font-bold leading-7 text-slate-200">{state.feedback}</p>
          <div className="mt-5 grid gap-3">
            <ChecklistItem done={validation.invalidBlocks === 0} label="Chain can validate" />
            <ChecklistItem done={state.transaction.verified} label="Transaction verified" />
            <ChecklistItem done={proof.meetsTarget} label="Nonce meets difficulty" />
            <ChecklistItem done={voteMetrics.reached} label="Consensus threshold reached" />
            <ChecklistItem done={securityCorrect} label="Security risk identified" />
          </div>
        </aside>
      </div>
    </section>
  );
}

function ChainLab({ chain, validation, onAdd, onTamper, onRepair }) {
  return (
    <>
      <LabTitle icon={Blocks} title="Build and break a real chain" text="Add a block, tamper with Block 2, then repair the chain to restore valid links." />
      <div className="grid gap-3 md:grid-cols-3">
        {chain.map((block, index) => {
          const result = validation.results[index];
          return (
            <div key={`${block.index}-${block.hash}`} className={`rounded-lg border p-4 ${result.valid ? "border-emerald-400/40 bg-emerald-500/10" : "border-red-400/60 bg-red-500/15"}`}>
              <p className="font-black">Block {block.index}</p>
              <p className="mt-2 h-12 text-sm font-bold text-slate-300">{block.data}</p>
              <p className="mt-3 break-all font-mono text-xs text-cyanx">{hashPreview(block.hash, 12)}</p>
              <span className={`mt-3 inline-flex rounded-full px-2 py-1 text-xs font-black ${result.valid ? "bg-emerald-200 text-emerald-900" : "bg-red-200 text-red-900"}`}>{result.valid ? "Valid" : "Broken"}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onAdd} className="btn-primary">Add Block</button>
        <button type="button" onClick={onTamper} className="btn-secondary">Tamper Block 2</button>
        <button type="button" onClick={onRepair} className="btn-secondary">Repair Chain</button>
      </div>
    </>
  );
}

function TransactionLab({ transaction, onSign, onVerify }) {
  return (
    <>
      <LabTitle icon={KeyRound} title="Sign and verify a transaction" text="A transaction must be signed before validators accept it." />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Sender" value={transaction.sender} />
        <Field label="Receiver" value={transaction.receiver} />
        <Field label="Amount" value={`${transaction.amount} LRN`} />
        <Field label="Status" value={transaction.status} />
        <Field label="Hash" value={transaction.hash ? hashPreview(transaction.hash, 16) : "Unsigned"} mono wide />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onSign} className="btn-primary">Sign Transaction</button>
        <button type="button" onClick={onVerify} className="btn-secondary">Verify Transaction</button>
      </div>
    </>
  );
}

function MiningLab({ block, attempts, proof, onMine }) {
  return (
    <>
      <LabTitle icon={Pickaxe} title="Mine a valid nonce" text="Run controlled mining batches until the hash starts with the target prefix." />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nonce" value={block.nonce} />
        <Field label="Attempts" value={attempts} />
        <Field label="Target" value={proof.target} mono />
        <Field label="Current hash" value={hashPreview(block.hash, 18)} mono wide />
      </div>
      <button type="button" onClick={onMine} className="btn-primary mt-5">Try Mining Batch</button>
    </>
  );
}

function ConsensusLab({ votes, metrics, onVote }) {
  return (
    <>
      <LabTitle icon={Vote} title="Reach consensus" text="At least four of seven nodes must approve the block." />
      <div className="mb-5 h-4 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-gradient-to-r from-bluex to-cyanx transition-all" style={{ width: `${Math.min(100, (metrics.approvals / metrics.needed) * 100)}%` }} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {votes.map((vote, index) => (
          <div key={index} className="rounded-lg bg-slate-950/60 p-3">
            <p className="font-black">Node {index + 1}</p>
            <p className="mt-1 text-sm font-bold text-slate-300">{vote}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => onVote(index, "approve")} className="rounded bg-emerald-500 px-2 py-1 text-xs font-black text-white">Approve</button>
              <button type="button" onClick={() => onVote(index, "reject")} className="rounded bg-red-500 px-2 py-1 text-xs font-black text-white">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SecurityLab({ answer, correct, onAnswer }) {
  return (
    <>
      <LabTitle icon={ShieldCheck} title="Decide if signing is safe" text="Scenario: your wallet shows an unknown transaction from an unfamiliar website." />
      <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-5 text-amber-100">
        <AlertTriangle className="mb-3" size={28} />
        <h3 className="text-2xl font-black">Sign unknown transaction?</h3>
        <p className="mt-2 font-bold">Choose the correct safety decision before continuing.</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {["Safe", "Risky", "Investigate"].map(choice => (
          <button key={choice} type="button" onClick={() => onAnswer(choice)} className={answer === choice ? "btn-primary" : "btn-secondary"}>{choice}</button>
        ))}
      </div>
      {answer && <p className={`mt-4 rounded-lg p-4 font-black ${correct ? "bg-emerald-500/15 text-emerald-100" : "bg-red-500/15 text-red-100"}`}>{correct ? "Correct. Unknown transaction signing is risky." : "Not quite. Treat unknown signing requests as risky."}</p>}
    </>
  );
}

function LabTitle({ icon: Icon, title, text }) {
  return (
    <div className="mb-5">
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-cyanx"><Icon size={17} /> Active lab</p>
      <h3 className="text-3xl font-black">{title}</h3>
      <p className="mt-2 leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function Field({ label, value, mono, wide }) {
  return (
    <div className={`rounded-lg bg-slate-950/60 p-3 ${wide ? "md:col-span-2" : ""}`}>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`${mono ? "font-mono text-xs" : ""} break-words font-black text-white`}>{value}</p>
    </div>
  );
}

function ChecklistItem({ done, label }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg p-3 font-bold ${done ? "bg-emerald-500/15 text-emerald-100" : "bg-slate-950/60 text-slate-300"}`}>
      <CheckCircle2 size={18} className={done ? "text-emerald-300" : "text-slate-500"} />
      {label}
    </div>
  );
}

function ConsoleStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <p className="text-sm font-black uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    return stored?.chain ? stored : initialState;
  } catch {
    return initialState;
  }
}
