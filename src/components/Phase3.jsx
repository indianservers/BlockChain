import { useMemo, useState } from "react";
import { AlertTriangle, Blocks, CheckCircle2, KeyRound, Plus, Send, ShieldCheck, UserRound, WalletCards } from "lucide-react";
import Phase3TransactionScene from "../scenes/Phase3TransactionScene.jsx";
import { invalidDemoTypes, phase3Quiz } from "../data/phase3.js";
import {
  applyTransactionsToWallets,
  createTransaction,
  initialWallets,
  makeInvalidDemo,
  shortKey,
  signTransaction,
  tamperTransaction,
  transactionHash,
  verifyTransaction
} from "../utils/transactionEngine.js";
import TransactionCard from "./phase3/TransactionCard.jsx";

export default function Phase3() {
  const [wallets, setWallets] = useState(initialWallets);
  const [draft, setDraft] = useState(() => createTransaction({ sender: "Alice", receiver: "Bob", amount: 12 }));
  const [privateKey, setPrivateKey] = useState(initialWallets[0].privateKey);
  const [mempool, setMempool] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [message, setMessage] = useState("Create a transaction, sign it, verify it, then add it to the mempool.");
  const verification = useMemo(() => verifyTransaction(draft, wallets), [draft, wallets]);

  function updateDraft(field, value) {
    setDraft(current => {
      const next = { ...current, [field]: field === "amount" ? Number(value) : value, status: "Draft" };
      if (field === "sender" && next.receiver === value) {
        next.receiver = wallets.find(wallet => wallet.name !== value)?.name ?? next.receiver;
      }
      return { ...next, hash: transactionHash(next), signature: field === "sender" ? "" : next.signature };
    });
  }

  function signDraft() {
    setDraft(current => signTransaction(current, privateKey));
    setMessage("Signature created. Now run verification.");
  }

  function verifyDraft() {
    const result = verifyTransaction(draft, wallets);
    setDraft(current => ({ ...current, status: result.status }));
    setMessage(result.valid ? "Transaction verified. It can enter the mempool." : result.reason);
  }

  function addToMempool() {
    const result = verifyTransaction(draft, wallets);
    if (!result.valid) {
      setMessage(result.reason);
      return;
    }
    setMempool(current => [...current, { ...draft, status: "Mempool" }]);
    setMessage("Valid transaction added to mempool.");
    setDraft(createTransaction({ sender: "Alice", receiver: "Bob", amount: 10 }));
  }

  function addMempoolToBlock() {
    if (!mempool.length) return;
    const validTransactions = mempool.filter(transaction => verifyTransaction(transaction, wallets).valid);
    if (!validTransactions.length) {
      setMessage("No valid transactions available for the block.");
      return;
    }
    setBlocks(current => [...current, { id: current.length + 1, transactions: validTransactions }]);
    setWallets(current => applyTransactionsToWallets(current, validTransactions));
    setMempool([]);
    setMessage(`${validTransactions.length} valid transaction(s) added to Block #${blocks.length + 1}.`);
  }

  function loadInvalidDemo(type) {
    const transaction = makeInvalidDemo(type, wallets);
    setDraft(transaction);
    setPrivateKey(initialWallets[0].privateKey);
    setMessage(`Loaded demo: ${invalidDemoTypes.find(([id]) => id === type)?.[1]}. Run verification.`);
  }

  return (
    <>
      <section id="phase3" className="section-wrap bg-slate-950 text-white">
        <div className="grid items-center gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Send size={17} /> Transactions
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Transactions & Digital Signatures Lab</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Create transactions, sign with private keys, verify signatures and balances, reject bad transactions, and add valid ones into blocks.
            </p>
          </div>
          <div className="h-[430px] overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-soft">
            <Phase3TransactionScene />
          </div>
        </div>
      </section>

      <section id="wallet-lab" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={WalletCards} eyebrow="Wallet simulator" title="Meet the wallets and keys" description="Each wallet has a public key for identity, a private key for signing, and a token balance for spending." />
        <div className="grid gap-4 md:grid-cols-3">
          {wallets.map(wallet => (
            <article key={wallet.name} className="panel p-5">
              <UserRound className="mb-4 text-cyanx" size={28} />
              <h3 className="text-2xl font-black">{wallet.name}</h3>
              <p className="mt-1 text-4xl font-black">{wallet.balance}</p>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">tokens</p>
              <div className="mt-4 grid gap-2 text-sm">
                <KeyLine label="Public" value={wallet.publicKey} />
                <KeyLine label="Private" value={wallet.privateKey} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="transaction-builder" className="section-wrap">
        <PhaseTitle icon={Plus} eyebrow="Transaction builder" title="Create, sign, verify, and queue a transaction" description="A transaction becomes useful only after it is signed by the sender and accepted by the verification engine." />
        <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <article className="panel p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Sender" value={draft.sender} onChange={value => updateDraft("sender", value)} options={wallets.map(wallet => wallet.name)} />
              <Select label="Receiver" value={draft.receiver} onChange={value => updateDraft("receiver", value)} options={wallets.map(wallet => wallet.name).filter(name => name !== draft.sender)} />
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</span>
                <input type="number" min="1" value={draft.amount} onChange={event => updateDraft("amount", event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5" />
              </label>
              <Select label="Signing private key" value={privateKey} onChange={setPrivateKey} options={wallets.map(wallet => wallet.privateKey)} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={signDraft} className="btn-primary"><KeyRound size={18} /> Sign</button>
              <button type="button" onClick={verifyDraft} className="btn-secondary"><ShieldCheck size={18} /> Verify</button>
              <button type="button" onClick={addToMempool} className="btn-secondary"><Plus size={18} /> Add to Mempool</button>
            </div>
            <p className="mt-4 rounded-lg bg-cyanx/10 p-3 font-bold text-cyanx" aria-live="polite">{message}</p>
          </article>

          <div className="grid gap-5">
            <TransactionCard transaction={draft} verification={verification} />
            <VerificationPanel verification={verification} />
          </div>
        </div>
      </section>

      <section id="transaction-tamper" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={AlertTriangle} eyebrow="Tampering and invalid demos" title="Break transactions and watch verification reject them" description="A changed receiver, wrong key, fake signature, missing signature, or insufficient balance should never reach a block." />
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <article className="panel p-5">
            <h3 className="text-xl font-black">Tamper current transaction</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => setDraft(current => tamperTransaction(current, "receiver", current.receiver === "Bob" ? "Charlie" : "Bob"))} className="btn-secondary">Change receiver</button>
              <button type="button" onClick={() => setDraft(current => tamperTransaction(current, "amount", Number(current.amount) + 500))} className="btn-secondary">Raise amount</button>
              <button type="button" onClick={() => setDraft(current => ({ ...current, signature: "", status: "Rejected" }))} className="btn-secondary">Remove signature</button>
            </div>
            <h3 className="mt-6 text-xl font-black">Invalid transaction demos</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {invalidDemoTypes.map(([type, label]) => (
                <button key={type} type="button" onClick={() => loadInvalidDemo(type)} className="btn-secondary">{label}</button>
              ))}
            </div>
          </article>
          <TransactionCard transaction={draft} verification={verification} />
        </div>
      </section>

      <section id="mempool-block" className="section-wrap">
        <PhaseTitle icon={Blocks} eyebrow="Mempool to block" title="Only valid transactions move into blocks" description="The mempool holds verified transactions until they are packed into a block and balances are updated." />
        <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
          <article className="panel p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-2xl font-black">Mempool</h3>
              <button type="button" onClick={addMempoolToBlock} className="btn-primary">Add Valid Transactions Into Block</button>
            </div>
            <div className="grid gap-3">
              {mempool.length ? mempool.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} verification={verifyTransaction(transaction, wallets)} compact />
              )) : <EmptyState text="No transactions in mempool yet." />}
            </div>
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Blocks</h3>
            <div className="mt-4 grid gap-3">
              {blocks.length ? blocks.map(block => (
                <div key={block.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="font-black">Block #{block.id}</p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{block.transactions.length} transaction(s)</p>
                </div>
              )) : <EmptyState text="No transaction blocks created yet." />}
            </div>
          </article>
        </div>
      </section>

      <section id="phase3-practice" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={CheckCircle2} eyebrow="Practice and challenge" title="Create, sign, verify, and add 3 valid transactions" description="Prove you can move valid transactions from wallets to mempool to block." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Phase3Quiz />
          <TransactionChallenge />
        </div>
      </section>
    </>
  );
}

function VerificationPanel({ verification }) {
  const checks = [
    ["Signature present", verification.checks.hasSignature],
    ["Valid signature", verification.checks.validSignature],
    ["Data not tampered", verification.checks.hashMatchesData],
    ["Sufficient balance", verification.checks.sufficientBalance],
    ["Known wallets", verification.checks.senderExists && verification.checks.receiverExists]
  ];
  return (
    <article className="panel p-5">
      <h3 className="text-xl font-black">Verification engine</h3>
      <div className="mt-4 grid gap-2">
        {checks.map(([label, ok]) => (
          <div key={label} className={`flex items-center gap-2 rounded-lg p-3 font-bold ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
            {ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {label}
          </div>
        ))}
      </div>
    </article>
  );
}

function Phase3Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-phase3-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = phase3Quiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-phase3-quiz", String(next));
        return next;
      });
    }
  }

  function next() {
    if (index === phase3Quiz.length - 1) {
      setDone(true);
      return;
    }
    setSelected(null);
    setIndex(current => current + 1);
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${phase3Quiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <>
          <h3 className="text-3xl font-black">Transactions score: {score}/{phase3Quiz.length}</h3>
          <button type="button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false); localStorage.setItem("bfv-phase3-quiz", "0"); }} className="btn-primary mt-6">Restart</button>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-black">{question.question}</h3>
          <div className="mt-5 grid gap-3">
            {question.options.map(option => {
              const correct = selected && option === question.answer;
              const wrong = selected === option && option !== question.answer;
              return (
                <button key={option} type="button" onClick={() => choose(option)} className={`rounded-lg border p-4 text-left font-bold transition ${correct ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : wrong ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-200" : "border-slate-200 bg-slate-50 hover:border-cyanx dark:border-white/10 dark:bg-white/5"}`}>
                  {option}
                </button>
              );
            })}
          </div>
          <p className={`mt-4 min-h-7 font-black ${selected === question.answer ? "text-emerald-600" : "text-red-500"}`}>
            {selected ? (selected === question.answer ? "Correct." : `Correct answer: ${question.answer}.`) : ""}
          </p>
          <button type="button" disabled={!selected} onClick={next} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">
            {index === phase3Quiz.length - 1 ? "Show Score" : "Next"}
          </button>
        </>
      )}
    </article>
  );
}

function TransactionChallenge() {
  const [wallets, setWallets] = useState(initialWallets);
  const [count, setCount] = useState(0);
  const [block, setBlock] = useState(null);
  const complete = Boolean(block && block.transactions.length >= 3);

  function addValidChallengeTransaction() {
    if (count >= 3) return;
    const sender = count % 2 === 0 ? "Alice" : "Bob";
    const receiver = count % 2 === 0 ? "Charlie" : "Alice";
    const wallet = wallets.find(item => item.name === sender);
    const transaction = signTransaction(createTransaction({ sender, receiver, amount: 5 + count }), wallet.privateKey);
    const result = verifyTransaction(transaction, wallets);
    if (!result.valid) return;
    setBlock(current => {
      const next = current ?? { id: 1, transactions: [] };
      return { ...next, transactions: [...next.transactions, transaction] };
    });
    setWallets(current => applyTransactionsToWallets(current, [transaction]));
    setCount(current => current + 1);
    localStorage.setItem("bfv-phase3-challenge", String(count + 1));
  }

  return (
    <article className="panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black">Challenge: add 3 valid transactions into a block</h3>
          <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">Use the guided button to create, sign, verify, and add one valid transaction at a time.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-black ${complete ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"}`}>
          {count}/3
        </span>
      </div>
      <button type="button" onClick={addValidChallengeTransaction} disabled={complete} className="btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-45">
        Create, Sign, Verify, Add
      </button>
      <div className="mt-5 grid gap-3">
        {block?.transactions?.length ? block.transactions.map(transaction => (
          <TransactionCard key={transaction.id} transaction={transaction} verification={verifyTransaction(transaction, wallets)} compact />
        )) : <EmptyState text="No challenge transactions added yet." />}
      </div>
      {complete && <p className="mt-5 rounded-lg bg-emerald-50 p-4 font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">Challenge complete. You built a transaction block with 3 valid signed transactions.</p>}
    </article>
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

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5">
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function KeyLine({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-mono font-black">{shortKey(value)}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
      {text}
    </div>
  );
}
