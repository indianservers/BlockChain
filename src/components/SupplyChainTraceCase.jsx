import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Boxes, CheckCircle2, FileBadge, QrCode, RefreshCw, Route, ShieldCheck, Truck } from "lucide-react";
import { supplyChainCaseQuiz } from "../data/supplyChainCase.js";
import { addNextCheckpoint, checkpointStages, createSupplyChainCaseState, repairSupplyChain, simulateQrVerification, tamperCheckpoint, validateSupplyChain } from "../utils/supplyChainCaseEngine.js";
import { hashPreview } from "../utils/blockchainEngine.js";

export default function SupplyChainTraceCase() {
  const [state, setState] = useState(() => loadTraceState());
  const validation = useMemo(() => validateSupplyChain(state), [state]);

  useEffect(() => {
    localStorage.setItem("bfv-supply-chain-case", JSON.stringify(state));
  }, [state]);

  return (
    <>
      <section id="supply-chain-case" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Truck size={17} /> Case Study
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Blockchain Supply Chain Traceability</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Follow a product from manufacturer to customer with hash-linked checkpoints, tamper detection, QR verification, and an authenticity certificate.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Product" value={state.product.batch} />
            <HeroStat label="Checkpoints" value={`${state.checkpoints.length}/6`} />
            <HeroStat label="Invalid" value={validation.invalidCount} />
            <HeroStat label="Certificate" value={state.completed ? "Ready" : "Pending"} />
          </div>
        </div>
      </section>

      <section id="product-identity" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Boxes} eyebrow="Product digital identity" title="Every trace starts with a product identity" description="The product identity anchors the first checkpoint hash and gives customers a stable record to verify." />
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <ProductCard product={state.product} />
          <RouteVisual checkpoints={state.checkpoints} validation={validation} />
        </div>
      </section>

      <section id="trace-checkpoints" className="section-wrap">
        <PhaseTitle icon={Route} eyebrow="Hash-linked checkpoints" title="Record product movement from manufacturer to customer" description="Each checkpoint stores its own hash and the previous checkpoint hash, creating a traceable chain." />
        <div className="mb-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setState(current => addNextCheckpoint(current))} className="btn-primary">Add Next Checkpoint</button>
          <button type="button" onClick={() => setState(current => repairSupplyChain(current))} className="btn-secondary"><RefreshCw size={18} /> Repair Demo Chain</button>
          <button type="button" onClick={() => setState(createSupplyChainCaseState())} className="btn-secondary">Reset Case</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.checkpoints.map((checkpoint, index) => (
            <CheckpointCard
              key={checkpoint.id}
              checkpoint={checkpoint}
              result={validation.results[index]}
              onTamper={() => setState(current => tamperCheckpoint(current, checkpoint.id, "location", `${checkpoint.location} (changed)`))}
            />
          ))}
          {!state.checkpoints.length && <Empty text="No checkpoints yet. Add the manufacturer checkpoint to begin." />}
        </div>
      </section>

      <section id="trace-verify" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={QrCode} eyebrow="QR verification and authenticity" title="Customer scans product QR and verifies the trace" description="The QR scan checks whether the route is complete and all checkpoint hashes still match." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <div className="grid place-items-center rounded-lg border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-slate-950">
              <QrCode size={120} className="text-slate-950 dark:text-white" />
              <p className="mt-4 font-mono text-sm font-black">{state.product.id}</p>
            </div>
            <button type="button" onClick={() => setState(current => simulateQrVerification(current))} className="btn-primary mt-5 w-full">Scan QR</button>
            {state.qrScan && (
              <p className={`mt-4 rounded-lg p-4 font-black ${state.qrScan.authentic ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
                {state.qrScan.message}
              </p>
            )}
          </article>
          <Certificate state={state} validation={validation} />
        </div>
      </section>

      <section id="trace-events" className="section-wrap">
        <PhaseTitle icon={ShieldCheck} eyebrow="Traceability event log" title="Audit what happened in the case study" description="Product identity, checkpoints, tamper attempts, repairs, and QR scans are recorded in the event console." />
        <EventConsole events={state.events} />
      </section>

      <section id="trace-quiz" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={CheckCircle2} eyebrow="Case quiz and badge" title="Check supply-chain traceability understanding" description="Complete the route, verify the QR scan, and answer the quiz to finish the case study." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <SupplyChainQuiz />
          <article className="panel p-6">
            <FileBadge className="mb-4 text-cyanx" size={32} />
            <h3 className="text-3xl font-black">Completion badge</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Blockchain Supply Chain Traceability</p>
            <p className={`mt-5 rounded-lg p-4 font-black ${state.completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
              {state.completed ? "Badge earned: complete authentic trace verified." : "Complete all six checkpoints and scan QR to earn badge."}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function ProductCard({ product }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">{product.name}</h3>
      <div className="mt-5 grid gap-3">
        <Field label="Product ID" value={product.id} mono />
        <Field label="Batch" value={product.batch} />
        <Field label="Origin" value={product.origin} />
        <Field label="Manufacturer" value={product.manufacturer} />
        <Field label="Created" value={product.createdAt} />
      </div>
    </article>
  );
}

function RouteVisual({ checkpoints, validation }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">3D-style route timeline</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-6">
        {checkpointStages.map((stage, index) => {
          const checkpoint = checkpoints[index];
          const valid = checkpoint ? validation.results[index]?.valid : false;
          return (
            <div key={stage} className="text-center">
              <div className={`mx-auto grid h-16 w-16 place-items-center rounded-lg font-black text-white shadow-soft ${checkpoint ? valid ? "bg-emerald-500" : "bg-red-500" : "bg-slate-400"}`}>
                {index + 1}
              </div>
              <p className="mt-3 text-sm font-black">{stage}</p>
              {index < checkpointStages.length - 1 && <div className="mx-auto mt-3 hidden h-1 w-full bg-cyanx/40 md:block" />}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function CheckpointCard({ checkpoint, result, onTamper }) {
  return (
    <article className={`rounded-lg border p-5 shadow-soft ${result?.valid ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" : "border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">#{checkpoint.id} {checkpoint.stage}</h3>
          <p className="mt-1 text-sm font-bold">{checkpoint.location}</p>
        </div>
        {result?.valid ? <CheckCircle2 className="text-emerald-600" /> : <AlertTriangle className="text-red-600" />}
      </div>
      <div className="mt-4 grid gap-2">
        <Field label="Actor" value={checkpoint.actor} />
        <Field label="Note" value={checkpoint.note} />
        <Field label="Hash" value={hashPreview(checkpoint.hash, 14)} mono />
        <Field label="Previous hash" value={hashPreview(checkpoint.previousHash, 10)} mono />
      </div>
      <button type="button" onClick={onTamper} className="btn-secondary mt-4">Tamper Location</button>
    </article>
  );
}

function Certificate({ state, validation }) {
  const authentic = state.completed && validation.invalidCount === 0;
  return (
    <article className="panel p-6">
      <BadgeCheck className="mb-4 text-cyanx" size={34} />
      <p className="text-sm font-black uppercase tracking-wide text-cyanx">Product authenticity certificate</p>
      <h3 className="mt-2 text-3xl font-black">{state.product.name}</h3>
      <div className="mt-5 grid gap-3">
        <Field label="Product ID" value={state.product.id} mono />
        <Field label="Trace status" value={authentic ? "Authentic and complete" : "Pending or warning"} />
        <Field label="Invalid checkpoints" value={validation.invalidCount} />
        <Field label="Issued date" value={authentic ? new Date().toLocaleDateString() : "Not issued"} />
      </div>
    </article>
  );
}

function SupplyChainQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-supply-chain-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = supplyChainCaseQuiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-supply-chain-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${supplyChainCaseQuiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <h3 className="text-3xl font-black">Case score: {score}/{supplyChainCaseQuiz.length}</h3>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === supplyChainCaseQuiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function EventConsole({ events }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">Supply-chain event console</h3>
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
    <div className="rounded-lg bg-white/70 p-3 dark:bg-white/5">
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

function loadTraceState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-supply-chain-case") || "null");
    return stored?.product ? stored : createSupplyChainCaseState();
  } catch {
    return createSupplyChainCaseState();
  }
}
