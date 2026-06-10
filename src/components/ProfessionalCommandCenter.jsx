import { motion } from "framer-motion";
import { Activity, Bitcoin, Blocks, CheckCircle2, CircleDollarSign, FileBadge, FileCode2, FileHeart, Fingerprint, GalleryHorizontalEnd, GraduationCap, KeyRound, Landmark, Network, Pickaxe, Route, Send, ShieldCheck, Truck, Vote, WalletCards } from "lucide-react";

const phaseCards = [
  {
    title: "Phase 1",
    label: "Step-by-Step Walkthrough",
    target: "#blockchain-walkthrough",
    icon: Route,
    objective: "Follow the full blockchain lifecycle with guided controls and a 3D assembly scene.",
    metrics: ["10 steps", "3D scene", "Autoplay"]
  },
  {
    title: "Phase 1",
    label: "Transaction and Hash Diagnostics",
    target: "#transaction-journey",
    icon: Fingerprint,
    objective: "Track a transaction, compare live hash changes, highlight links, and trigger tamper recovery.",
    metrics: ["Tx journey", "Hash diff", "Tamper lab"]
  },
  {
    title: "Phase 1",
    label: "Network, Mempool and Mining Arena",
    target: "#network-pulse",
    icon: Network,
    objective: "Broadcast pulses, replay ledger sync, sort mempool transactions, and race miners through a target gate.",
    metrics: ["Broadcast", "Mempool", "Mining race"]
  },
  {
    title: "Advanced",
    label: "Wallet Security, NFT Gallery and Final Mission",
    target: "#wallet-security-simulation",
    icon: ShieldCheck,
    objective: "Practice wallet safety, inspect 3D NFT ownership, and complete the final guided mission.",
    metrics: ["Security", "3D NFTs", "Mission"]
  },
  {
    title: "Phase 1",
    label: "Foundations Lab",
    target: "#learning-tool",
    icon: Blocks,
    objective: "Build, inspect, break, and repair a simple blockchain.",
    metrics: ["Hashing", "Blocks", "Validation"]
  },
  {
    title: "Phase 2",
    label: "Block & Hash Mechanism",
    target: "#phase2-workbench",
    icon: Fingerprint,
    objective: "Trace block anatomy, previous-hash links, tampering, and repair.",
    metrics: ["Nonce", "Prev hash", "Tamper detection"]
  },
  {
    title: "Phase 3",
    label: "Transactions & Signatures",
    target: "#phase3",
    icon: Send,
    objective: "Create, sign, verify, reject, queue, and block transactions.",
    metrics: ["Mempool", "Signature", "Balance checks"]
  },
  {
    title: "Phase 4",
    label: "Wallets & Ownership",
    target: "#phase4",
    icon: WalletCards,
    objective: "Generate wallets, authorize ownership, avoid risks, and send safely.",
    metrics: ["Keys", "Address book", "Security"]
  },
  {
    title: "Phase 5",
    label: "Mining & Proof of Work",
    target: "#phase5",
    icon: Pickaxe,
    objective: "Search nonces, tune difficulty, race miners, and re-mine tampered blocks.",
    metrics: ["Nonce", "Difficulty", "Rewards"]
  },
  {
    title: "Phase 6",
    label: "Consensus Mechanisms",
    target: "#phase6",
    icon: Network,
    objective: "Control seven nodes, vote on proposals, detect attacks, and resolve forks.",
    metrics: ["Voting", "Forks", "BFT"]
  },
  {
    title: "Phase 7",
    label: "Smart Contracts",
    target: "#phase7",
    icon: FileCode2,
    objective: "Execute escrow functions, validate rules, inspect events, and avoid contract bugs.",
    metrics: ["State", "Events", "Gas"]
  },
  {
    title: "Phase 8",
    label: "Tokens & NFTs",
    target: "#phase8",
    icon: GalleryHorizontalEnd,
    objective: "Deploy tokens, mint NFTs, approve spending, list assets, and inspect metadata.",
    metrics: ["ERC-20", "ERC-721", "Marketplace"]
  },
  {
    title: "Phase 9",
    label: "DeFi, DAO & Real-World",
    target: "#phase9",
    icon: Landmark,
    objective: "Swap, pool, borrow, stake, vote, and track real-world blockchain records.",
    metrics: ["DeFi", "DAO", "Supply Chain"]
  },
  {
    title: "Phase 10",
    label: "Complete Practice Playground",
    target: "#phase10",
    icon: GraduationCap,
    objective: "Revise all phases, complete integrated labs, final assessment, badges, and export.",
    metrics: ["Assessment", "Badges", "Progress"]
  },
  {
    title: "Case Study",
    label: "Bitcoin Payment Network",
    target: "#bitcoin-case",
    icon: Bitcoin,
    objective: "Trace buyer-to-merchant payment through mempool, mining, confirmations, and settlement.",
    metrics: ["Fees", "Mining", "Settlement"]
  },
  {
    title: "Case Study",
    label: "Supply Chain Traceability",
    target: "#supply-chain-case",
    icon: Truck,
    objective: "Track product movement from manufacturer to customer with hash-linked checkpoints.",
    metrics: ["Route", "QR", "Certificate"]
  },
  {
    title: "Case Study",
    label: "Digital Certificate Verification",
    target: "#certificate-case",
    icon: FileBadge,
    objective: "Issue certificate hashes, verify integrity, detect tampering, and check revocation.",
    metrics: ["Hash", "Registry", "Employer Verify"]
  },
  {
    title: "Case Study",
    label: "Blockchain Land Registry",
    target: "#land-registry-case",
    icon: Landmark,
    objective: "Record property title hashes, verify ownership, approve sale, and transfer mutation history.",
    metrics: ["Title", "Registrar", "Mutation"]
  },
  {
    title: "Case Study",
    label: "Healthcare Records Access Control",
    target: "#healthcare-case",
    icon: FileHeart,
    objective: "Grant, expire, revoke, reject, and audit patient-controlled medical record access.",
    metrics: ["Consent", "Expiry", "Audit"]
  },
  {
    title: "Case Study",
    label: "DAO Treasury Voting",
    target: "#dao-treasury-case",
    icon: Vote,
    objective: "Create proposals, calculate voting power, meet quorum, and execute treasury payments.",
    metrics: ["Treasury", "Quorum", "Voting"]
  },
  {
    title: "Case Study",
    label: "DeFi Lending and Liquidation",
    target: "#defi-lending-case",
    icon: CircleDollarSign,
    objective: "Deposit collateral, borrow assets, monitor health factor, and simulate liquidation.",
    metrics: ["LTV", "Health factor", "Liquidation"]
  }
];

