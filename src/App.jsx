import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Moon,
  Network,
  ShieldCheck,
  Sun
} from "lucide-react";
import Hero from "./components/Hero.jsx";
import ProfessionalCommandCenter, { LabNavigator } from "./components/ProfessionalCommandCenter.jsx";
import BlockchainWalkthrough from "./components/walkthrough/BlockchainWalkthrough.jsx";
import TransactionJourneyTracker from "./components/transaction/TransactionJourneyTracker.jsx";
import HashChangeVisualizer from "./components/hash/HashChangeVisualizer.jsx";
import TamperLab from "./components/hash/TamperLab.jsx";
import NetworkPulseScene from "./components/network/NetworkPulseScene.jsx";
import LedgerSyncReplay from "./components/network/LedgerSyncReplay.jsx";
import MempoolWaitingRoom from "./components/mempool/MempoolWaitingRoom.jsx";
import DifficultyTargetGate from "./components/mining/DifficultyTargetGate.jsx";
import MiningRaceArena from "./components/mining/MiningRaceArena.jsx";
import WalletSecuritySimulation from "./components/security/WalletSecuritySimulation.jsx";
import NFTGallery3D from "./components/nft/NFTGallery3D.jsx";
import FinalMissionMode from "./components/mission/FinalMissionMode.jsx";
import LearningWorkbench from "./components/LearningWorkbench.jsx";
import ThreeIntro from "./components/ThreeIntro.jsx";
import ExplanationCards from "./components/ExplanationCards.jsx";
import Comparison from "./components/Comparison.jsx";
import ConceptGrid from "./components/ConceptGrid.jsx";
import LedgerSimulator from "./components/LedgerSimulator.jsx";
import UseCaseExplorer from "./components/UseCaseExplorer.jsx";
import Timeline from "./components/Timeline.jsx";
import Quiz from "./components/Quiz.jsx";
import FlowActivity from "./components/FlowActivity.jsx";
import Phase2Lab from "./components/phase2/Phase2Lab.jsx";
import Phase3 from "./components/Phase3.jsx";
import Phase4 from "./components/Phase4.jsx";
import Phase5 from "./components/Phase5.jsx";
import Phase6 from "./components/Phase6.jsx";
import Phase7 from "./components/Phase7.jsx";
import Phase8 from "./components/Phase8.jsx";
import Phase9 from "./components/Phase9.jsx";
import Phase10 from "./components/Phase10.jsx";
import BitcoinPaymentCase from "./components/BitcoinPaymentCase.jsx";
import SupplyChainTraceCase from "./components/SupplyChainTraceCase.jsx";
import DigitalCertificateCase from "./components/DigitalCertificateCase.jsx";
import LandRegistryCase from "./components/LandRegistryCase.jsx";
import HealthcareAccessCase from "./components/HealthcareAccessCase.jsx";
import DaoTreasuryVotingCase from "./components/DaoTreasuryVotingCase.jsx";
import DefiLendingLiquidationCase from "./components/DefiLendingLiquidationCase.jsx";
import Summary from "./components/Summary.jsx";
import { getStoredProgress, saveProgress } from "./utils/storage.js";

