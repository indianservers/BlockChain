import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle2, FileBadge, GraduationCap, KeyRound, RefreshCw, SearchCheck, ShieldCheck } from "lucide-react";
import { certificateCaseQuiz } from "../data/certificateCase.js";
import { certificateHash, createCertificateCaseState, revokeCertificate, storeCertificateHash, tamperVerificationInput, updateCertificate, updateStudent, updateVerificationInput, verifyCertificate } from "../utils/certificateCaseEngine.js";
import { hashPreview } from "../utils/blockchainEngine.js";

export default function DigitalCertificateCase() {
  const [state, setState] = useState(() => loadCertificateState());
  const issuedHash = useMemo(() => certificateHash(state.certificate), [state.certificate]);
  const verificationHash = useMemo(() => certificateHash(state.verificationInput), [state.verificationInput]);
  const stored = state.blockchainRegistry[state.certificate.certificateId];

  useEffect(() => {
    localStorage.setItem("bfv-certificate-case", JSON.stringify(state));
  }, [state]);

  return (
    <>
      <section id="certificate-case" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <FileBadge size={17} /> Case Study
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Blockchain Digital Certificate Verification</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              See how a university or training institute can issue a certificate hash, store it on-chain, and let employers detect tampering or revocation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Certificate" value={state.certificate.certificateId} />
            <HeroStat label="Registry" value={stored ? "Stored" : "Pending"} />
            <HeroStat label="Verification" value={state.verification?.status ?? "Not Run"} />
            <HeroStat label="Badge" value={state.completed ? "Earned" : "Pending"} />
          </div>
        </div>
      </section>

      <section id="student-certificate" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={GraduationCap} eyebrow="Student record and certificate data" title="Create a student certificate record" description="The certificate details are hashed. If any field changes later, the verification hash changes." />
        <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Student record</h3>
            <div className="mt-4 grid gap-3">
              <Input label="Student name" value={state.student.name} onChange={value => setState(current => updateStudent(current, "name", value))} />
              <Input label="Student ID" value={state.student.studentId} onChange={value => setState(current => updateStudent(current, "studentId", value))} />
              <Input label="Email" value={state.student.email} onChange={value => setState(current => updateStudent(current, "email", value))} />
            </div>
            <h3 className="mt-8 text-2xl font-black">Certificate data entry</h3>
            <div className="mt-4 grid gap-3">
              {["certificateId", "studentName", "course", "institute", "issueDate", "grade", "instructor"].map(field => (
                <Input key={field} label={field} value={state.certificate[field]} onChange={value => setState(current => updateCertificate(current, field, value))} />
              ))}
            </div>
          </article>
          <CertificateCard certificate={state.certificate} hash={issuedHash} />
        </div>
      </section>

      <section id="certificate-registry" className="section-wrap">
        <PhaseTitle icon={KeyRound} eyebrow="Certificate hash registry" title="Generate hash and store it on blockchain" description="The simulated blockchain stores only the certificate hash and issuer metadata, not the private student document." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Generated certificate hash</p>
            <p className="mt-3 break-all rounded-lg bg-cyanx/10 p-4 font-mono text-sm font-black text-cyanx">{issuedHash}</p>
            <button type="button" onClick={() => setState(current => storeCertificateHash(current))} className="btn-primary mt-5">Store Certificate Hash</button>
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Blockchain registry entry</h3>
            {stored ? (
              <div className="mt-4 grid gap-3">
                <Field label="Stored hash" value={hashPreview(stored.hash, 18)} mono />
                <Field label="Issuer" value={stored.issuer} />
                <Field label="Stored at" value={stored.storedAt} />
              </div>
            ) : <Empty text="No certificate hash stored yet." />}
          </article>
        </div>
      </section>

      <section id="employer-verification" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={SearchCheck} eyebrow="Employer verification portal" title="Enter certificate details and compare hashes" description="The employer recomputes the certificate hash and compares it with the blockchain registry." />
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Upload / enter certificate details</h3>
            <div className="mt-4 grid gap-3">
              {["certificateId", "studentName", "course", "institute", "issueDate", "grade", "instructor"].map(field => (
                <Input key={field} label={field} value={state.verificationInput[field]} onChange={value => setState(current => updateVerificationInput(current, field, value))} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => verifyCertificate(current))} className="btn-primary">Verify Certificate</button>
              <button type="button" onClick={() => setState(current => tamperVerificationInput(current))} className="btn-secondary"><AlertTriangle size={18} /> Tamper Grade</button>
              <button type="button" onClick={() => setState(current => revokeCertificate(current))} className="btn-secondary">Revoke Certificate</button>
            </div>
          </article>
          <VerificationPanel verification={state.verification} computedHash={verificationHash} stored={state.blockchainRegistry[state.verificationInput.certificateId]} revoked={state.revocationRegistry[state.verificationInput.certificateId]} />
        </div>
      </section>

      <section id="certificate-events" className="section-wrap">
        <PhaseTitle icon={ShieldCheck} eyebrow="Certificate event log" title="Audit issuance, verification, tampering, and revocation" description="Every important action in this case study is logged in the browser." />
        <EventConsole events={state.events} />
      </section>

      <section id="certificate-quiz" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={CheckCircle2} eyebrow="Case quiz and completion badge" title="Check digital certificate verification understanding" description="Store a certificate hash, verify a valid certificate, test tampering, and understand revocation." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <CertificateQuiz />
          <article className="panel p-6">
            <BadgeCheck className="mb-4 text-cyanx" size={34} />
            <h3 className="text-3xl font-black">Completion badge</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Blockchain Digital Certificate Verification</p>
            <p className={`mt-5 rounded-lg p-4 font-black ${state.completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
              {state.completed ? "Badge earned: valid certificate verified." : "Verify a valid stored certificate to earn badge."}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function CertificateCard({ certificate, hash }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-slate-900">
      <div className="bg-gradient-to-br from-bluex to-cyanx p-6 text-white">
        <p className="text-sm font-black uppercase tracking-wide text-white/80">Certificate of Completion</p>
        <h3 className="mt-3 text-4xl font-black">{certificate.course}</h3>
      </div>
      <div className="p-6">
        <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Awarded to</p>
        <p className="mt-1 text-3xl font-black">{certificate.studentName}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Field label="Certificate ID" value={certificate.certificateId} />
          <Field label="Institute" value={certificate.institute} />
          <Field label="Issue date" value={certificate.issueDate} />
          <Field label="Grade" value={certificate.grade} />
          <Field label="Instructor" value={certificate.instructor} />
          <Field label="Hash" value={hashPreview(hash, 18)} mono />
        </div>
      </div>
    </article>
  );
}

function VerificationPanel({ verification, computedHash, stored, revoked }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Verification animation</h3>
      <div className="mt-5 grid gap-3">
        <Step ok label="1. Details entered" />
        <Step ok label={`2. Computed hash: ${hashPreview(computedHash, 14)}`} />
        <Step ok={Boolean(stored)} label={stored ? `3. Stored hash found: ${hashPreview(stored.hash, 14)}` : "3. No stored hash found"} />
        <Step ok={!revoked} label={revoked ? "4. Certificate is revoked" : "4. Revocation check passed"} />
        <Step ok={verification?.valid} label={`5. Result: ${verification?.status ?? "Not verified"}`} />
      </div>
      {verification && (
        <p className={`mt-5 rounded-lg p-4 font-black ${verification.valid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
          {verification.valid ? "Valid certificate: hash matches and certificate is not revoked." : `${verification.status}: hash mismatch, missing registry entry, or revocation detected.`}
        </p>
      )}
    </article>
  );
}

function Step({ ok, label }) {
  return (
    <div className={`rounded-lg border p-3 font-bold ${ok ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200" : "border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200"}`}>
      {label}
    </div>
  );
}

function CertificateQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-certificate-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = certificateCaseQuiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-certificate-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${certificateCaseQuiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <h3 className="text-3xl font-black">Case score: {score}/{certificateCaseQuiz.length}</h3>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === certificateCaseQuiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function EventConsole({ events }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">Certificate event console</h3>
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

function Empty({ text }) {
  return <div className="grid min-h-32 place-items-center rounded-lg border border-dashed border-slate-300 p-5 text-center font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">{text}</div>;
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

function loadCertificateState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-certificate-case") || "null");
    return stored?.certificate ? stored : createCertificateCaseState();
  } catch {
    return createCertificateCaseState();
  }
}
