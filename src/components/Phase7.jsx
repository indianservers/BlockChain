import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Code2, FileCode2, Play, RefreshCw, ScrollText, ShieldCheck, TerminalSquare, WalletCards } from "lucide-react";
import { phase7Quiz, smartContractUseCases } from "../data/phase7.js";
import { callEscrowFunction, contractBugDemos, createEscrowContract, escrowStates, functionSpecs, validateEscrowCall } from "../utils/contractEngine.js";
import SmartContractStateMachine from "./contracts/SmartContractStateMachine.jsx";

export default function Phase7() {
  const [contract, setContract] = useState(() => loadContract());
  const [caller, setCaller] = useState("Buyer");
  const [selectedFunction, setSelectedFunction] = useState("deposit");
  const [lastValidation, setLastValidation] = useState({ valid: true, reason: "Ready for function call" });
  const [challenge, setChallenge] = useState({ deposited: false, delivered: false, confirmed: false, released: false, noInvalid: true });
  const currentValidation = useMemo(() => validateEscrowCall(contract, selectedFunction, caller), [contract, selectedFunction, caller]);

  function executeCall(functionName = selectedFunction) {
    const result = callEscrowFunction(contract, functionName, caller);
    setContract(result.contract);
    setLastValidation(result.validation);
    localStorage.setItem("bfv-phase7-contract", JSON.stringify(result.contract));

    if (!result.validation.valid) {
      setChallenge(current => ({ ...current, noInvalid: false }));
      return;
    }
    setChallenge(current => ({
      ...current,
      deposited: current.deposited || functionName === "deposit",
      delivered: current.delivered || functionName === "markDelivered",
      confirmed: current.confirmed || functionName === "confirmDelivery",
      released: current.released || functionName === "releasePayment"
    }));
  }

  function resetContract() {
    const fresh = createEscrowContract();
    setContract(fresh);
    setLastValidation({ valid: true, reason: "Ready for function call" });
    setChallenge({ deposited: false, delivered: false, confirmed: false, released: false, noInvalid: true });
    localStorage.setItem("bfv-phase7-contract", JSON.stringify(fresh));
  }

  return (
    <>
      <section id="phase7" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <FileCode2 size={17} /> Smart Contracts
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Smart Contracts Visual Lab</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Execute escrow functions, watch rule checks, state transitions, event logs, gas fees, permissions, and bug demos.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft">
            <CodePanel />
          </div>
        </div>
      </section>

      <section id="contract-explainer" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={ScrollText} eyebrow="Contract execution flow" title="User action becomes a deterministic state update" description="Smart contracts are programs with rules. Function calls either pass validation and update state, or fail and leave state unchanged." />
        <div className="grid gap-3 md:grid-cols-5">
          {["User action", "Function call", "Rule check", "State update", "Event log"].map((step, index) => (
            <article key={step} className="panel p-4 text-center">
              <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg bg-cyanx/10 font-black text-cyanx">{index + 1}</span>
              <h3 className="font-black">{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="contract-anatomy" className="section-wrap">
        <PhaseTitle icon={WalletCards} eyebrow="Contract anatomy" title="Inspect the escrow contract" description="The contract has an address, owner, state variables, function list, events, and a token balance." />
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <ContractCard contract={contract} />
          <StateMachine state={contract.state} />
        </div>
      </section>

      <SmartContractStateMachine />

      <section id="escrow-playground" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Play} eyebrow="Escrow function playground" title="Call functions and watch the rule engine respond" description="Try the correct sequence or intentionally call functions out of order. The terminal will explain each result." />
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Caller" value={caller} onChange={setCaller} options={["Buyer", "Seller", "Contract", "Arbiter", "Attacker"]} />
              <Select label="Function" value={selectedFunction} onChange={setSelectedFunction} options={Object.keys(functionSpecs)} labels={functionSpecs} />
            </div>
            <div className="mt-5 rounded-lg bg-slate-50 p-4 dark:bg-white/5">
              <p className="font-black">{functionSpecs[selectedFunction].label}</p>
              <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{functionSpecs[selectedFunction].description}</p>
              <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">Simulated gas: {functionSpecs[selectedFunction].gas.toLocaleString()}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => executeCall()} className="btn-primary"><Play size={18} /> Execute Call</button>
              <button type="button" onClick={resetContract} className="btn-secondary"><RefreshCw size={18} /> Reset Contract</button>
            </div>
            <ValidationBox validation={currentValidation} title="Pre-call validation" />
            <ValidationBox validation={lastValidation} title="Last execution result" />
          </article>
          <div className="grid gap-5">
            <EventTerminal events={contract.events} />
            <BalanceCards contract={contract} />
          </div>
        </div>
      </section>

      <section id="contract-use-bugs" className="section-wrap">
        <PhaseTitle icon={AlertTriangle} eyebrow="Use cases and bug demos" title="Smart contracts are powerful, but rules must be precise" description="A missing check or wrong state transition can lock funds, release funds twice, or give control to the wrong party." />
        <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Use cases</h3>
            <div className="mt-4 grid gap-3">
              {smartContractUseCases.map(([title, text]) => (
                <div key={title} className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
                  <p className="font-black">{title}</p>
                  <p className="mt-1 leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </article>
          <div className="grid gap-4 md:grid-cols-2">
            {contractBugDemos.map(bug => (
              <article key={bug.title} className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900 shadow-soft dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                <h3 className="text-xl font-black">{bug.title}</h3>
                <pre className="mt-3 overflow-auto rounded-lg bg-slate-950 p-3 text-sm text-slate-100"><code>{bug.code}</code></pre>
                <p className="mt-3 font-bold"><strong>Risk:</strong> {bug.risk}</p>
                <p className="mt-2 font-bold"><strong>Fix:</strong> {bug.fix}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="phase7-practice" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={ShieldCheck} eyebrow="Practice and challenge" title="Complete escrow without invalid actions" description="Use the playground in order: deposit, markDelivered, confirmDelivery, releasePayment." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Phase7Quiz />
          <ChallengePanel challenge={challenge} />
        </div>
      </section>
    </>
  );
}

function ContractCard({ contract }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Escrow Contract</h3>
      <div className="mt-5 grid gap-3">
        <Field label="Address" value={contract.address} mono />
        <Field label="Owner" value={contract.owner} />
        <Field label="Buyer" value={contract.buyer} />
        <Field label="Seller" value={contract.seller} />
        <Field label="State" value={contract.state} />
        <Field label="Balance" value={`${contract.balance} tokens`} />
        <Field label="Gas used" value={contract.gasUsed.toLocaleString()} />
      </div>
    </article>
  );
}

function StateMachine({ state }) {
  const activeIndex = escrowStates.indexOf(state);
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Animated state machine</h3>
      <div className="mt-5 grid gap-3">
        {escrowStates.map((item, index) => (
          <div key={item} className={`flex items-center gap-3 rounded-lg border p-4 font-black ${index <= activeIndex ? "border-cyanx bg-cyanx/10 text-cyanx" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5"}`}>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-950 dark:bg-slate-950 dark:text-white">{index + 1}</span>
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}

function EventTerminal({ events }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-white">
        <TerminalSquare size={18} className="text-cyanx" />
        <h3 className="font-black">Event log terminal</h3>
      </div>
      <div className="max-h-80 overflow-auto p-4 font-mono text-sm">
        {events.map(event => (
          <div key={event.id} className="mb-3 text-slate-200">
            <span className="text-cyanx">[{event.time}]</span> <span className="text-emerald-300">{event.name}</span> {event.message}
          </div>
        ))}
      </div>
    </article>
  );
}

function BalanceCards({ contract }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <BalanceCard title="Contract" value={contract.balance} />
      <BalanceCard title="Buyer escrow" value={contract.state === "Created" ? contract.price : 0} />
      <BalanceCard title="Seller received" value={contract.released ? contract.price : 0} />
    </div>
  );
}

function BalanceCard({ title, value }) {
  return (
    <article className="panel p-4">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">tokens</p>
    </article>
  );
}

function CodePanel() {
  return (
    <pre className="overflow-auto rounded-lg bg-slate-950 p-4 text-sm leading-7 text-slate-100"><code>{`contract Escrow {
  address owner;
  address buyer;
  address seller;
  State state;

  function deposit() onlyBuyer inState(Created)
  function markDelivered() onlySeller inState(Funded)
  function confirmDelivery() onlyBuyer inState(Delivered)
  function releasePayment() inState(Confirmed)
}`}</code></pre>
  );
}

function ValidationBox({ validation, title }) {
  return (
    <div className={`mt-4 rounded-lg p-4 font-bold ${validation.valid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
      <p className="font-black">{title}</p>
      <p className="mt-1">{validation.reason}</p>
    </div>
  );
}

function Phase7Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-phase7-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = phase7Quiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-phase7-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${phase7Quiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <>
          <h3 className="text-3xl font-black">Contract score: {score}/{phase7Quiz.length}</h3>
          <button type="button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false); localStorage.setItem("bfv-phase7-quiz", "0"); }} className="btn-primary mt-6">Restart</button>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === phase7Quiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function ChallengePanel({ challenge }) {
  const rows = [
    ["Buyer deposited", challenge.deposited],
    ["Seller delivered", challenge.delivered],
    ["Buyer confirmed", challenge.confirmed],
    ["Payment released", challenge.released],
    ["No invalid actions", challenge.noInvalid]
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

function Select({ label, value, options, onChange, labels }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5">
        {options.map(option => <option key={option} value={option}>{labels?.[option]?.label ?? option}</option>)}
      </select>
    </label>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`${mono ? "font-mono text-sm" : ""} break-words font-black`}>{value}</p>
    </div>
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

function loadContract() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-phase7-contract") || "null");
    return stored?.address ? stored : createEscrowContract();
  } catch {
    return createEscrowContract();
  }
}