const navItems = [
  ["hero", "Hero"],
  ["learning-console", "Console"],
  ["blockchain-walkthrough", "Walkthrough"],
  ["transaction-journey", "Tx Journey"],
  ["hash-change-visualizer", "Hash Diff"],
  ["tamper-link-lab", "Tamper Links"],
  ["network-pulse", "Network Pulse"],
  ["ledger-sync-replay", "Ledger Sync"],
  ["mempool-waiting-room", "Mempool Room"],
  ["difficulty-target-gate", "Target Gate"],
  ["mining-race-arena", "Mining Race"],
  ["learning-tool", "Tool"],
  ["intro", "3D Intro"],
  ["basics", "Basics"],
  ["compare", "Compare"],
  ["concepts", "Concepts"],
  ["ledger", "Ledger"],
  ["use-cases", "Use Cases"],
  ["timeline", "Timeline"],
  ["practice", "Practice"],
  ["phase2-workbench", "Phase 2"],
  ["phase2-anatomy", "Anatomy"],
  ["phase2-hash-builder", "Hash Lab"],
  ["phase2-chain-lab", "Tamper Lab"],
  ["phase2-validate", "Validate"],
  ["phase3", "Phase 3"],
  ["wallet-lab", "Wallets"],
  ["transaction-builder", "Tx Builder"],
  ["transaction-tamper", "Tx Tamper"],
  ["mempool-block", "Mempool"],
  ["phase3-practice", "Tx Challenge"],
  ["phase4", "Phase 4"],
  ["wallet-generator", "Wallets"],
  ["key-visualizer", "Keys"],
  ["ownership-simulator", "Ownership"],
  ["security-risk-lab", "Security"],
  ["address-send", "Send"],
  ["seed-phrase", "Seed"],
  ["phase4-practice", "Wallet Challenge"],
  ["phase5", "Phase 5"],
  ["mining-simulator", "Mining"],
  ["difficulty-race", "Race"],
  ["reward-energy", "Energy"],
  ["tamper-remine", "Re-mine"],
  ["phase5-practice", "Mining Challenge"],
  ["phase6", "Phase 6"],
  ["node-network", "Nodes"],
  ["proposal-voting", "Voting"],
  ["consensus-voting-board", "Vote Board"],
  ["fork-lab", "Forks"],
  ["fork-split-animation", "Fork Split"],
  ["double-spend-bft", "BFT"],
  ["double-spend-alarm", "Spend Alarm"],
  ["consensus-types", "Consensus Types"],
  ["phase6-practice", "Consensus Challenge"],
  ["phase7", "Phase 7"],
  ["contract-explainer", "Contract Flow"],
  ["contract-anatomy", "Contract Anatomy"],
  ["smart-contract-state-machine", "State Machine"],
  ["escrow-playground", "Escrow"],
  ["contract-use-bugs", "Bugs"],
  ["phase7-practice", "Contract Challenge"],
  ["phase8", "Phase 8"],
  ["fungible-nft", "Token Types"],
  ["erc20-lab", "ERC-20"],
  ["nft-lab", "NFT"],
  ["nft-ownership-gallery-3d", "3D NFT Gallery"],
  ["marketplace-metadata", "Market"],
  ["token-standards", "Standards"],
  ["phase8-events", "Token Events"],
  ["phase8-practice", "Token Challenge"],
  ["phase9", "Phase 9"],
  ["defi-flow", "DeFi Flow"],
  ["swap-liquidity", "Swap Pool"],
  ["lending-staking", "Lending"],
  ["dao-governance", "DAO"],
  ["real-world-supply", "Use Cases"],
  ["defi-risks", "Risks"],
  ["phase9-events", "DeFi Events"],
  ["phase9-practice", "DeFi Challenge"],
  ["phase10", "Phase 10"],
  ["wallet-security-simulation", "Wallet Security"],
  ["final-mission-mode", "Final Mission"],
  ["revision-dashboard", "Revision"],
  ["capstone-flow", "Full Flow"],
  ["integrated-labs", "Integrated Labs"],
  ["security-challenge", "Security Final"],
  ["games", "Games"],
  ["final-assessment", "Assessment"],
  ["completion-export", "Completion"],
  ["bitcoin-case", "Bitcoin Case"],
  ["btc-wallets", "BTC Wallets"],
  ["btc-transaction", "BTC Tx"],
  ["btc-mempool-mining", "BTC Mining"],
  ["btc-confirmations", "Confirmations"],
  ["btc-double-spend", "Double Spend"],
  ["btc-case-quiz", "BTC Quiz"],
  ["supply-chain-case", "Supply Case"],
  ["product-identity", "Product ID"],
  ["trace-checkpoints", "Checkpoints"],
  ["trace-verify", "QR Verify"],
  ["trace-events", "Trace Events"],
  ["trace-quiz", "Trace Quiz"],
  ["certificate-case", "Certificate Case"],
  ["student-certificate", "Certificate Data"],
  ["certificate-registry", "Registry"],
  ["employer-verification", "Verify Cert"],
  ["certificate-events", "Cert Events"],
  ["certificate-quiz", "Cert Quiz"],
  ["land-registry-case", "Land Case"],
  ["property-record", "Property"],
  ["owner-registrar", "Registrar"],
  ["buyer-transfer", "Land Transfer"],
  ["mutation-history", "Mutation"],
  ["land-risk", "Land Risk"],
  ["land-quiz", "Land Quiz"],
  ["healthcare-case", "Healthcare Case"],
  ["patient-record", "Patient Record"],
  ["doctor-access", "Access Control"],
  ["access-verification", "Access Verify"],
  ["healthcare-audit", "Health Audit"],
  ["healthcare-quiz", "Health Quiz"],
  ["dao-treasury-case", "DAO Case"],
  ["dao-dashboard", "DAO Dashboard"],
  ["dao-proposal", "Proposal"],
  ["dao-voting", "DAO Voting"],
  ["dao-execution", "Execution"],
  ["dao-risk-audit", "DAO Risk"],
  ["dao-quiz", "DAO Quiz"],
  ["defi-lending-case", "Lending Case"],
  ["lending-dashboard", "Lending Board"],
  ["collateral-borrow", "Borrow"],
  ["price-liquidation", "Liquidation"],
  ["repay-withdraw", "Repay"],
  ["lending-risk", "Lending Risk"],
  ["lending-quiz", "Lending Quiz"],
  ["summary", "Summary"]
];

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("bfv-theme") === "dark");
  const [completed, setCompleted] = useState(() => new Set(getStoredProgress()));
  const completionPercent = Math.round((completed.size / navItems.length) * 100);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("bfv-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          setCompleted(current => {
            const next = new Set(current).add(entry.target.id);
            saveProgress([...next]);
            return next;
          });
        });
      },
      { threshold: 0.35 }
    );

    navItems.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const shellStats = useMemo(
    () => [
      { icon: Network, label: "Distributed copies", value: "5 synced nodes" },
      { icon: ShieldCheck, label: "Tamper resistance", value: "Hash linked" },
      { icon: GraduationCap, label: "Beginner modules", value: `${completed.size}/${navItems.length}` }
    ],
    [completed.size]
  );

  return (
    <div className="min-h-screen bg-cloud text-slate-950 antialiased dark:bg-slate-950 dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.16),transparent_34rem),radial-gradient(circle_at_80%_12%,rgba(24,183,168,.12),transparent_30rem)]" />

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/82 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-6">
          <a href="#hero" className="flex items-center gap-3 font-extrabold">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-bluex to-cyanx text-white">
              <Blocks size={21} />
            </span>
            <span className="hidden sm:inline">Blockchain Foundations</span>
          </a>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navItems.slice(1).map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                {label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setDarkMode(value => !value)}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 font-bold shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 lg:ml-2"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
          </button>
        </div>
        <div className="h-1 bg-slate-200 dark:bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-bluex to-cyanx"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
          />
        </div>
      </header>

      <main>
        <Hero stats={shellStats} />
        <ProfessionalCommandCenter completionPercent={completionPercent} />
        <BlockchainWalkthrough />
        <TransactionJourneyTracker />
        <HashChangeVisualizer />
        <TamperLab />
        <NetworkPulseScene />
        <LedgerSyncReplay />
        <MempoolWaitingRoom />
        <DifficultyTargetGate />
        <MiningRaceArena />
        <LearningWorkbench />
        <ThreeIntro />
        <ExplanationCards />
        <Comparison />
        <ConceptGrid />
        <LedgerSimulator />
        <UseCaseExplorer />
        <Timeline />

        <section id="practice" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
          <SectionTitle eyebrow="Practice" title="Test and arrange the blockchain flow" description="Short feedback loops help students turn concepts into memory." icon={BookOpen} />
          <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
            <Quiz />
            <FlowActivity />
          </div>
        </section>

        <Phase2Lab />
        <Phase3 />
        <Phase4 />
        <Phase5 />
        <Phase6 />
        <Phase7 />
        <Phase8 />
        <NFTGallery3D />
        <Phase9 />
        <Phase10 />
        <WalletSecuritySimulation />
        <FinalMissionMode />
        <BitcoinPaymentCase />
        <SupplyChainTraceCase />
        <DigitalCertificateCase />
        <LandRegistryCase />
        <HealthcareAccessCase />
        <DaoTreasuryVotingCase />
        <DefiLendingLiquidationCase />

        <Summary completionPercent={completionPercent} completed={completed.size} total={navItems.length} />
      </main>

      <LabNavigator />

      <AnimatePresence>
        {completed.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 hidden rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-soft dark:border-white/10 dark:bg-slate-900 md:block"
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={17} className="text-cyanx" />
              {completionPercent}% progress saved
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description, icon: Icon }) {
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

export default App;
