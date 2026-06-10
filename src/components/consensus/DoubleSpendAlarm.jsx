import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import EventLogTerminal, { createLogEvent } from "../common/EventLogTerminal.jsx";

const completeKey = "bfv-double-spend-demo-complete";
const logKey = "bfv-double-spend-events";

export default function DoubleSpendAlarm() {
  const [confirmed, setConfirmed] = useState("");
  const [events, setEvents] = useState(loadEvents);
  const balances = confirmed === "Bob"
    ? { Alice: 0, Bob: 10, Charlie: 0 }
    : confirmed === "Charlie"
      ? { Alice: 0, Bob: 0, Charlie: 10 }
      : { Alice: 10, Bob: 0, Charlie: 0 };

  useEffect(() => localStorage.setItem(logKey, JSON.stringify(events)), [events]);

  function log(name, details, status = "Success") {
    setEvents(current => [createLogEvent(name, details, status), ...current].slice(0, 40));
  }

  function confirm(receiver) {
    if (!confirmed) {
      setConfirmed(receiver);
      localStorage.setItem(completeKey, "true");
      log("TransactionSigned", `Alice signed payment of 10 tokens to ${receiver}.`);
      log("TransactionBroadcasted", `Transaction to ${receiver} broadcast to validators.`);
      log("BlockMined", `Transaction to ${receiver} confirmed first.`);
      return;
    }
    log("DoubleSpendRejected", `Alice already spent the same 10 tokens to ${confirmed}. Conflict to ${receiver} rejected.`, "Rejected");
  }

  return (
    <section id="double-spend-alarm" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <AlertTriangle size={17} /> Double-Spend Alarm
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Conflicting payments cannot both be accepted</h2>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <article className="panel p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <TxCard receiver="Bob" confirmed={confirmed} onConfirm={confirm} />
            <TxCard receiver="Charlie" confirmed={confirmed} onConfirm={confirm} />
          </div>
          {confirmed && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-lg bg-red-50 p-5 text-red-800 dark:bg-red-500/15 dark:text-red-100">
              <h3 className="inline-flex items-center gap-2 text-2xl font-black"><AlertTriangle size={24} /> Conflict alert</h3>
              <p className="mt-2 font-bold">The first confirmed transaction spends Alice's full 10 tokens. The conflicting second spend is rejected.</p>
            </motion.div>
          )}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {Object.entries(balances).map(([name, value]) => <Balance key={name} name={name} value={value} />)}
          </div>
          <p className="mt-5 rounded-lg bg-cyanx/10 p-4 font-black text-cyanx">
            Validation reason: available balance is checked against already confirmed history.
          </p>
        </article>
        <EventLogTerminal title="Double-spend event terminal" events={events} />
      </div>
    </section>
  );
}

function TxCard({ receiver, confirmed, onConfirm }) {
  const accepted = confirmed === receiver;
  const rejected = confirmed && confirmed !== receiver;
  return (
    <article className={`rounded-lg border p-5 ${accepted ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100" : rejected ? "border-red-300 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-100" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
      <h3 className="text-2xl font-black">Alice {"->"} {receiver}</h3>
      <p className="mt-2 font-bold">Amount: 10 tokens</p>
      <p className="mt-1 font-bold">Status: {accepted ? "Accepted" : rejected ? "Rejected conflict" : "Pending"}</p>
      <button type="button" onClick={() => onConfirm(receiver)} className="btn-primary mt-5">
        <ShieldCheck size={18} /> Confirm This Tx
      </button>
    </article>
  );
}

function Balance({ name, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{name}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(logKey) || "[]");
  } catch {
    return [];
  }
}