export default function ProfessionalCommandCenter({ completionPercent }) {
  return (
    <section id="learning-console" className="section-wrap tool-grid-bg pt-8">
      <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <aside className="panel overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-950 p-6 text-white dark:border-white/10">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <Activity size={17} /> Learning Console
            </p>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Blockchain Interactive Visualization Tool</h2>
            <p className="mt-3 leading-7 text-slate-300">
              A guided lab environment for practicing blockchain concepts through live state, validation engines, simulations, and challenges.
            </p>
          </div>

          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Overall completion</p>
                <p className="mt-1 text-4xl font-black">{completionPercent}%</p>
              </div>
              <div className="grid h-20 w-20 place-items-center rounded-full border-8 border-cyanx/20 bg-cyanx/10 text-xl font-black text-cyanx">
                {completionPercent}
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <motion.div className="h-full bg-gradient-to-r from-bluex to-cyanx" animate={{ width: `${completionPercent}%` }} />
            </div>

            <div className="mt-6 grid gap-3">
              {[
                ["Operate", "Use forms, buttons, and stateful labs."],
                ["Observe", "Watch hashes, signatures, links, and validation change."],
                ["Diagnose", "Find broken chains, invalid signatures, and unsafe wallet behavior."],
                ["Recover", "Repair chains, reject bad transactions, and confirm safe sends."]
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3 rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-cyanx" size={19} />
                  <p className="leading-6"><strong>{title}:</strong> {text}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="grid gap-4 md:grid-cols-2">
          {phaseCards.map(({ title, label, target, icon: Icon, objective, metrics }, index) => (
            <motion.a
              key={label}
              href={target}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.04 }}
              className="panel group flex min-h-72 flex-col p-5 transition hover:-translate-y-1 hover:border-cyanx"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-cyanx/10 text-cyanx">
                  <Icon size={25} />
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  Launch lab
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-wide text-cyanx">{title}</p>
              <h3 className="mt-1 text-2xl font-black">{label}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{objective}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {metrics.map(metric => (
                  <span key={metric} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-slate-600 dark:border-white/10 dark:text-slate-300">
                    {metric}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LabNavigator() {
  return (
    <nav className="fixed left-4 top-24 z-40 hidden w-48 rounded-lg border border-slate-200 bg-white/90 p-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 2xl:block" aria-label="Lab navigator">
      {[
        ["Console", "#learning-console", Route],
        ["Walkthrough", "#blockchain-walkthrough", Route],
        ["Tx + Hash", "#transaction-journey", Fingerprint],
        ["Network Labs", "#network-pulse", Network],
        ["Advanced", "#wallet-security-simulation", ShieldCheck],
        ["Phase 1 Tool", "#learning-tool", Blocks],
        ["Phase 2 Hash", "#phase2-workbench", Fingerprint],
        ["Phase 3 Tx", "#phase3", Send],
        ["Phase 4 Wallet", "#phase4", KeyRound],
        ["Phase 5 Mining", "#phase5", Pickaxe],
        ["Phase 6 Consensus", "#phase6", Network],
        ["Phase 7 Contracts", "#phase7", FileCode2],
        ["Phase 8 Tokens", "#phase8", GalleryHorizontalEnd],
        ["Phase 9 DeFi", "#phase9", Landmark],
        ["Phase 10 Final", "#phase10", GraduationCap],
        ["Bitcoin Case", "#bitcoin-case", Bitcoin],
        ["Supply Case", "#supply-chain-case", Truck],
        ["Certificate Case", "#certificate-case", FileBadge],
        ["Land Case", "#land-registry-case", Landmark],
        ["Healthcare Case", "#healthcare-case", FileHeart],
        ["DAO Case", "#dao-treasury-case", Vote],
        ["Lending Case", "#defi-lending-case", CircleDollarSign],
        ["Summary", "#summary", ShieldCheck]
      ].map(([label, href, Icon]) => (
        <a key={label} href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
          <Icon size={16} />
          {label}
        </a>
      ))}
    </nav>
  );
}
