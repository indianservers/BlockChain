import { useEffect, useMemo, useState } from "react";
import { Filter, ListFilter, PackageCheck } from "lucide-react";
import CandidateBlockBuilder from "./CandidateBlockBuilder.jsx";
import TransactionQueueCard from "./TransactionQueueCard.jsx";

const mempoolKey = "bfv-mempool-state";

export default function MempoolWaitingRoom() {
  const [state, setState] = useState(loadMempoolState);
  const [sortBy, setSortBy] = useState("fee");
  const [filter, setFilter] = useState("all");
  const selected = state.transactions.filter(tx => state.selectedIds.includes(tx.id));
  const visible = useMemo(() => sortAndFilter(state.transactions, sortBy, filter), [state.transactions, sortBy, filter]);

  useEffect(() => {
    localStorage.setItem(mempoolKey, JSON.stringify(state));
  }, [state]);

  function toggle(id) {
    setState(current => {
      const tx = current.transactions.find(item => item.id === id);
      if (!tx?.valid) return current;
      const selectedIds = current.selectedIds.includes(id)
        ? current.selectedIds.filter(item => item !== id)
        : [...current.selectedIds, id];
      return { ...current, selectedIds };
    });
  }

  function buildBlock() {
    if (!selected.length) return;
    setState(current => ({
      transactions: current.transactions.filter(tx => !current.selectedIds.includes(tx.id)),
      selectedIds: [],
      blockTransactions: selected
    }));
  }

  return (
    <section id="mempool-waiting-room" className="section-wrap">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <PackageCheck size={17} /> Mempool Waiting Room
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Prioritize pending transactions before block inclusion</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Sort and filter pending transactions, then select valid transactions for a candidate block.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <article className="panel p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400"><ListFilter size={15} /> Sort</span>
              <select value={sortBy} onChange={event => setSortBy(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-bold dark:border-white/10 dark:bg-slate-900">
                <option value="fee">Fee high to low</option>
                <option value="oldest">Oldest first</option>
                <option value="amount">Amount high to low</option>
              </select>
            </label>
            <label>
              <span className="mb-1 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400"><Filter size={15} /> Filter</span>
              <select value={filter} onChange={event => setFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-bold dark:border-white/10 dark:bg-slate-900">
                <option value="all">All transactions</option>
                <option value="valid">Valid only</option>
                <option value="invalid">Invalid</option>
                <option value="highFee">High fee</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {visible.map(tx => <TransactionQueueCard key={tx.id} transaction={tx} selected={state.selectedIds.includes(tx.id)} onSelect={toggle} />)}
          </div>
        </article>

        <div className="grid content-start gap-5">
          <CandidateBlockBuilder selectedTransactions={selected} onBuildBlock={buildBlock} />
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Latest candidate block</h3>
            <div className="mt-4 grid gap-2">
              {state.blockTransactions.length ? state.blockTransactions.map(tx => (
                <div key={tx.id} className="rounded-lg bg-emerald-50 p-3 font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100">
                  {tx.id} included with fee {tx.fee}
                </div>
              )) : <p className="rounded-lg bg-slate-50 p-4 font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">No candidate block built yet.</p>}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function sortAndFilter(transactions, sortBy, filter) {
  return transactions
    .filter(tx => filter === "all" || (filter === "valid" && tx.valid) || (filter === "invalid" && !tx.valid) || (filter === "highFee" && tx.fee >= 0.08))
    .sort((a, b) => {
      if (sortBy === "oldest") return b.age - a.age;
      if (sortBy === "amount") return b.amount - a.amount;
      return b.fee - a.fee;
    });
}

function loadMempoolState() {
  try {
    const stored = JSON.parse(localStorage.getItem(mempoolKey) || "null");
    if (stored?.transactions?.length) return stored;
  } catch {
    // fall through to default data
  }
  return {
    selectedIds: [],
    blockTransactions: [],
    transactions: [
      tx("TX-901", "Alice", "Bob", 14.2, 0.12, 72, true),
      tx("TX-724", "Chen", "Dia", 5.5, 0.04, 180, true),
      tx("TX-118", "Fake", "Merchant", 90, 0.2, 40, false),
      tx("TX-447", "Nisha", "Arjun", 22, 0.09, 120, true),
      tx("TX-336", "Mina", "DAO", 8, 0.025, 250, true),
      tx("TX-502", "Evan", "Lab", 42, 0.07, 95, false)
    ]
  };
}

function tx(id, sender, receiver, amount, fee, age, valid) {
  return { id, sender, receiver, amount, fee, age, valid };
}
