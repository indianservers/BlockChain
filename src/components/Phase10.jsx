import { useMemo, useState } from "react";
import { Award, CheckCircle2, Download, FileDown, GraduationCap, Printer, RefreshCw, ShieldAlert, Trophy, Upload } from "lucide-react";
import { capstoneBadges, finalQuestions, matchingPairs, revisionPhases, securityScenarios, timelineAnswer } from "../data/phase10.js";
import { createBlock, validateChain } from "../utils/blockchainEngine.js";
import { createTransaction, initialWallets, signTransaction, verifyTransaction } from "../utils/transactionEngine.js";
import { callEscrowFunction, createEscrowContract } from "../utils/contractEngine.js";
import { createTokenState, deployERC20, deployNFTCollection, mintNFT, mintTokens } from "../utils/tokenEngine.js";
import { addLiquidity, createDeFiState, stakeTokens, swapTokens, updateLending, voteProposal, createProposal } from "../utils/defiEngine.js";
import { defaultCapstoneProgress, exportAllProgress, gradeFromScore, importAllProgress, loadCapstoneProgress, resetAllBfvProgress, saveCapstoneProgress } from "../utils/progressEngine.js";

export default function Phase10() {
  const [progress, setProgress] = useState(() => loadCapstoneProgress());
  const [message, setMessage] = useState("Start with the revision dashboard, then complete practice stations.");
  const [timeline, setTimeline] = useState(["Transaction signed", "Wallet creation", "Block built", "Ledger updated", "Mempool validation", "Mining or consensus", "Transaction created"]);
  const [matchAnswers, setMatchAnswers] = useState({});
  const [importText, setImportText] = useState("");
  const score = progress.assessmentScore;
  const grade = gradeFromScore(score, finalQuestions.length);

  function updateProgress(patch) {
    const next = typeof patch === "function" ? patch(progress) : { ...progress, ...patch };
    saveCapstoneProgress(next);
    setProgress(next);
  }

  function award(badge, key) {
    updateProgress(current => ({
      ...current,
      completed: { ...current.completed, [key]: true },
      badges: current.badges.includes(badge) ? current.badges : [...current.badges, badge]
    }));
  }

  function runEndToEndFlow() {
    const tx = signTransaction(createTransaction({ sender: "Alice", receiver: "Bob", amount: 5 }), initialWallets[0].privateKey);
    const verified = verifyTransaction(tx, initialWallets).valid;
    const genesis = createBlock(0, "Genesis", "0".repeat(64));
    const block = createBlock(1, `Tx ${tx.hash.slice(0, 8)}`, genesis.hash);
    const chainValid = validateChain([genesis, block]).invalidBlocks === 0;
    if (verified && chainValid) {
      award("Transaction Validator", "endToEnd");
      setMessage("End-to-end flow complete: wallet, transaction, signature, mempool, block, consensus, ledger update.");
    }
  }

  function runContractPractice() {
    let contract = createEscrowContract();
    contract = callEscrowFunction(contract, "deposit", "Buyer").contract;
    contract = callEscrowFunction(contract, "markDelivered", "Seller").contract;
    contract = callEscrowFunction(contract, "confirmDelivery", "Buyer").contract;
    contract = callEscrowFunction(contract, "releasePayment", "Contract").contract;
    if (contract.state === "Completed") {
      award("Smart Contract Operator", "contract");
      setMessage("Escrow, voting, and token-minting practice station completed.");
    }
  }

  function runTokenPractice() {
    let state = createTokenState();
    state = deployERC20(state, { name: "Capstone Token", symbol: "CAP" });
    state = mintTokens(state, "Alice", 100);
    state = deployNFTCollection(state, { name: "Capstone NFTs", symbol: "CNFT" });
    state = mintNFT(state, "Alice", { name: "Capstone NFT #1" });
    state = mintNFT(state, "Bob", { name: "Capstone NFT #2" });
    if (state.erc20.totalSupply === 100 && state.nft.tokens.length === 2) {
      award("Token Creator", "tokens");
      setMessage("Token and NFT practice completed.");
    }
  }

  function runDefiPractice() {
    let state = createDeFiState();
    state = swapTokens(state, "ETH", 1);
    state = addLiquidity(state, 2, 4000);
    state = updateLending(state, { borrowed: 1200 });
    state = stakeTokens(state, 40);
    state = createProposal(state, "Capstone DAO vote");
    state = voteProposal(state, "for", 70);
    award("Blockchain Strategist", "defi");
    setMessage("DeFi mini simulator completed: swap, liquidity, borrowing, staking, DAO vote.");
  }

  function completeSecurityScenario(index) {
    const badge = index <= 2 ? "Secure Wallet Operator" : "Consensus Defender";
    award(badge, `security-${index}`);
  }

  function checkMatching() {
    const correct = matchingPairs.every(([term, definition]) => matchAnswers[term] === definition);
    if (correct) {
      award("Foundation Explorer", "matching");
      setMessage("Concept matching complete.");
    } else {
      setMessage("Some concept matches are incorrect. Try again.");
    }
  }

  function checkTimeline() {
    const correct = timeline.every((item, index) => item === timelineAnswer[index]);
    if (correct) {
      award("Hash Chain Builder", "timeline");
      setMessage("Timeline builder complete.");
    } else {
      setMessage("Timeline order still needs work.");
    }
  }

  function answerQuestion(id, answer) {
    const answers = { ...progress.assessmentAnswers, [id]: answer };
    const scoreNext = finalQuestions.filter(question => answers[question.id] === question.answer).length;
    const badges = scoreNext >= 40 && !progress.badges.includes("Complete Blockchain Practitioner")
      ? [...progress.badges, "Complete Blockchain Practitioner"]
      : progress.badges;
    updateProgress({
      ...progress,
      assessmentAnswers: answers,
      assessmentScore: scoreNext,
      badges,
      completedAt: scoreNext >= 40 ? new Date().toLocaleDateString() : progress.completedAt
    });
  }

  const completion = useMemo(() => Math.round((progress.badges.length / capstoneBadges.length) * 100), [progress.badges.length]);

  return (
    <>
      <section id="phase10" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <GraduationCap size={17} /> Final Practice
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Complete Blockchain Practice Playground</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Final integrated revision, simulation, security challenge, matching game, timeline builder, 50-question assessment, badges, and completion screen.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-6">
            <p className="text-sm font-black uppercase tracking-wide text-white/70">Capstone completion</p>
            <p className="mt-2 text-6xl font-black">{completion}%</p>
            <p className="mt-3 font-bold text-slate-200">{progress.badges.length}/{capstoneBadges.length} badges earned</p>
          </div>
        </div>
      </section>

      <section id="revision-dashboard" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Award} eyebrow="Revision dashboard" title="Review every topic and earn badges" description="Launch quick revision actions and track mastery across the complete blockchain journey." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {revisionPhases.map(phase => (
            <article key={phase.title} className="panel p-5">
              <h3 className="text-2xl font-black">{phase.title}</h3>
              <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{phase.summary}</p>
              <p className={`mt-4 rounded-full px-3 py-1 text-sm font-black ${progress.badges.includes(phase.badge) ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}>
                {progress.badges.includes(phase.badge) ? "Earned" : "Badge"}: {phase.badge}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="capstone-flow" className="section-wrap">
        <PhaseTitle icon={CheckCircle2} eyebrow="End-to-end flow" title="Wallet → Transaction → Signature → Mempool → Block → Consensus → Ledger" description="Run one integrated simulation that stitches together the earlier labs." />
        <div className="panel p-5">
          <div className="grid gap-3 md:grid-cols-7">
            {timelineAnswer.map((step, index) => <FlowStep key={step} index={index + 1} label={step} />)}
          </div>
          <button type="button" onClick={runEndToEndFlow} className="btn-primary mt-5">Run Integrated Flow</button>
          <p className="mt-4 rounded-lg bg-cyanx/10 p-3 font-black text-cyanx">{message}</p>
        </div>
      </section>

      <section id="integrated-labs" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Trophy} eyebrow="Integrated practice stations" title="Contract, token, and DeFi mini labs" description="Each station runs real simulator logic from earlier topics and awards progress." />
        <div className="grid gap-4 md:grid-cols-3">
          <Station title="Smart contract scenarios" text="Complete escrow and revise voting/token minting concepts." action="Run Contract Practice" onClick={runContractPractice} />
          <Station title="Token and NFT practice" text="Deploy token, mint tokens, deploy NFT, mint two NFTs." action="Run Token Practice" onClick={runTokenPractice} />
          <Station title="DeFi mini simulator" text="Swap, add liquidity, borrow, stake, and vote." action="Run DeFi Practice" onClick={runDefiPractice} />
        </div>
      </section>

      <section id="security-challenge" className="section-wrap">
        <PhaseTitle icon={ShieldAlert} eyebrow="Blockchain security challenge" title="Diagnose threats and choose safe responses" description="Work through common failure cases that combine wallets, transactions, blocks, consensus, phishing, and NFT ownership." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {securityScenarios.map(([title, response], index) => (
            <article key={title} className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-soft dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 font-bold">{response}</p>
              <button type="button" onClick={() => completeSecurityScenario(index)} className="btn-secondary mt-4">Mark Resolved</button>
            </article>
          ))}
        </div>
      </section>

      <section id="games" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Award} eyebrow="Games" title="Concept matching and timeline builder" description="Use interactive recall to verify the sequence and vocabulary." />
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Concept matching</h3>
            <div className="mt-5 grid gap-3">
              {matchingPairs.map(([term]) => (
                <label key={term}>
                  <span className="mb-1 block font-black">{term}</span>
                  <select value={matchAnswers[term] ?? ""} onChange={event => setMatchAnswers(current => ({ ...current, [term]: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5">
                    <option value="">Choose definition</option>
                    {matchingPairs.map(([, definition]) => <option key={definition}>{definition}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <button type="button" onClick={checkMatching} className="btn-primary mt-5">Check Matching</button>
          </article>
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Timeline builder</h3>
            <div className="mt-5 grid gap-3">
              {timeline.map((item, index) => (
                <div key={item} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 font-black dark:bg-white/5">
                  <span>{index + 1}. {item}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTimeline(moveItem(timeline, index, -1))} className="btn-secondary min-h-8 px-2 py-1">↑</button>
                    <button type="button" onClick={() => setTimeline(moveItem(timeline, index, 1))} className="btn-secondary min-h-8 px-2 py-1">↓</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={checkTimeline} className="btn-primary mt-5">Check Timeline</button>
          </article>
        </div>
      </section>

      <section id="final-assessment" className="section-wrap">
        <PhaseTitle icon={GraduationCap} eyebrow="Final assessment" title="50-question blockchain assessment" description="Answer all questions to earn the Complete Blockchain Practitioner badge." />
        <div className="panel p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <input value={progress.learnerName} onChange={event => updateProgress({ ...progress, learnerName: event.target.value })} placeholder="Learner name" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
            <div className="rounded-lg bg-cyanx/10 px-4 py-3 font-black text-cyanx">Score: {score}/{finalQuestions.length} · Grade {grade}</div>
          </div>
          <div className="grid max-h-[680px] gap-4 overflow-auto pr-2">
            {finalQuestions.map(question => (
              <article key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <h3 className="font-black">{question.id}. {question.question}</h3>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {question.options.map(option => (
                    <button key={option} type="button" onClick={() => answerQuestion(question.id, option)} className={`rounded-lg border p-3 text-left font-bold ${progress.assessmentAnswers[question.id] === option ? option === question.answer ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : "border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-200" : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"}`}>
                      {option}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="completion-export" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={FileDown} eyebrow="Completion, badges, import/export" title="Save, print, export, import, or reset progress" description="The app remains browser-only. Progress export is plain JSON from LocalStorage." />
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <CompletionCard progress={progress} score={score} grade={grade} />
          <article className="panel p-5">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => navigator.clipboard?.writeText(exportAllProgress())} className="btn-secondary"><Download size={18} /> Copy Export JSON</button>
              <button type="button" onClick={() => window.print()} className="btn-secondary"><Printer size={18} /> Print / Save</button>
              <button type="button" onClick={() => { resetAllBfvProgress(); updateProgress(defaultCapstoneProgress()); }} className="btn-secondary"><RefreshCw size={18} /> Reset All Progress</button>
            </div>
            <textarea value={importText} onChange={event => setImportText(event.target.value)} placeholder="Paste exported progress JSON here" rows={8} className="mt-5 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-white/10 dark:bg-white/5" />
            <button type="button" onClick={() => { importAllProgress(importText); setProgress(loadCapstoneProgress()); }} className="btn-primary mt-3"><Upload size={18} /> Import Progress JSON</button>
          </article>
        </div>
      </section>
    </>
  );

}

function CompletionCard({ progress, score, grade }) {
  return (
    <article className="panel p-6">
      <p className="text-sm font-black uppercase tracking-wide text-cyanx">Completion screen</p>
      <h3 className="mt-2 text-4xl font-black">{progress.learnerName || "Learner"}</h3>
      <p className="mt-3 text-2xl font-black">Score: {score}/50 · Grade {grade}</p>
      <p className="mt-2 font-bold text-slate-600 dark:text-slate-300">Date: {progress.completedAt || new Date().toLocaleDateString()}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {capstoneBadges.map(badge => (
          <span key={badge} className={`rounded-full px-3 py-1 text-sm font-black ${progress.badges.includes(badge) ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}>
            {badge}
          </span>
        ))}
      </div>
    </article>
  );
}

function FlowStep({ index, label }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-white/10 dark:bg-white/5">
      <span className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg bg-cyanx/10 font-black text-cyanx">{index}</span>
      <p className="text-sm font-black">{label}</p>
    </div>
  );
}

function Station({ title, text, action, onClick }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
      <button type="button" onClick={onClick} className="btn-primary mt-5">{action}</button>
    </article>
  );
}

function moveItem(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
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
