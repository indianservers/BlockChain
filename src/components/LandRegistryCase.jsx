import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Building2, CheckCircle2, FileText, Landmark, MapPinned, RefreshCw, SearchCheck, ShieldCheck, WalletCards } from "lucide-react";
import { landRegistryCaseQuiz } from "../data/landRegistryCase.js";
import {
  buyerVerify,
  createLandRegistryState,
  generateSaleAgreement,
  registrarApprove,
  runFraudCheck,
  storeTitleHash,
  tamperLandRecord,
  titleDocumentHash,
  toggleEncumbrance,
  transferOwnership,
  updateBuyer,
  updateOwner,
  updateProperty,
  updateSaleAgreement
} from "../utils/landRegistryCaseEngine.js";
import { hashPreview } from "../utils/blockchainEngine.js";

export default function LandRegistryCase() {
  const [state, setState] = useState(() => loadLandState());
  const currentTitleHash = useMemo(() => titleDocumentHash(state.property, state.owner, state.title), [state.property, state.owner, state.title]);

  useEffect(() => {
    localStorage.setItem("bfv-land-registry-case", JSON.stringify(state));
  }, [state]);

  return (
    <>
      <section id="land-registry-case" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Landmark size={17} /> Case Study
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Blockchain Land Registry</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Record property ownership, verify title hashes, approve transfers through a registrar node, and detect fraud or encumbrance warnings.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Property" value={state.property.propertyId} />
            <HeroStat label="Owner" value={state.owner.name} />
            <HeroStat label="Registrar" value={state.registrarNode.approved ? "Approved" : "Pending"} />
            <HeroStat label="Badge" value={state.completed ? "Earned" : "Pending"} />
          </div>
        </div>
      </section>

      <section id="property-record" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={MapPinned} eyebrow="Property digital record" title="Create a property record with title hash" description="The title hash represents the legal document. Any unauthorized change makes the current record disagree with the stored title hash." />
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Map-style property card</h3>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
              <div className="grid h-52 place-items-center bg-[linear-gradient(135deg,#2563eb_0%,#18b7a8_45%,#84cc16_100%)] text-white">
                <div className="rounded-lg bg-slate-950/40 px-5 py-3 text-center backdrop-blur">
                  <MapPinned className="mx-auto mb-2" size={34} />
                  <p className="text-2xl font-black">{state.property.surveyNumber}</p>
                  <p className="font-bold">{state.property.location}</p>
                </div>
              </div>
              <div className="grid gap-3 p-5 md:grid-cols-2">
                {Object.entries(state.property).map(([field, value]) => (
                  <Input key={field} label={field} value={value} onChange={next => setState(current => updateProperty(current, field, next))} />
                ))}
              </div>
            </div>
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Title document hash</h3>
            <p className="mt-3 break-all rounded-lg bg-cyanx/10 p-4 font-mono text-sm font-black text-cyanx">{currentTitleHash}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => storeTitleHash(current))} className="btn-primary">Store Title Hash</button>
              <button type="button" onClick={() => setState(createLandRegistryState())} className="btn-secondary"><RefreshCw size={18} /> Reset Case</button>
            </div>
            <div className="mt-5 grid gap-3">
              <Field label="Stored title hash" value={hashPreview(state.titleHash, 18)} mono />
              <Field label="Document ID" value={state.title.documentId} />
              <Field label="Registrar" value={state.title.registrar} />
            </div>
          </article>
        </div>
      </section>

      <section id="owner-registrar" className="section-wrap">
        <PhaseTitle icon={WalletCards} eyebrow="Owner wallet and registrar node" title="Verify ownership before transfer" description="The owner wallet identifies the current title holder. The government registrar node must approve transfer readiness." />
        <div className="grid gap-5 lg:grid-cols-3">
          <WalletPanel title="Owner wallet" person={state.owner} onChange={(field, value) => setState(current => updateOwner(current, field, value))} />
          <WalletPanel title="Buyer wallet" person={state.buyer} onChange={(field, value) => setState(current => updateBuyer(current, field, value))} />
          <article className="panel p-5">
            <Building2 className="mb-4 text-cyanx" size={30} />
            <h3 className="text-2xl font-black">{state.registrarNode.name}</h3>
            <p className="mt-3 rounded-lg bg-slate-50 p-3 font-black dark:bg-white/5">Status: {state.registrarNode.online ? "Online" : "Offline"}</p>
            <p className="mt-2 rounded-lg bg-slate-50 p-3 font-black dark:bg-white/5">Approval: {state.registrarNode.approved ? "Approved" : "Pending"}</p>
            <button type="button" onClick={() => setState(current => registrarApprove(current))} className="btn-primary mt-5">Approve Transfer Readiness</button>
          </article>
        </div>
      </section>

      <section id="buyer-transfer" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={SearchCheck} eyebrow="Buyer verification and transfer" title="Generate sale agreement, verify title, transfer ownership" description="The buyer checks title integrity, registrar approval, and encumbrance status before transfer." />
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Sale agreement hash</h3>
            <div className="mt-4 grid gap-3">
              <Input label="Buyer name" value={state.saleAgreement.buyerName} onChange={value => setState(current => updateSaleAgreement(current, "buyerName", value))} />
              <Input label="Seller name" value={state.saleAgreement.sellerName} onChange={value => setState(current => updateSaleAgreement(current, "sellerName", value))} />
              <Input label="Price" value={state.saleAgreement.price} onChange={value => setState(current => updateSaleAgreement(current, "price", value))} />
              <Input label="Terms" value={state.saleAgreement.terms} onChange={value => setState(current => updateSaleAgreement(current, "terms", value))} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => generateSaleAgreement(current))} className="btn-secondary">Generate Agreement Hash</button>
              <button type="button" onClick={() => setState(current => buyerVerify(current))} className="btn-secondary">Buyer Verify</button>
              <button type="button" onClick={() => setState(current => transferOwnership(current))} className="btn-primary">Transfer Ownership</button>
            </div>
          </article>
          <VerificationPanel state={state} />
        </div>
      </section>

      <section id="mutation-history" className="section-wrap">
        <PhaseTitle icon={FileText} eyebrow="Mutation history timeline" title="Every ownership mutation is recorded" description="Title creation, title hash storage, and ownership transfers create a blockchain-style mutation history." />
        <div className="grid gap-4">
          {state.history.map((item, index) => (
            <article key={item.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-cyanx">#{state.history.length - index}</p>
                  <h3 className="text-2xl font-black">{item.action}</h3>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{item.time}</p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label="Owner" value={item.ownerName} />
                <Field label="Wallet" value={item.wallet} mono />
                <Field label="Record hash" value={hashPreview(item.hash, 18)} mono />
              </div>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="land-risk" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={AlertTriangle} eyebrow="Fraud and encumbrance simulation" title="Detect tampering and transfer warnings" description="A property may be blocked by title mismatch, loan encumbrance, court stay, or tax due warning." />
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <article className="panel p-5">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => tamperLandRecord(current))} className="btn-secondary">Tamper Area</button>
              <button type="button" onClick={() => setState(current => runFraudCheck(current))} className="btn-primary">Run Fraud Check</button>
            </div>
            <h3 className="mt-8 text-2xl font-black">Encumbrance warnings</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["hasLoan", "Bank loan"],
                ["hasCourtStay", "Court stay"],
                ["taxDue", "Tax due"]
              ].map(([field, label]) => (
                <button key={field} type="button" onClick={() => setState(current => toggleEncumbrance(current, field))} className={`rounded-lg border p-4 font-black ${state.encumbrance[field] ? "border-red-300 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200" : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"}`}>
                  {label}: {state.encumbrance[field] ? "Warning" : "Clear"}
                </button>
              ))}
            </div>
          </article>
          <article className="panel p-5">
            <ShieldCheck className="mb-4 text-cyanx" size={30} />
            <h3 className="text-2xl font-black">Fraud check result</h3>
            {state.fraudCheck ? (
              <p className={`mt-4 rounded-lg p-4 font-black ${state.fraudCheck.status === "Clean" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
                {state.fraudCheck.message}
              </p>
            ) : <p className="mt-4 rounded-lg bg-slate-50 p-4 font-bold text-slate-500 dark:bg-white/5 dark:text-slate-300">Run fraud check after storing title hash.</p>}
          </article>
        </div>
      </section>

      <section id="land-quiz" className="section-wrap">
        <PhaseTitle icon={CheckCircle2} eyebrow="Case quiz and completion badge" title="Check land registry understanding" description="Complete a clean transfer and answer the quiz to finish the case study." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <LandQuiz />
          <article className="panel p-6">
            <BadgeCheck className="mb-4 text-cyanx" size={34} />
            <h3 className="text-3xl font-black">Completion badge</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Blockchain Land Registry</p>
            <p className={`mt-5 rounded-lg p-4 font-black ${state.completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
              {state.completed ? "Badge earned: ownership transfer recorded." : "Verify and transfer ownership to earn badge."}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function WalletPanel({ title, person, onChange }) {
  return (
    <article className="panel p-5">
      <WalletCards className="mb-4 text-cyanx" size={30} />
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-4 grid gap-3">
        <Input label="Name" value={person.name} onChange={value => onChange("name", value)} />
        <Input label="Wallet" value={person.wallet} onChange={value => onChange("wallet", value)} />
        <Input label="KYC status" value={person.kycStatus} onChange={value => onChange("kycStatus", value)} />
      </div>
    </article>
  );
}

function VerificationPanel({ state }) {
  const v = state.verification;
  const clear = !state.encumbrance.hasLoan && !state.encumbrance.hasCourtStay && !state.encumbrance.taxDue;
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Buyer verification</h3>
      <div className="mt-5 grid gap-3">
        <Status ok={v?.validTitle} label="Title hash matches current record" />
        <Status ok={v?.registrarApproved} label="Registrar node approved" />
        <Status ok={clear} label="No encumbrance warning" />
        <Field label="Sale agreement hash" value={state.saleAgreement.hash ? hashPreview(state.saleAgreement.hash, 18) : "Not generated"} mono />
      </div>
      {v && <p className={`mt-5 rounded-lg p-4 font-black ${v.status === "Verified for sale" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>{v.status}</p>}
    </article>
  );
}

function LandQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-land-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = landRegistryCaseQuiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-land-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${landRegistryCaseQuiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <h3 className="text-3xl font-black">Case score: {score}/{landRegistryCaseQuiz.length}</h3>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === landRegistryCaseQuiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function Status({ ok, label }) {
  return (
    <div className={`rounded-lg p-3 font-bold ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
      {label}
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
    </label>
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

function loadLandState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-land-registry-case") || "null");
    return stored?.property ? stored : createLandRegistryState();
  } catch {
    return createLandRegistryState();
  }
}
