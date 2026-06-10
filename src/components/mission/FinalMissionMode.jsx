import { useEffect, useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import EventLogTerminal, { createLogEvent } from "../common/EventLogTerminal.jsx";
import CompletionBadge from "./CompletionBadge.jsx";
import MissionProgress from "./MissionProgress.jsx";
import MissionStepCard from "./MissionStepCard.jsx";

const key = "bfv-final-mission-mode";
const logKey = "bfv-final-mission-events";

const steps = [
  ["Generate wallet", "Create a learner wallet and secure its keys."],
  ["Create transaction", "Prepare sender, receiver, amount, and fee."],
  ["Sign transaction", "Authorize the transaction with the wallet key."],
  ["Broadcast transaction", "Send the signed transaction to network nodes."],
  ["Validate transaction", "Check signature, balance, and fields."],
  ["Add to mempool", "Move the valid transaction into the waiting room."],
  ["Mine or validate block", "Package the transaction into a valid block."],
  ["Reach consensus", "Have enough nodes accept the block."],
  ["Update ledger", "Apply the block to all honest ledger copies."],
  ["Execute smart contract action", "Run a valid contract state transition."],
  ["Mint or transfer NFT", "Create or transfer a unique token record."],
  ["Complete security challenge", "Classify a wallet safety scenario correctly."]
].map(([title, instruction], id) => ({ id, title, instruction }));

export default function FinalMissionMode() {
  const [state, setState] = useState(loadState);
  const [events, setEvents] = useState(loadEvents);
  const current = state.completed.length;
  const complete = state.completed.length === steps.length;
  const score = Math.max(0, 100 - state.mistakes * 5);

  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [state]);
  useEffect(() => localStorage.setItem(logKey, JSON.stringify(events)), [events]);

  function log(name, details, status = "Success") {
    setEvents(currentEvents => [createLogEvent(name, details, status), ...currentEvents].slice(0, 60));
  }

  function runStep(index) {
    if (index !== current) {
      setState(s => ({ ...s, mistakes: s.mistakes + 1 }));
      log("InvalidActionRejected", `Mission step ${index + 1} is locked. Complete step ${current + 1} first.`, "Rejected");
      return;
    }
    const eventNames = ["WalletGenerated", "TransactionCreated", "TransactionSigned", "TransactionBroadcasted", "TransactionValidated", "MempoolAdded", "BlockMined", "ConsensusVoteCast", "LedgerUpdated", "ContractDeployed", "NFTTransferred", "SecurityChallengeCompleted"];
    setState(s => {
      const completed = [...s.completed, index];
      const badge = completed.length === steps.length;
      if (badge) localStorage.setItem("bfv-final-badge", "Complete Blockchain Practitioner");
      return { ...s, completed, badge };
    });
    log(eventNames[index] ?? "MissionStepCompleted", `${steps[index].title} completed.`);
  }

  function retry() {
    setState({ completed: [], mistakes: 0, badge: false });
    setEvents([createLogEvent("MissionReset", "Final mission restarted.")]);
    localStorage.removeItem("bfv-final-badge");
  }

  return (
    <section id="final-mission-mode" className="section-wrap bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.2),transparent_30rem),linear-gradient(135deg,#020617,#0f172a_48%,#042f2e)] text-white">
      <div className="mb-7 max-w-4xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <GraduationCap size={17} /> Final Mission Mode
        </p>
        <h2 className="text-4xl font-black tracking-tight md:text-6xl">Complete Blockchain Mission</h2>
        <p className="mt-5 text-lg leading-8 text-slate-300">A locked, guided challenge that combines wallets, transactions, mempool, mining, consensus, smart contracts, NFTs, and security.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <MissionStepCard key={step.title} step={step} index={index} active={index === current} complete={state.completed.includes(index)} locked={index > current} onRun={() => runStep(index)} />
          ))}
        </div>
        <div className="grid content-start gap-5 text-slate-950 dark:text-white">
          <MissionProgress complete={state.completed.length} total={steps.length} />
          <CompletionBadge unlocked={complete || state.badge} score={score} mistakes={state.mistakes} onRetry={retry} />
          <EventLogTerminal title="Final mission event terminal" events={events} />
        </div>
      </div>
    </section>
  );
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? { completed: [], mistakes: 0, badge: false };
  } catch {
    return { completed: [], mistakes: 0, badge: false };
  }
}

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(logKey) || "[]");
  } catch {
    return [];
  }
}
