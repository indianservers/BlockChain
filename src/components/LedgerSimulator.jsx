import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, RotateCcw } from "lucide-react";

export default function LedgerSimulator() {
  const [records, setRecords] = useState(["Genesis record"]);
  const [message, setMessage] = useState("Every node starts with the same ledger copy.");

  function addRecord() {
    setRecords(current => {
      const next = [...current, `Record ${current.length}: verified transaction ${String(current.length).padStart(2, "0")}`];
      localStorage.setItem("bfv-ledger-records", JSON.stringify(next));
      return next;
    });
    setMessage("Every participant receives the updated ledger copy.");
  }

  function resetRecords() {
    setRecords(["Genesis record"]);
    localStorage.removeItem("bfv-ledger-records");
    setMessage("Every node starts with the same ledger copy.");
  }

  return (
    <section id="ledger" className="section-wrap">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">Distributed ledger simulator</p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Add one record and watch five ledgers update</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">A distributed ledger means each participant keeps a synchronized copy of the shared record history.</p>
      </div>
      <div className="panel p-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={addRecord} className="btn-primary">
            <Plus size={18} /> Add Record
          </button>
          <button type="button" onClick={resetRecords} className="btn-secondary">
            <RotateCcw size={18} /> Reset
          </button>
          <p className="font-bold text-slate-600 dark:text-slate-300" aria-live="polite">{message}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <article key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-3 flex items-center justify-between font-black">
                Node {index + 1}
                <span className="text-xs text-cyanx">copy</span>
              </h3>
              <ul className="grid gap-2">
                {records.map((record, recordIndex) => (
                  <motion.li key={`${record}-${recordIndex}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-200 bg-white p-2 text-sm font-bold dark:border-white/10 dark:bg-slate-900">
                    {record}
                  </motion.li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
