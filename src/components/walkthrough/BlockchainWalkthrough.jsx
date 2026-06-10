import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Box, CheckCircle2, MousePointer2, Route, Sparkles } from "lucide-react";
import BlockchainAssemblyScene from "../../scenes/BlockchainAssemblyScene.jsx";
import StepControls from "./StepControls.jsx";
import StepExplanationPanel from "./StepExplanationPanel.jsx";
import StepProgressBar from "./StepProgressBar.jsx";

const storageKey = "bfv-step-walkthrough";
const statusKey = "bfv-step-walkthrough-complete";

const steps = [
  {
    title: "Wallet Created",
    summary: "A learner wallet gets an address that can send or receive value.",
    what: "The app creates a wallet identity with public receiving information and private signing authority.",
    why: "A blockchain transaction needs an owner identity before anything can be authorized.",
    analogy: "Like opening a mailbox: others can send mail to the address, but only you should hold the key.",
    mistake: "Thinking the public wallet address is the same as the private key."
  },
  {
    title: "Transaction Created",
    summary: "Raw data becomes an instruction such as Alice pays Bob.",
    what: "The sender, receiver, amount, timestamp, and metadata are assembled into a transaction draft.",
    why: "Nodes need a clear, structured request before they can validate anything.",
    analogy: "Like filling out a payment form before submitting it to a bank.",
    mistake: "Assuming a drafted transaction has already moved funds."
  },
  {
    title: "Transaction Signed",
    summary: "The wallet proves the sender authorized the transaction.",
    what: "The private key creates a digital signature over the transaction details.",
    why: "A signature prevents another person from spending from your wallet without permission.",
    analogy: "Like signing a cheque so the bank knows the instruction is yours.",
    mistake: "Changing transaction details after signing; that breaks the signature."
  },
  {
    title: "Transaction Broadcasted",
    summary: "The signed transaction is sent to the network.",
    what: "The transaction leaves the wallet and is shared with nearby blockchain nodes.",
    why: "Distributed systems work by sharing the same candidate activity across many participants.",
    analogy: "Like announcing a message to a room full of independent witnesses.",
    mistake: "Believing broadcast means final confirmation."
  },
  {
    title: "Transaction Enters Mempool",
    summary: "Valid pending transactions wait before being placed into a block.",
    what: "Nodes keep the transaction in a temporary waiting area called the mempool.",
    why: "Miners or validators choose pending transactions when building the next block.",
    analogy: "Like orders waiting in a kitchen queue before being prepared.",
    mistake: "Assuming every mempool transaction is guaranteed to be included."
  },
  {
    title: "Block Created",
    summary: "Transactions are bundled into a candidate block.",
    what: "A validator groups verified transactions and adds metadata such as previous hash and timestamp.",
    why: "Blocks batch many transactions into one record that can be agreed on by the network.",
    analogy: "Like collecting many receipts onto one numbered page in an accounting book.",
    mistake: "Forgetting that a block must link to the previous block."
  },
  {
    title: "Mining / Validation",
    summary: "The candidate block is checked or secured by the network rules.",
    what: "Proof-of-work miners search for a valid nonce, or validators check rules in other consensus systems.",
    why: "Validation makes it expensive or difficult to add dishonest history.",
    analogy: "Like requiring a hard stamp of approval before a page enters the record book.",
    mistake: "Thinking mining creates transactions; it orders and secures already submitted transactions."
  },
  {
    title: "Consensus Reached",
    summary: "Enough participants agree which block is valid.",
    what: "Network nodes accept the same block according to the chain's consensus rules.",
    why: "Consensus keeps independent participants aligned without one central database owner.",
    analogy: "Like a class agreeing which answer sheet is the official one after checking the rules.",
    mistake: "Assuming one node alone decides the final chain state."
  },
  {
    title: "Block Added to Chain",
    summary: "The validated block is linked to the previous block.",
    what: "The block's hash becomes part of the chain, and future blocks will reference it.",
    why: "Hash linking makes later tampering visible because broken history changes the chain.",
    analogy: "Like sealing a new page onto the end of a numbered ledger.",
    mistake: "Editing old data as if it were a normal spreadsheet row."
  },
  {
    title: "Ledger Updated",
    summary: "All participants update their local copy of the ledger.",
    what: "Nodes synchronize the accepted block and reflect the latest balances or state.",
    why: "The network remains shared and resilient because many parties hold the updated record.",
    analogy: "Like every accountant receiving the same new ledger page.",
    mistake: "Thinking the ledger lives in only one server."
  }
];

