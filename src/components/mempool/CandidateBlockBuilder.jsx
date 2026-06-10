import { Blocks, Plus } from "lucide-react";

export default function CandidateBlockBuilder({ selectedTransactions, onBuildBlock }) {
  const totalFees = selectedTransactions.reduce((sum, tx) => sum + tx.fee, 0);
  const totalAmount = selectedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <article className="panel p-5">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-cyanx">
        <Blocks size={17} /> Candidate block
      </p>
      <h3 className="text-2xl font-black">{selectedTransactions.length} selected transactions</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="Total fees" value={totalFees.toFixed(3)} />
        <Metric label="Total amount" value={totalAmount.toFixed(2)} />
      </div>
      <div className="mt-4 grid gap-2">
        {selectedTransactions.length ? selectedTransactions.map(tx => (
          <div key={tx.id} className="rounded-lg bg-slate-50 p-3 font-mono text-xs font-black dark:bg-white/5">{tx.id} · fee {tx.fee}</div>
        )) : <p className="rounded-lg bg-slate-50 p-4 font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">Miner has not selected transactions yet.</p>}
      </div>
      <button type="button" onClick={onBuildBlock} disabled={!selectedTransactions.length} className="btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-45">
        <Plus size={18} /> Move Into Candidate Block
      </button>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
