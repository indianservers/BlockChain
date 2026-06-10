import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileCode2 } from "lucide-react";
import EventLogTerminal, { createLogEvent } from "../common/EventLogTerminal.jsx";
import ContractActionPanel from "./ContractActionPanel.jsx";

const states = ["Created", "Funded", "Delivered", "Confirmed", "Completed"];
const stateKey = "bfv-contract-machine-state";
const logKey = "bfv-contract-machine-events";

export default function SmartContractStateMachine() {
  const [contract, setContract] = useState(loadContract);
  const [events, setEvents] = useState(loadEvents);
  const activeIndex = states.indexOf(contract.state);

  useEffect(() => localStorage.setItem(stateKey, JSON.stringify(contract)), [contract]);
  useEffect(() => localStorage.setItem(logKey, JSON.stringify(events)), [events]);

  function log(name, details, status = "Success") {
    setEvents(current => [createLogEvent(name, details, status), ...current].slice(0, 50));
  }

  function invalid(reason) {
    log("InvalidActionRejected", reason, "Rejected");
  }

  function run(action) {
    if (action === "deploy") {
      setContract(defaultContract());
      log("ContractDeployed", "Escrow contract deployed and ready.");
      return;
    }
    const transitions = {
      deposit: ["Created", "Funded", "Buyer deposited 25 tokens into escrow."],
      deliver: ["Funded", "Delivered", "Seller marked delivery complete."],
      confirm: ["Delivered", "Confirmed", "Buyer confirmed delivery."],
      release: ["Confirmed", "Completed", "Payment released to seller."]
    };
    const [required, nextState, message] = transitions[action];
    if (contract.state !== required) {
      invalid(`${action} requires ${required} state. Current state is ${contract.state}.`);
      return;
    }
    setContract(current => ({
      ...current,
      state: nextState,
      contractBalance: action === "deposit" ? 25 : action === "release" ? 0 : current.contractBalance,
      buyerBalance: action === "deposit" ? current.buyerBalance - 25 : current.buyerBalance,
      sellerBalance: action === "release" ? current.sellerBalance + 25 : current.sellerBalance
    }));
    log(action === "release" ? "PaymentReleased" : "ContractStateChanged", message);
  }

  function reset() {
    setContract(defaultContract());
    setEvents([createLogEvent("ContractDeployed", "Escrow contract reset to Created state.")]);
  }

  return (
    <section id="smart-contract-state-machine" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <FileCode2 size={17} /> Smart Contract State Machine
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Escrow state changes only when valid actions are called</h2>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <article className="panel p-5">
          <div className="grid gap-3">
            {states.map((state, index) => (
              <motion.div
                key={state}
                layout
                className={`flex items-center gap-3 rounded-lg border p-4 font-black ${index === activeIndex ? "border-cyanx bg-cyanx/10 text-cyanx ring-4 ring-cyanx/15" : index < activeIndex ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5"}`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-950 dark:bg-slate-950 dark:text-white">{index + 1}</span>
                {state}
              </motion.div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Balance label="Buyer" value={contract.buyerBalance} />
            <Balance label="Contract" value={contract.contractBalance} />
            <Balance label="Seller" value={contract.sellerBalance} />
          </div>
        </article>
        <div className="grid gap-5">
          <ContractActionPanel onAction={run} onInvalid={() => invalid("Manual invalid action rejected by contract rules.")} onReset={reset} />
          <EventLogTerminal title="Contract event terminal" events={events} />
        </div>
      </div>
    </section>
  );
}

function Balance({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">tokens</p>
    </div>
  );
}

function defaultContract() {
  return { state: "Created", buyerBalance: 50, sellerBalance: 0, contractBalance: 0 };
}

function loadContract() {
  try {
    return JSON.parse(localStorage.getItem(stateKey) || "null") ?? defaultContract();
  } catch {
    return defaultContract();
  }
}

function loadEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(logKey) || "null");
    return Array.isArray(stored) ? stored : [createLogEvent("ContractDeployed", "Escrow contract demo initialized.")];
  } catch {
    return [createLogEvent("ContractDeployed", "Escrow contract demo initialized.")];
  }
}
