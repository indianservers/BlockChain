import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Blocks,
  CheckCircle2,
  FlaskConical,
  Hammer,
  Link2,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";
import Phase2ChainScene from "../../scenes/Phase2ChainScene.jsx";
import { anatomyFields, phase2Quiz } from "../../data/phase2.js";
import {
  addBlock,
  buildDefaultChain,
  createHash,
  repairChain,
  tamperBlock,
  validateChain
} from "../../utils/blockchainEngine.js";
import { saveQuizScore } from "../../utils/storage.js";
import BlockCard from "./BlockCard.jsx";

const savedChain = () => {
  try {
    return JSON.parse(localStorage.getItem("bfv-phase2-chain") || "null") || buildDefaultChain();
  } catch {
    return buildDefaultChain();
  }
};

export default function Phase2Lab() {
  const [chain, setChain] = useState(savedChain);
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [hashInput, setHashInput] = useState("Alice sends 2 tokens to Bob");
  const [newBlockData, setNewBlockData] = useState("New learning record");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState("");
  const [quizScore, setQuizScore] = useState(0);
  const validation = useMemo(() => validateChain(chain), [chain]);
  const activeBlock = chain[selectedBlock] ?? chain[0];
  const challengeComplete = chain.length >= 5 && validation.invalidBlocks === 0;

  function persist(next) {
    setChain(next);
    localStorage.setItem("bfv-phase2-chain", JSON.stringify(next));
  }

  function appendBlock() {
    if (!newBlockData.trim()) return;
    const next = addBlock(chain, newBlockData.trim());
    persist(next);
    setSelectedBlock(next.length - 1);
    setNewBlockData("");
  }

  function editBlock(index, data) {
    persist(tamperBlock(chain, index, data));
  }

  function repair() {
    persist(repairChain(chain));
  }

  function reset() {
    const next = buildDefaultChain();
    persist(next);
    setSelectedBlock(0);
    setNewBlockData("New learning record");
  }

  function answerQuiz(option) {
    if (quizChoice) return;
    setQuizChoice(option);
    if (option === phase2Quiz[quizIndex].answer) {
      setQuizScore(score => {
        const next = score + 1;
        saveQuizScore(next);
        return next;
      });
    }
  }

  function nextQuestion() {
    setQuizChoice("");
    setQuizIndex(index => (index + 1) % phase2Quiz.length);
  }

  return (
    <>
      <section id="phase2-workbench" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <FlaskConical size={17} /> Block & Hash Workbench
            </p>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">Block, hash, and chain mechanism</h2>
            <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Build blocks, edit data, break links, repair the chain, and watch validation respond instantly.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-white p-2 text-center shadow-soft dark:border-white/10 dark:bg-slate-900">
            <Stat label="Total" value={validation.totalBlocks} />
            <Stat label="Valid" value={validation.validBlocks} tone="good" />
            <Stat label="Invalid" value={validation.invalidBlocks} tone={validation.invalidBlocks ? "bad" : "good"} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_.75fr]">
          <div className="h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-soft dark:border-white/10">
            <Phase2ChainScene />
          </div>
          <div className="panel grid content-center gap-4 p-5">
            <LabStep icon={Blocks} title="Create blocks" text="Genesis is automatic. You add records and the engine computes each hash." />
            <LabStep icon={Link2} title="Follow links" text="A block's current hash becomes the next block's previous hash." />
            <LabStep icon={AlertTriangle} title="Tamper safely" text="Change one block's data and watch the chain report broken links." />
            <LabStep icon={Wrench} title="Repair" text="Recalculate links to rebuild a valid demonstration chain." />
          </div>
        </div>
      </section>

      <section id="phase2-anatomy" className="section-wrap">
        <ToolHeader icon={Blocks} title="Interactive block anatomy" subtitle="Select any block and inspect the moving parts that determine its hash." />
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="panel p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {chain.map(block => (
                <button key={block.index} type="button" onClick={() => setSelectedBlock(block.index)} className={selectedBlock === block.index ? "btn-primary" : "btn-secondary"}>
                  #{block.index}
                </button>
              ))}
            </div>
            <BlockCard block={activeBlock} validation={validation.results[selectedBlock]} active />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {anatomyFields.map(([field, detail]) => (
              <motion.article key={field} whileHover={{ y: -4 }} className="panel p-5">
                <p className="text-sm font-extrabold uppercase tracking-wide text-cyanx">{field}</p>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="phase2-hash-builder" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <ToolHeader icon={Sparkles} title="Hash generator and block builder" subtitle="Type any text to see a hash-like fingerprint, then add custom blocks to the chain." />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel p-5">
            <label className="block">
              <span className="mb-2 block font-black">Hash input</span>
              <textarea value={hashInput} onChange={event => setHashInput(event.target.value)} className="min-h-32 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-semibold outline-none focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5" />
            </label>
            <div className="mt-4 rounded-lg bg-slate-950 p-4 text-cyan-200">
              <p className="text-xs font-black uppercase tracking-wide text-cyan-400">Hash-like output</p>
              <p className="mt-2 break-all font-mono text-sm">{createHash(hashInput)}</p>
            </div>
          </div>
          <div className="panel p-5">
            <label className="block">
              <span className="mb-2 block font-black">New block data</span>
              <input value={newBlockData} onChange={event => setNewBlockData(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold outline-none focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5" />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={appendBlock} className="btn-primary">
                <Plus size={18} /> Add custom block
              </button>
              <button type="button" onClick={reset} className="btn-secondary">
                <RotateCcw size={18} /> Reset chain
              </button>
            </div>
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600 dark:bg-white/5 dark:text-slate-300">
              Genesis block is auto-created. Each added block receives the previous block's current hash.
            </p>
          </div>
        </div>
      </section>

      <section id="phase2-chain-lab" className="section-wrap">
        <ToolHeader icon={Link2} title="Chain linking and tamper lab" subtitle="Animated arrows show how each current hash feeds the next previous hash. Edit block data to break the mechanism." />
        <div className="panel overflow-hidden p-5">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={repair} className="btn-primary">
              <Hammer size={18} /> Repair chain simulation
            </button>
            <button type="button" onClick={reset} className="btn-secondary">
              <RotateCcw size={18} /> Reset
            </button>
            <StatusBadge valid={validation.invalidBlocks === 0} />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {chain.map((block, index) => (
              <div key={block.index} className="relative">
                <BlockCard block={block} validation={validation.results[index]} onEdit={editBlock} />
                {index < chain.length - 1 && (
                  <div className="pointer-events-none hidden xl:block">
                    <motion.div className="absolute right-[-22px] top-1/2 z-10 h-1 w-11 rounded-full bg-gradient-to-r from-bluex to-cyanx" animate={{ opacity: [0.35, 1, 0.35] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="phase2-validate" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <ToolHeader icon={ShieldCheck} title="Validation engine and 5-block challenge" subtitle="Use the engine like a dashboard: count blocks, detect invalid blocks, identify the first broken block, then build a valid five-block chain." />
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="panel p-5">
            <div className="grid gap-3">
              <ValidationRow label="Total blocks" value={validation.totalBlocks} />
              <ValidationRow label="Valid blocks" value={validation.validBlocks} />
              <ValidationRow label="Invalid blocks" value={validation.invalidBlocks} />
              <ValidationRow label="First broken block" value={validation.firstBrokenBlock === null ? "None" : `Block #${validation.firstBrokenBlock}`} />
            </div>
            <div className={`mt-5 rounded-lg p-4 font-black ${challengeComplete ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"}`}>
              {challengeComplete ? "Challenge complete: valid 5-block blockchain built." : "Challenge: build at least 5 blocks and keep every block valid."}
            </div>
          </div>
          <Phase2Quiz quizIndex={quizIndex} quizChoice={quizChoice} quizScore={quizScore} onAnswer={answerQuiz} onNext={nextQuestion} />
        </div>
      </section>
    </>
  );
}

function ToolHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-7 max-w-3xl">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
        <Icon size={17} /> Interactive tool
      </p>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">{subtitle}</p>
    </div>
  );
}

function LabStep({ icon: Icon, title, text }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <Icon className="mb-3 text-cyanx" size={24} />
      <h3 className="font-black">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-2xl font-black ${tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-red-500" : ""}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ valid }) {
  return (
    <span className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 font-black ${valid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"}`}>
      {valid ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      {valid ? "Chain valid" : "Tamper detected"}
    </span>
  );
}

function ValidationRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <span className="font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <strong className="text-xl">{value}</strong>
    </div>
  );
}

function Phase2Quiz({ quizIndex, quizChoice, quizScore, onAnswer, onNext }) {
  const question = phase2Quiz[quizIndex];

  return (
    <article className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm font-black text-slate-500 dark:text-slate-400">
        <span>Practice quiz {quizIndex + 1}/{phase2Quiz.length}</span>
        <span>Score: {quizScore}</span>
      </div>
      <h3 className="text-2xl font-black">{question.question}</h3>
      <div className="mt-5 grid gap-3">
        {question.options.map(option => {
          const correct = quizChoice && option === question.answer;
          const wrong = quizChoice === option && option !== question.answer;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onAnswer(option)}
              className={`rounded-lg border p-4 text-left font-bold transition ${
                correct
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                  : wrong
                    ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-500/15 dark:text-red-200"
                    : "border-slate-200 bg-slate-50 hover:border-cyanx dark:border-white/10 dark:bg-white/5"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <p className={`mt-4 min-h-7 font-black ${quizChoice === question.answer ? "text-emerald-600" : "text-red-500"}`}>
        {quizChoice ? (quizChoice === question.answer ? "Correct. The mechanism is clicking." : `Correct answer: ${question.answer}.`) : ""}
      </p>
      <button type="button" onClick={onNext} disabled={!quizChoice} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">
        Next
      </button>
    </article>
  );
}
