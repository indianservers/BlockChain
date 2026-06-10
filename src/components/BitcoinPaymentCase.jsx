import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Bitcoin, CheckCircle2, Hammer, Radio, RefreshCw, Send, ShieldCheck, WalletCards } from "lucide-react";
import { bitcoinCaseQuiz } from "../data/bitcoinCase.js";
import { addConfirmation, attemptDoubleSpend, broadcastTransaction, createBitcoinCaseState, createBtcTransaction, feeLevels, mineBitcoinBlock, minerSelectTransactions } from "../utils/bitcoinCaseEngine.js";

export default function BitcoinPaymentCase() {
  const [state, setState] = useState(() => loadCaseState());
  const [amount, setAmount] = useState(0.015);
  const [feeLevel, setFeeLevel] = useState("Standard");
  const selected = useMemo(() => minerSelectTransactions(state).selected, [state]);

  useEffect(() => {
    localStorage.setItem("bfv-bitcoin-case", JSON.stringify(state));
  }, [state]);

  return (
    <>
      <section id="bitcoin-case" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Bitcoin size={17} /> Case Study
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Bitcoin Payment Network</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Follow a BTC-style payment from wallet creation to transaction broadcast, mempool priority, mining, confirmations, double-spend defense, and final settlement.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Payment status" value={state.transaction?.status ?? "Draft"} />
            <HeroStat label="Confirmations" value={state.confirmations} />
            <HeroStat label="Mempool txs" value={state.mempool.length} />
            <HeroStat label="Badge" value={state.completed ? "Earned" : "Pending"} />
          </div>
        </div>
      </section>

      <section id="btc-wallets" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={WalletCards} eyebrow="Buyer and merchant wallets" title="A payment starts with two Bitcoin-style addresses" description="The buyer signs and broadcasts a transaction. The merchant waits for confirmations before treating payment as final." />
        <div className="grid gap-5 md:grid-cols-2">
          <WalletCard wallet={state.buyer} />
          <WalletCard wallet={state.merchant} />
        </div>
      </section>

      <section id="btc-transaction" className="section-wrap">
        <PhaseTitle icon={Send} eyebrow="Create BTC-style transaction" title="Choose amount and fee priority" description="Higher fee rate improves miner priority because miners collect transaction fees." />
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <label>
                <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount BTC</span>
                <input type="number" value={amount} onChange={event => setAmount(Number(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee priority</span>
                <select value={feeLevel} onChange={event => setFeeLevel(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5">
                  {Object.keys(feeLevels).map(level => <option key={level}>{level}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => createBtcTransaction(current, amount, feeLevel))} className="btn-primary">Create Transaction</button>
              <button type="button" onClick={() => setState(current => broadcastTransaction(current))} className="btn-secondary"><Radio size={18} /> Broadcast</button>
              <button type="button" onClick={() => setState(createBitcoinCaseState())} className="btn-secondary"><RefreshCw size={18} /> Reset</button>
            </div>
          </article>
          <TransactionPanel transaction={state.transaction} />
        </div>
      </section>

      <section id="btc-mempool-mining" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Hammer} eyebrow="Mempool and mining" title="Miner selects high-fee transactions first" description="The mempool is sorted by fee rate. The miner picks top-priority transactions for the next block." />
        <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
          <MempoolView mempool={state.mempool} selected={selected} />
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Proof-of-work mining simulation</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Mining packages selected transactions into a block. This simplified simulation shows the result instantly.</p>
            <button type="button" onClick={() => setState(current => mineBitcoinBlock(current))} className="btn-primary mt-5"><Hammer size={18} /> Mine Next Block</button>
            {state.minedBlock && (
              <div className="mt-5 rounded-lg bg-slate-50 p-4 dark:bg-white/5">
                <p className="font-black">Block #{state.minedBlock.height}</p>
                <p className="font-mono text-sm font-bold text-cyanx">{state.minedBlock.hash.slice(0, 28)}...</p>
                <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">{state.minedBlock.transactions.length} transaction(s) included</p>
              </div>
            )}
          </article>
        </div>
      </section>

      <section id="btc-confirmations" className="section-wrap">
        <PhaseTitle icon={BadgeCheck} eyebrow="Confirmations and settlement" title="1, 3, and 6 confirmations reduce reversal risk" description="Each new block built after the payment makes the transaction harder to replace." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <div className="grid gap-3 md:grid-cols-3">
              {[1, 3, 6].map(target => (
                <div key={target} className={`rounded-lg border p-5 text-center ${state.confirmations >= target ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5"}`}>
                  <p className="text-4xl font-black">{target}</p>
                  <p className="font-black">confirmation{target > 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setState(current => addConfirmation(current))} className="btn-primary mt-5">Add Confirmation</button>
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Final settlement explanation</h3>
            <p className="mt-3 leading-8 text-slate-600 dark:text-slate-300">
              At one confirmation, the payment is included in a block. At three confirmations, confidence is stronger. At six confirmations, many merchants treat the payment as final settlement because replacing that history would require significant proof-of-work.
            </p>
            {state.completed && <p className="mt-5 rounded-lg bg-emerald-50 p-4 font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">Bitcoin Payment Network badge earned.</p>}
          </article>
        </div>
      </section>

      <section id="btc-double-spend" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={ShieldCheck} eyebrow="Double-spend attempt" title="Try to spend the same BTC twice" description="Before confirmation, conflicting transactions can be detected. After confirmation, the original transaction becomes harder to replace." />
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="panel p-5">
            <button type="button" onClick={() => setState(current => attemptDoubleSpend(current))} className="btn-primary"><AlertTriangle size={18} /> Attempt Double Spend</button>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">The demo creates a conflicting payment from the same buyer funds to a different address.</p>
          </article>
          {state.doubleSpend ? <TransactionPanel transaction={state.doubleSpend} /> : <Empty text="No double-spend attempt yet." />}
        </div>
      </section>

      <section id="btc-case-quiz" className="section-wrap">
        <PhaseTitle icon={CheckCircle2} eyebrow="Case quiz and completion badge" title="Check your Bitcoin payment network understanding" description="Complete the quiz after running the payment flow." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <BitcoinCaseQuiz />
          <EventConsole events={state.events} />
        </div>
      </section>
    </>
  );
}

function WalletCard({ wallet }) {
  return (
    <article className="panel p-5">
      <WalletCards className="mb-4 text-cyanx" size={28} />
      <h3 className="text-2xl font-black">{wallet.name}</h3>
      <p className="mt-1 text-4xl font-black">{wallet.balance.toFixed(6)}</p>
      <p className="font-bold text-slate-500 dark:text-slate-400">BTC</p>
      <p className="mt-4 break-all rounded-lg bg-slate-50 p-3 font-mono text-sm font-bold dark:bg-white/5">{wallet.address}</p>
    </article>
  );
}

function TransactionPanel({ transaction }) {
  if (!transaction) return <Empty text="Create a transaction to inspect details." />;
  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black">BTC Transaction</h3>
          <p className="font-mono text-sm font-bold text-cyanx">{transaction.id}</p>
        </div>
        <span className="rounded-full bg-cyanx/10 px-3 py-1 text-sm font-black text-cyanx">{transaction.status}</span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field label="Amount" value={`${transaction.amount} BTC`} />
        <Field label="Fee rate" value={`${transaction.satsPerVByte} sats/vB`} />
        <Field label="Fee" value={`${transaction.feeBtc.toFixed(8)} BTC`} />
        <Field label="Confirmations" value={transaction.confirmations ?? 0} />
        <Field label="From" value={transaction.from} mono />
        <Field label="To" value={transaction.to} mono />
      </div>
    </article>
  );
}

function MempoolView({ mempool, selected }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Mempool priority view</h3>
      <div className="mt-5 grid gap-3">
        {mempool.map(tx => {
          const picked = selected.some(item => item.id === tx.id);
          return (
            <div key={tx.id} className={`rounded-lg border p-4 ${picked ? "border-cyanx bg-cyanx/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-sm font-black">{tx.id}</p>
                <p className="font-black">{tx.satsPerVByte} sats/vB</p>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">{tx.amount} BTC · {picked ? "Miner selected" : "Waiting"}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function BitcoinCaseQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-bitcoin-case-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = bitcoinCaseQuiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-bitcoin-case-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${bitcoinCaseQuiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <>
          <h3 className="text-3xl font-black">Case score: {score}/{bitcoinCaseQuiz.length}</h3>
          <p className="mt-3 rounded-lg bg-emerald-50 p-4 font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">Bitcoin Payment Network completion badge ready after settlement.</p>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === bitcoinCaseQuiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function EventConsole({ events }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">Bitcoin case event log</h3>
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

function Field({ label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
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

function Empty({ text }) {
  return <div className="panel grid min-h-48 place-items-center p-5 text-center font-bold text-slate-500 dark:text-slate-400">{text}</div>;
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

function loadCaseState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-bitcoin-case") || "null");
    return stored?.buyer ? stored : createBitcoinCaseState();
  } catch {
    return createBitcoinCaseState();
  }
}
