import { useState } from "react";
import { AlertTriangle, BookOpenCheck, CheckCircle2, Copy, KeyRound, LockKeyhole, Plus, Radio, RefreshCw, Send, ShieldAlert, WalletCards } from "lucide-react";
import Phase4VaultScene from "../scenes/Phase4VaultScene.jsx";
import { phase4Quiz, riskScenarios } from "../data/phase4.js";
import {
  createSendDraft,
  deriveAddress,
  derivePublicKey,
  generateWallet,
  makeAddressBook,
  shortAddress,
  shortSecret,
  signOwnershipMessage,
  signSendDraft,
  verifyOwnershipSignature,
  verifySendDraft
} from "../utils/walletEngine.js";

export default function Phase4() {
  const [wallets, setWallets] = useState(() => loadWallets());
  const [activeId, setActiveId] = useState(wallets[0]?.id);
  const [addressBook, setAddressBook] = useState(() => makeAddressBook(wallets.slice(1)));
  const [selectedRisk, setSelectedRisk] = useState(riskScenarios[0]);
  const activeWallet = wallets.find(wallet => wallet.id === activeId) ?? wallets[0];
  const [authKey, setAuthKey] = useState(activeWallet.privateKey);
  const [receiverAddress, setReceiverAddress] = useState(addressBook[0]?.address ?? "");
  const [amount, setAmount] = useState(8);
  const [sendDraft, setSendDraft] = useState(null);
  const [sendStage, setSendStage] = useState("Prepare");
  const [challenge, setChallenge] = useState(() => ({ generated: false, identified: false, riskSafe: false, sent: false }));
  const sendVerification = sendDraft ? verifySendDraft(activeWallet, sendDraft) : null;
  const missionDone = Object.values(challenge).filter(Boolean).length;

  function generateNewWallet() {
    const wallet = generateWallet(`Wallet ${wallets.length + 1}`);
    const next = [wallet, ...wallets];
    setWallets(next);
    setActiveId(wallet.id);
    setAuthKey(wallet.privateKey);
    setChallenge(current => ({ ...current, generated: true }));
    localStorage.setItem("bfv-phase4-wallets", JSON.stringify(next));
  }

  function prepareSend() {
    const draft = createSendDraft(activeWallet, receiverAddress, amount);
    setSendDraft(draft);
    setSendStage("Prepared");
  }

  function signSend() {
    if (!sendDraft) return;
    setSendDraft(current => signSendDraft(activeWallet, current, authKey));
    setSendStage(authKey === activeWallet.privateKey ? "Signed" : "Wrong Key");
  }

  function broadcastSend() {
    if (!sendDraft) return;
    const result = verifySendDraft(activeWallet, sendDraft);
    setSendStage(result.valid ? "Broadcast" : result.reason);
  }

  function confirmSend() {
    if (!sendDraft) return;
    const result = verifySendDraft(activeWallet, sendDraft);
    if (!result.valid) {
      setSendStage(result.reason);
      return;
    }
    const nextWallets = wallets.map(wallet => {
      if (wallet.id === activeWallet.id) return { ...wallet, balance: wallet.balance - Number(sendDraft.amount) };
      if (wallet.address === sendDraft.receiverAddress) return { ...wallet, balance: wallet.balance + Number(sendDraft.amount) };
      return wallet;
    });
    setWallets(nextWallets);
    localStorage.setItem("bfv-phase4-wallets", JSON.stringify(nextWallets));
    setSendStage("Confirmed");
    setChallenge(current => ({ ...current, sent: true }));
  }

  return (
    <>
      <section id="phase4" className="section-wrap bg-slate-950 text-white">
        <div className="grid items-center gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <WalletCards size={17} /> Phase 4
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Wallets, Keys & Ownership Practice</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Generate wallets, trace private keys to public addresses, practice safe signing, and learn why ownership means key control.
            </p>
            <div className="mt-7 rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-black uppercase tracking-wide text-white/70">Challenge progress</p>
              <p className="mt-2 text-3xl font-black">{missionDone}/4 missions</p>
            </div>
          </div>
          <div className="h-[430px] overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-soft">
            <Phase4VaultScene />
          </div>
        </div>
      </section>

      <section id="wallet-generator" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Plus} eyebrow="Wallet generator" title="Generate and inspect learner wallets" description="A wallet is a key pair plus an address. The private key controls ownership; the address receives tokens." />
        <div className="mb-5 flex flex-wrap gap-3">
          <button type="button" onClick={generateNewWallet} className="btn-primary"><Plus size={18} /> Generate Wallet</button>
          <button type="button" onClick={() => { const fresh = defaultWallets(); setWallets(fresh); setActiveId(fresh[0].id); setAuthKey(fresh[0].privateKey); localStorage.setItem("bfv-phase4-wallets", JSON.stringify(fresh)); }} className="btn-secondary"><RefreshCw size={18} /> Reset Wallets</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wallets.map(wallet => (
            <button key={wallet.id} type="button" onClick={() => { setActiveId(wallet.id); setAuthKey(wallet.privateKey); setChallenge(current => ({ ...current, identified: true })); }} className={`panel p-5 text-left transition hover:-translate-y-1 ${wallet.id === activeId ? "border-cyanx ring-4 ring-cyanx/15" : ""}`}>
              <WalletCards className="mb-4 text-cyanx" size={28} />
              <h3 className="text-2xl font-black">{wallet.label}</h3>
              <p className="mt-1 text-3xl font-black">{wallet.balance}</p>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">tokens</p>
              <div className="mt-4 grid gap-2">
                <KeyField label="Private key" value={shortSecret(wallet.privateKey)} secret />
                <KeyField label="Public key" value={shortSecret(wallet.publicKey)} />
                <KeyField label="Wallet address" value={shortAddress(wallet.address)} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="key-visualizer" className="section-wrap">
        <PhaseTitle icon={KeyRound} eyebrow="Key relationship visualizer" title="Private key creates public key, public key creates address" description="The relationship is one-way in this teaching model. You can derive public identity from the secret, but the secret must not be shared." />
        <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
          <article className="panel p-5">
            <h3 className="text-xl font-black">{activeWallet.label}</h3>
            <div className="mt-5 grid gap-3">
              <FlowField label="Private Key" value={activeWallet.privateKey} danger />
              <FlowArrow text="derive public key" />
              <FlowField label="Public Key" value={derivePublicKey(activeWallet.privateKey)} />
              <FlowArrow text="derive wallet address" />
              <FlowField label="Wallet Address" value={deriveAddress(activeWallet.publicKey)} />
            </div>
          </article>
          <article className="panel p-5">
            <h3 className="text-xl font-black">Public vs private key</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <CompareCard title="Public key / address" tone="safe" points={["Shareable identity", "Used to receive tokens", "Cannot authorize spending alone"]} />
              <CompareCard title="Private key" tone="danger" points={["Must stay secret", "Creates signatures", "Controls ownership and spending"]} />
            </div>
          </article>
        </div>
      </section>

      <section id="ownership-simulator" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={LockKeyhole} eyebrow="Ownership simulator" title="Which key authorizes a transaction?" description="Try signing an ownership message with the private key. A public key or wrong private key will fail verification." />
        <OwnershipSimulator wallet={activeWallet} onSuccess={() => setChallenge(current => ({ ...current, identified: true }))} />
      </section>

      <section id="security-risk-lab" className="section-wrap">
        <PhaseTitle icon={ShieldAlert} eyebrow="Security risk lab" title="Choose safe behavior before signing" description="Wallet security is mostly about avoiding key exposure, fake prompts, phishing, and address mistakes." />
        <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <div className="grid gap-3">
            {riskScenarios.map(risk => (
              <button key={risk.id} type="button" onClick={() => { setSelectedRisk(risk); if (risk.id === "wrong-address") setChallenge(current => ({ ...current, riskSafe: true })); }} className={`rounded-lg border p-4 text-left font-black transition hover:-translate-y-0.5 ${selectedRisk.id === risk.id ? "border-cyanx bg-cyanx/10" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
                {risk.title}
              </button>
            ))}
          </div>
          <article className={`rounded-lg border p-6 shadow-soft ${selectedRisk.severity === "critical" ? "border-red-300 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100" : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"}`}>
            <AlertTriangle className="mb-4" size={30} />
            <h3 className="text-3xl font-black">{selectedRisk.title}</h3>
            <p className="mt-4 text-lg leading-8"><strong>Risk:</strong> {selectedRisk.risk}</p>
            <p className="mt-3 text-lg leading-8"><strong>Safe action:</strong> {selectedRisk.safeAction}</p>
          </article>
        </div>
      </section>

      <section id="address-send" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Send} eyebrow="Address book and send practice" title="Prepare, sign, broadcast, confirm" description="Use a saved address, sign with the active wallet's private key, and confirm only after verification passes." />
        <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <AddressBook addressBook={addressBook} setAddressBook={setAddressBook} receiverAddress={receiverAddress} setReceiverAddress={setReceiverAddress} />
          <SendPractice
            wallet={activeWallet}
            authKey={authKey}
            setAuthKey={setAuthKey}
            receiverAddress={receiverAddress}
            setReceiverAddress={setReceiverAddress}
            amount={amount}
            setAmount={setAmount}
            sendDraft={sendDraft}
            verification={sendVerification}
            stage={sendStage}
            prepareSend={prepareSend}
            signSend={signSend}
            broadcastSend={broadcastSend}
            confirmSend={confirmSend}
          />
        </div>
      </section>

      <section id="seed-phrase" className="section-wrap">
        <PhaseTitle icon={BookOpenCheck} eyebrow="Seed phrase awareness" title="A seed phrase is a recovery secret" description="This is simulated. In a real wallet, the seed phrase can recover the private keys, so it must be protected like the wallet itself." />
        <article className="panel p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {activeWallet.seedPhrase.map((word, index) => (
              <div key={`${word}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-black dark:border-white/10 dark:bg-white/5">
                <span className="mr-2 text-slate-400">{index + 1}.</span>{word}
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-lg bg-amber-50 p-4 font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            Never type a real seed phrase into a learning app, chat, website, support form, or screenshot.
          </p>
        </article>
      </section>

      <section id="phase4-practice" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={CheckCircle2} eyebrow="Practice and challenge" title="Prove wallet ownership safely" description="Complete the quiz and finish the challenge: generate wallet, identify keys, avoid risks, and send a signed transaction." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Phase4Quiz />
          <ChallengePanel challenge={challenge} />
        </div>
      </section>
    </>
  );
}

function OwnershipSimulator({ wallet, onSuccess }) {
  const [key, setKey] = useState(wallet.privateKey);
  const [result, setResult] = useState("");
  const message = `Authorize ownership check for ${wallet.address}`;

  function runCheck() {
    const signature = signOwnershipMessage({ ...wallet, privateKey: key }, message);
    const ok = verifyOwnershipSignature(wallet, message, signature);
    setResult(ok ? "Authorized. This private key controls the wallet." : "Rejected. This key cannot authorize the wallet.");
    if (ok) onSuccess();
  }

  return (
    <article className="panel p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <label>
          <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Try a key</span>
          <input value={key} onChange={event => setKey(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm font-semibold outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5" />
        </label>
        <button type="button" onClick={runCheck} className="btn-primary self-end">Authorize</button>
      </div>
      {result && <p className={`mt-4 rounded-lg p-4 font-black ${result.startsWith("Authorized") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>{result}</p>}
      <button type="button" onClick={() => setKey("pub_wrong_key_cannot_sign")} className="btn-secondary mt-4">Wrong-key demonstration</button>
    </article>
  );
}

function AddressBook({ addressBook, setAddressBook, receiverAddress, setReceiverAddress }) {
  const [name, setName] = useState("New Contact");
  const [address, setAddress] = useState("0x1234567890abcdef1234567890abcdef12345678");

  function addContact() {
    const next = [...addressBook, { name, address, trusted: /^0x[a-f0-9]{40}$/i.test(address) }];
    setAddressBook(next);
    setReceiverAddress(address);
  }

  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Address book</h3>
      <div className="mt-4 grid gap-3">
        {addressBook.map(contact => (
          <button key={`${contact.name}-${contact.address}`} type="button" onClick={() => setReceiverAddress(contact.address)} className={`rounded-lg border p-3 text-left transition hover:-translate-y-0.5 ${receiverAddress === contact.address ? "border-cyanx bg-cyanx/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
            <p className="font-black">{contact.name}</p>
            <p className="font-mono text-sm font-bold text-slate-600 dark:text-slate-300">{shortAddress(contact.address)}</p>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        <input value={name} onChange={event => setName(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-semibold dark:border-white/10 dark:bg-white/5" />
        <input value={address} onChange={event => setAddress(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-semibold dark:border-white/10 dark:bg-white/5" />
        <button type="button" onClick={addContact} className="btn-secondary"><Copy size={18} /> Save Contact</button>
      </div>
    </article>
  );
}

function SendPractice(props) {
  const {
    wallet, authKey, setAuthKey, receiverAddress, setReceiverAddress, amount, setAmount,
    sendDraft, verification, stage, prepareSend, signSend, broadcastSend, confirmSend
  } = props;

  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Send token practice</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Receiver address</span>
          <input value={receiverAddress} onChange={event => setReceiverAddress(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm font-semibold dark:border-white/10 dark:bg-white/5" />
        </label>
        <label>
          <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</span>
          <input type="number" value={amount} onChange={event => setAmount(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
        </label>
        <label>
          <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Signing key</span>
          <input value={authKey} onChange={event => setAuthKey(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm font-semibold dark:border-white/10 dark:bg-white/5" />
        </label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <button type="button" onClick={prepareSend} className="btn-secondary">Prepare</button>
        <button type="button" onClick={signSend} className="btn-secondary">Sign</button>
        <button type="button" onClick={broadcastSend} className="btn-secondary"><Radio size={18} /> Broadcast</button>
        <button type="button" onClick={confirmSend} className="btn-primary">Confirm</button>
      </div>
      <p className="mt-4 rounded-lg bg-cyanx/10 p-3 font-black text-cyanx">Stage: {stage}</p>
      {sendDraft && (
        <div className="mt-4 grid gap-2">
          <Status ok={verification?.checks.hasSignature} label="Signature present" />
          <Status ok={verification?.checks.signatureValid} label="Signature matches wallet private key" />
          <Status ok={verification?.checks.receiverLooksValid} label="Receiver address format valid" />
          <Status ok={verification?.checks.hasBalance} label={`${wallet.label} has enough balance`} />
        </div>
      )}
    </article>
  );
}

function Phase4Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-phase4-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = phase4Quiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-phase4-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${phase4Quiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <>
          <h3 className="text-3xl font-black">Phase 4 score: {score}/{phase4Quiz.length}</h3>
          <button type="button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false); localStorage.setItem("bfv-phase4-quiz", "0"); }} className="btn-primary mt-6">Restart</button>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === phase4Quiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function ChallengePanel({ challenge }) {
  const rows = [
    ["Generate wallet", challenge.generated],
    ["Identify keys", challenge.identified],
    ["Avoid risk", challenge.riskSafe],
    ["Send signed transaction", challenge.sent]
  ];
  return (
    <article className="panel p-6">
      <h3 className="text-2xl font-black">Challenge checklist</h3>
      <div className="mt-5 grid gap-3">
        {rows.map(([label, done]) => (
          <div key={label} className={`flex items-center gap-3 rounded-lg p-4 font-black ${done ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
            {done ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            {label}
          </div>
        ))}
      </div>
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

function KeyField({ label, value, secret }) {
  return (
    <div className={`rounded-lg p-2 ${secret ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200" : "bg-slate-50 dark:bg-white/5"}`}>
      <p className="text-xs font-black uppercase tracking-wide">{label}</p>
      <p className="font-mono text-sm font-black">{value}</p>
    </div>
  );
}

function FlowField({ label, value, danger }) {
  return (
    <div className={`rounded-lg border p-4 ${danger ? "border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
      <p className="text-sm font-black uppercase tracking-wide">{label}</p>
      <p className="mt-1 break-all font-mono text-sm font-bold">{value}</p>
    </div>
  );
}

function FlowArrow({ text }) {
  return <div className="text-center text-sm font-black uppercase tracking-wide text-cyanx">↓ {text}</div>;
}

function CompareCard({ title, tone, points }) {
  return (
    <div className={`rounded-lg border p-4 ${tone === "danger" ? "border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100" : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"}`}>
      <h4 className="font-black">{title}</h4>
      <ul className="mt-3 grid gap-2">
        {points.map(point => <li key={point} className="font-bold">• {point}</li>)}
      </ul>
    </div>
  );
}

function Status({ ok, label }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg p-3 font-bold ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
      {ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      {label}
    </div>
  );
}

function defaultWallets() {
  const first = generateWallet("Primary Wallet");
  const second = generateWallet("Savings Wallet");
  const third = generateWallet("Course Wallet");
  return [first, second, third];
}

function loadWallets() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-phase4-wallets") || "null");
    return Array.isArray(stored) && stored.length ? stored : defaultWallets();
  } catch {
    return defaultWallets();
  }
}
