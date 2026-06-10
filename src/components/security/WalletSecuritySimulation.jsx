import { useEffect, useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import SecurityScenarioCard from "./SecurityScenarioCard.jsx";

const key = "bfv-security-simulation";

const scenarios = [
  ["public-address", "Share public wallet address.", "Safe", "Low", "Public addresses are meant to receive funds.", "Public address is shareable; private keys and seed phrases are not."],
  ["private-key", "Share private key with friend.", "Risky", "High", "Anyone with the private key can spend the funds.", "Never share private keys."],
  ["unknown-seed", "Enter seed phrase on unknown website.", "Risky", "High", "Unknown websites can steal the wallet instantly.", "Seed phrase is wallet recovery power."],
  ["public-doc", "Store seed phrase in public Google Doc.", "Risky", "High", "Public cloud documents can be viewed or leaked.", "Backups should be offline and private."],
  ["verify-address", "Verify receiver address before sending.", "Safe", "Low", "Checking avoids clipboard or typo attacks.", "Always compare the full or critical address characters."],
  ["unknown-sign", "Sign unknown transaction.", "Risky", "High", "Unknown signatures can authorize harmful actions.", "Read transaction details before signing."],
  ["hardware-wallet", "Use hardware wallet.", "Safe", "Low", "Hardware wallets keep keys isolated.", "Use trusted devices for high-value funds."],
  ["copied-address", "Send funds to copied address without checking.", "Risky", "Medium", "Clipboard malware can swap addresses.", "Verify the address after paste."],
  ["support-seed", "Support agent asks for seed phrase.", "Risky", "High", "Real support never needs your seed phrase.", "Treat seed requests as theft attempts."],
  ["offline-backup", "Backup seed phrase offline securely.", "Safe", "Low", "Offline private backup reduces online theft risk.", "Store recovery phrase safely and privately."]
].map(([id, text, answer, severity, explanation, lesson]) => ({ id, text, answer, severity, explanation, lesson }));

export default function WalletSecuritySimulation() {
  const [answers, setAnswers] = useState(() => loadAnswers());
  const score = useMemo(() => scenarios.filter(item => answers[item.id] === item.answer).length, [answers]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(answers));
    localStorage.setItem("bfv-security-score", String(score));
  }, [answers, score]);

  return (
    <section id="wallet-security-simulation" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
            <ShieldAlert size={17} /> Wallet Security Simulation
          </p>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Is this safe or risky?</h2>
          <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">Classify wallet security scenarios and learn the risk behind each choice.</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Security score</p>
          <p className="mt-1 text-4xl font-black">{score}/{scenarios.length}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {scenarios.map(scenario => (
          <SecurityScenarioCard key={scenario.id} scenario={scenario} answer={answers[scenario.id]} onAnswer={(id, value) => setAnswers(current => ({ ...current, [id]: value }))} />
        ))}
      </div>
    </section>
  );
}

function loadAnswers() {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}
