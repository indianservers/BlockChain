import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Hash, Landmark, ReceiptText, WalletCards } from "lucide-react";
import { createHash, hashPreview } from "../../utils/blockchainEngine.js";
import JourneyStageCard from "./JourneyStageCard.jsx";
import TransactionPacket from "./TransactionPacket.jsx";

const stages = [
  {
    title: "Sender Wallet",
    status: "Created",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
    explanation: "The sender wallet prepares to authorize a value transfer.",
    detail: "A wallet controls keys. It does not store coins inside itself; it signs instructions that update ledger state."
  },
  {
    title: "Transaction Created",
    status: "Created",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
    explanation: "Sender, receiver, amount, fee, and timestamp become a transaction draft.",
    detail: "At this point the transaction is only prepared. It still needs a valid signature."
  },
  {
    title: "Digital Signature",
    status: "Signed",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    explanation: "The sender signs the transaction with private-key authority.",
    detail: "Nodes can verify the signature without seeing the private key."
  },
  {
    title: "Broadcast to Network",
    status: "Broadcasted",
    badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200",
    explanation: "The signed transaction is shared with network nodes.",
    detail: "Broadcast means the network has heard about the transaction; it is not final yet."
  },
  {
    title: "Mempool",
    status: "Pending",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100",
    explanation: "The transaction waits in the pending pool.",
    detail: "Miners or validators often prioritize transactions with better fees or valid policy rules."
  },
  {
    title: "Miner/Validator",
    status: "Pending",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100",
    explanation: "A miner or validator selects the transaction for a candidate block.",
    detail: "The participant checks signatures, balances, and protocol rules before inclusion."
  },
  {
    title: "Block",
    status: "Included",
    badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200",
    explanation: "The transaction is bundled into a block with other transactions.",
    detail: "Inclusion gives the transaction a position in blockchain history."
  },
  {
    title: "Confirmations",
    status: "Confirmed",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    explanation: "More blocks build after this block, increasing confidence.",
    detail: "Confirmations reduce the chance that a competing chain replaces the transaction's block."
  },
  {
    title: "Receiver Ledger Updated",
    status: "Confirmed",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    explanation: "The receiver's balance reflects the accepted transaction.",
    detail: "Every node independently reaches the same updated ledger state."
  }
];

export default function TransactionJourneyTracker() {
  const [currentStage, setCurrentStage] = useState(() => Number(localStorage.getItem("bfv-tx-journey-stage") || 0));
  const [completedStages, setCompletedStages] = useState(() => JSON.parse(localStorage.getItem("bfv-tx-journey-complete") || "[0]"));
  const tx = useMemo(createTransaction, []);
  const progress = stages.length === 1 ? 0 : (currentStage / (stages.length - 1)) * 92;
  const stage = stages[currentStage];

  useEffect(() => {
    const next = Array.from(new Set([...completedStages, currentStage])).sort((a, b) => a - b);
    setCompletedStages(next);
    localStorage.setItem("bfv-tx-journey-stage", String(currentStage));
    localStorage.setItem("bfv-tx-journey-complete", JSON.stringify(next));
  }, [currentStage]);

  return (
    <section id="transaction-journey" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <ReceiptText size={17} /> Transaction Journey Tracker
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Follow one transaction from wallet to confirmed ledger</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Click any point or move through the flow to see how a transaction goes from creation to confirmation.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <article className="panel p-5">
          <div className="relative mb-6 h-20 rounded-lg border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
            <div className="absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="absolute left-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-bluex to-cyanx" style={{ width: `${progress}%` }} />
            <TransactionPacket progress={Math.min(92, Math.max(0, progress))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stages.map((item, index) => (
              <JourneyStageCard
                key={item.title}
                stage={item}
                index={index}
                active={index === currentStage}
                complete={completedStages.includes(index)}
                onSelect={setCurrentStage}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => setCurrentStage(stageIndex => Math.max(0, stageIndex - 1))} className="btn-secondary">Previous</button>
            <button type="button" onClick={() => setCurrentStage(stageIndex => Math.min(stages.length - 1, stageIndex + 1))} className="btn-primary">Next</button>
          </div>
        </article>

        <div className="grid gap-5">
          <AnimatePresence mode="wait">
            <motion.article key={stage.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="panel p-5">
              <p className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${stage.badgeClass}`}>{stage.status}</p>
              <h3 className="text-3xl font-black">{stage.title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{stage.explanation}</p>
              <p className="mt-4 rounded-lg bg-cyanx/10 p-4 font-bold text-cyanx">{stage.detail}</p>
            </motion.article>
          </AnimatePresence>

          <article className="panel p-5">
            <h3 className="mb-4 text-2xl font-black">Simulated transaction</h3>
            <div className="grid gap-3">
              <Field icon={Hash} label="Transaction ID" value={hashPreview(tx.id, 18)} mono />
              <Field icon={WalletCards} label="Sender" value={tx.sender} mono />
              <Field icon={Landmark} label="Receiver" value={tx.receiver} mono />
              <Field icon={ReceiptText} label="Amount" value={`${tx.amount} LRN`} />
              <Field icon={ReceiptText} label="Fee" value={`${tx.fee} LRN`} />
              <Field icon={Clock} label="Timestamp" value={tx.timestamp} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Field({ icon: Icon, label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
      <p className="mb-1 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Icon size={14} /> {label}
      </p>
      <p className={`${mono ? "font-mono text-xs" : ""} break-words font-black`}>{value}</p>
    </div>
  );
}

function createTransaction() {
  const timestamp = new Date().toLocaleString();
  const tx = {
    sender: "0xALICE8842",
    receiver: "0xBOB5571",
    amount: 12.5,
    fee: 0.035,
    timestamp
  };
  return {
    ...tx,
    id: createHash(`${tx.sender}|${tx.receiver}|${tx.amount}|${tx.fee}|${timestamp}`)
  };
}
