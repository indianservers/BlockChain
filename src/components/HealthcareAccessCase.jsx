import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle2, Clock, FileHeart, KeyRound, LockKeyhole, RefreshCw, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { healthcareCaseQuiz } from "../data/healthcareCase.js";
import {
  checkAccess,
  createHealthcareCaseState,
  expireAccessNow,
  grantAccess,
  permissionRemaining,
  requestDoctorAccess,
  revokeAccess,
  tamperLabReport,
  updateDoctor,
  updateHospital,
  updatePatient,
  verifyLabReport
} from "../utils/healthcareCaseEngine.js";
import { hashPreview } from "../utils/blockchainEngine.js";

export default function HealthcareAccessCase() {
  const [state, setState] = useState(() => loadHealthState());
  const [purpose, setPurpose] = useState("Review records for cardiology consultation");
  const [minutes, setMinutes] = useState(15);
  const [unauthorizedWallet, setUnauthorizedWallet] = useState("0xBAD0000000000000000000000000000000000000");
  const remaining = useMemo(() => permissionRemaining(state.permission), [state.permission]);

  useEffect(() => {
    localStorage.setItem("bfv-healthcare-case", JSON.stringify(state));
  }, [state]);

  return (
    <>
      <section id="healthcare-case" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <FileHeart size={17} /> Case Study
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Healthcare Records Access Control</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              See how patients can control access to medical record hashes through permission grants, expiry, revocation, and audit trails.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Patient consent" value={state.patient.consentStatus} />
            <HeroStat label="Timer" value={`${remaining} min`} />
            <HeroStat label="Lab report" value={state.labVerification?.status ?? "Unchecked"} />
            <HeroStat label="Badge" value={state.completed ? "Earned" : "Pending"} />
          </div>
        </div>
      </section>

      <section id="patient-record" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={LockKeyhole} eyebrow="Secure vault" title="Patient wallet controls medical record access" description="The blockchain stores permissions and hashes. The actual medical data should remain in secure hospital systems." />
        <div className="grid gap-5 lg:grid-cols-3">
          <ActorCard title="Patient wallet" icon={UserRound} person={state.patient} onChange={(field, value) => setState(current => updatePatient(current, field, value))} />
          <HospitalCard hospital={state.hospital} recordHash={state.recordHash} onChange={(field, value) => setState(current => updateHospital(current, field, value))} />
          <ActorCard title="Doctor identity" icon={Stethoscope} person={state.doctor} onChange={(field, value) => setState(current => updateDoctor(current, field, value))} />
        </div>
      </section>

      <section id="doctor-access" className="section-wrap">
        <PhaseTitle icon={KeyRound} eyebrow="Doctor access request" title="Request, grant, expire, revoke, reject" description="The patient grants temporary access. The system rejects access from unauthorized wallets or expired permissions." />
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <label>
              <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Access purpose</span>
              <input value={purpose} onChange={event => setPurpose(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
            </label>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Grant minutes</span>
              <input type="number" value={minutes} onChange={event => setMinutes(Number(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => requestDoctorAccess(current, purpose))} className="btn-secondary">Request Access</button>
              <button type="button" onClick={() => setState(current => grantAccess(current, minutes))} className="btn-primary">Patient Grants Access</button>
              <button type="button" onClick={() => setState(current => expireAccessNow(current))} className="btn-secondary"><Clock size={18} /> Expire Now</button>
              <button type="button" onClick={() => setState(current => revokeAccess(current))} className="btn-secondary">Revoke Access</button>
            </div>
          </article>
          <AccessVisualization state={state} remaining={remaining} />
        </div>
      </section>

      <section id="access-verification" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={ShieldCheck} eyebrow="Verification and rejection" title="Verify lab report and reject unauthorized access" description="A doctor wallet must match active permission. Lab report integrity is verified by comparing hashes." />
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Lab report verification</h3>
            <p className="mt-3 rounded-lg bg-slate-50 p-3 leading-7 dark:bg-white/5">{state.hospital.labReport}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => verifyLabReport(current))} className="btn-primary">Verify Lab Report</button>
              <button type="button" onClick={() => setState(current => tamperLabReport(current))} className="btn-secondary"><AlertTriangle size={18} /> Tamper Lab Report</button>
            </div>
            {state.labVerification && (
              <p className={`mt-4 rounded-lg p-4 font-black ${state.labVerification.valid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
                {state.labVerification.status}
              </p>
            )}
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Unauthorized access rejection</h3>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Wallet attempting access</span>
              <input value={unauthorizedWallet} onChange={event => setUnauthorizedWallet(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm font-semibold dark:border-white/10 dark:bg-white/5" />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => checkAccess(current, state.doctor.wallet))} className="btn-secondary">Check Doctor Wallet</button>
              <button type="button" onClick={() => setState(current => checkAccess(current, unauthorizedWallet))} className="btn-primary">Attempt Unauthorized Access</button>
            </div>
            {state.unauthorizedAttempt && (
              <p className={`mt-4 rounded-lg p-4 font-black ${state.unauthorizedAttempt.allowed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
                {state.unauthorizedAttempt.message}
              </p>
            )}
          </article>
        </div>
      </section>

      <section id="healthcare-audit" className="section-wrap">
        <PhaseTitle icon={FileHeart} eyebrow="Audit trail and privacy" title="Audit access while respecting privacy limitations" description="The audit trail proves permission events, but metadata itself can still reveal patterns. Real systems must minimize what is stored on-chain." />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <AuditTrail audit={state.audit} />
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-soft dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            <AlertTriangle className="mb-4" size={30} />
            <h3 className="text-2xl font-black">Privacy limitation explanation</h3>
            <p className="mt-3 leading-8 font-bold">
              Blockchain can verify permissions and hashes, but access timestamps, wallet relationships, and metadata may reveal sensitive patterns. Medical record contents should remain encrypted and off-chain.
            </p>
          </article>
        </div>
      </section>

      <section id="healthcare-quiz" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={CheckCircle2} eyebrow="Case quiz and completion badge" title="Check healthcare access-control understanding" description="Grant access, test expiry or revocation, verify lab integrity, and understand privacy limits." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <HealthcareQuiz />
          <article className="panel p-6">
            <BadgeCheck className="mb-4 text-cyanx" size={34} />
            <h3 className="text-3xl font-black">Completion badge</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Healthcare Records Access Control</p>
            <p className={`mt-5 rounded-lg p-4 font-black ${state.completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
              {state.completed ? "Badge earned: patient granted controlled access." : "Grant access to earn the case badge."}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function ActorCard({ title, icon: Icon, person, onChange }) {
  return (
    <article className="panel p-5">
      <Icon className="mb-4 text-cyanx" size={30} />
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-4 grid gap-3">
        {Object.entries(person).map(([field, value]) => (
          <Input key={field} label={field} value={value} onChange={next => onChange(field, next)} />
        ))}
      </div>
    </article>
  );
}

function HospitalCard({ hospital, recordHash, onChange }) {
  return (
    <article className="panel p-5">
      <FileHeart className="mb-4 text-cyanx" size={30} />
      <h3 className="text-2xl font-black">Hospital record hash</h3>
      <div className="mt-4 grid gap-3">
        {Object.entries(hospital).map(([field, value]) => (
          <Input key={field} label={field} value={value} onChange={next => onChange(field, next)} />
        ))}
        <Field label="Record hash" value={hashPreview(recordHash, 18)} mono />
      </div>
    </article>
  );
}

function AccessVisualization({ state, remaining }) {
  const active = state.permission?.active && state.permission.expiresAt > Date.now();
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Access-control visualization</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <VaultNode label="Patient Vault" status={state.patient.name} active />
        <VaultNode label="Permission Ledger" status={active ? `Active · ${remaining} min` : "No active access"} active={active} />
        <VaultNode label="Doctor Portal" status={state.doctor.name} active={active} />
      </div>
      <div className="mt-5 grid gap-3">
        <Field label="Access request" value={state.accessRequest?.status ?? "No request"} />
        <Field label="Purpose" value={state.permission?.purpose ?? state.accessRequest?.purpose ?? "Not specified"} />
        <Field label="Doctor wallet allowed" value={state.permission?.doctorWallet ?? "None"} mono />
      </div>
    </article>
  );
}

function VaultNode({ label, status, active }) {
  return (
    <div className={`rounded-lg border p-4 text-center ${active ? "border-cyanx bg-cyanx/10 text-cyanx" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5"}`}>
      <LockKeyhole className="mx-auto mb-3" size={28} />
      <p className="font-black">{label}</p>
      <p className="mt-1 text-sm font-bold">{status}</p>
    </div>
  );
}

function AuditTrail({ audit }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">Healthcare audit trail</h3>
      </div>
      <div className="max-h-96 overflow-auto p-4 font-mono text-sm">
        {audit.map(item => (
          <div key={item.id} className="mb-3 text-slate-200">
            <span className="text-cyanx">[{item.time}]</span> <span className="text-emerald-300">{item.action}</span> {item.message}
          </div>
        ))}
      </div>
    </article>
  );
}

function HealthcareQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-healthcare-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = healthcareCaseQuiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-healthcare-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${healthcareCaseQuiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <h3 className="text-3xl font-black">Case score: {score}/{healthcareCaseQuiz.length}</h3>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === healthcareCaseQuiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
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

function loadHealthState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-healthcare-case") || "null");
    return stored?.patient ? stored : createHealthcareCaseState();
  } catch {
    return createHealthcareCaseState();
  }
}