export default function BlockchainWalkthrough() {
  const saved = useMemo(loadWalkthroughState, []);
  const [currentStep, setCurrentStep] = useState(saved.currentStep);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [selected3DObject, setSelected3DObject] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(saved.completedSteps);

  useEffect(() => {
    setCompletedSteps(current => {
      const next = Array.from(new Set([...current, currentStep])).sort((a, b) => a - b);
      localStorage.setItem(storageKey, JSON.stringify({ currentStep, completedSteps: next }));
      if (next.length === steps.length) localStorage.setItem(statusKey, "complete");
      return next;
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isAutoPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentStep(step => {
        if (step >= steps.length - 1) {
          setIsAutoPlaying(false);
          return step;
        }
        return step + 1;
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying]);

  function reset() {
    setCurrentStep(0);
    setIsAutoPlaying(false);
    setSelected3DObject(null);
    setCompletedSteps([0]);
    localStorage.setItem(storageKey, JSON.stringify({ currentStep: 0, completedSteps: [0] }));
    localStorage.removeItem(statusKey);
  }

  const complete = completedSteps.length === steps.length;

  return (
    <section id="blockchain-walkthrough" className="section-wrap bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.2),transparent_28rem),linear-gradient(135deg,#020617,#0f172a_48%,#042f2e)] text-white">
      <div className="mb-8 grid gap-6 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
            <Route size={17} /> Guided Walkthrough Mode
          </p>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">How Blockchain Works - Step by Step</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Move through the complete blockchain journey from wallet creation to synchronized ledger update, with a live 3D assembly scene that changes as each step progresses.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <WalkStat label="Current step" value={`${currentStep + 1}/10`} />
          <WalkStat label="Completed" value={`${completedSteps.length}/10`} />
          <WalkStat label="Status" value={complete ? "Complete" : "In progress"} />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-soft backdrop-blur-xl md:p-6">
        <StepProgressBar steps={steps} currentStep={currentStep} completedSteps={completedSteps} onJump={setCurrentStep} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="grid gap-4">
          <BlockchainAssemblyScene
            currentStep={currentStep}
            selectedObject={selected3DObject}
            onSelectObject={setSelected3DObject}
            onHoverObject={setHoveredObject}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
            <p className="inline-flex items-center gap-2 font-bold text-slate-200">
              <MousePointer2 size={18} className="text-cyanx" />
              {hoveredObject || "Hover particles, transactions, blocks, or nodes. Click blocks for details."}
            </p>
            <StepControls
              currentStep={currentStep}
              totalSteps={steps.length}
              isAutoPlaying={isAutoPlaying}
              onNext={() => setCurrentStep(step => Math.min(steps.length - 1, step + 1))}
              onPrevious={() => setCurrentStep(step => Math.max(0, step - 1))}
              onAutoPlay={() => setIsAutoPlaying(true)}
              onPause={() => setIsAutoPlaying(false)}
              onReset={reset}
            />
          </div>
        </motion.div>

        <div className="grid content-start gap-4">
          <StepExplanationPanel step={steps[currentStep]} currentStep={currentStep} />
          <SelectedObjectPanel object={selected3DObject} />
        </div>
      </div>
    </section>
  );
}

function SelectedObjectPanel({ object }) {
  if (!object) {
    return (
      <article className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
        <Box className="mb-4 text-cyanx" size={30} />
        <h3 className="text-2xl font-black">3D block inspector</h3>
        <p className="mt-3 leading-7 text-slate-300">Click any block cube in the assembly scene to inspect its index, hash, previous hash, and timestamp.</p>
      </article>
    );
  }

  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-cyanx/40 bg-cyanx/10 p-5 backdrop-blur-xl">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-cyanx">
        <Sparkles size={16} /> Selected block
      </p>
      <h3 className="text-2xl font-black">Block {object.index}</h3>
      <div className="mt-4 grid gap-3">
        <InspectorField label="Hash" value={object.hash} />
        <InspectorField label="Previous hash" value={object.previousHash} />
        <InspectorField label="Timestamp" value={object.timestamp} />
        <InspectorField label="Transactions" value={object.transactions} />
      </div>
    </motion.article>
  );
}

function InspectorField({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 p-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-300">{label}</p>
      <p className="break-words font-mono text-sm font-black text-white">{value}</p>
    </div>
  );
}

function WalkStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
      <p className="text-sm font-black uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 inline-flex items-center gap-2 text-3xl font-black">
        {value}
        {label === "Status" && value === "Complete" && <CheckCircle2 className="text-cyanx" size={24} />}
      </p>
    </div>
  );
}

function loadWalkthroughState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    return {
      currentStep: Number.isInteger(stored?.currentStep) ? stored.currentStep : 0,
      completedSteps: Array.isArray(stored?.completedSteps) ? stored.completedSteps : [0]
    };
  } catch {
    return { currentStep: 0, completedSteps: [0] };
  }
}
