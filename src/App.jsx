import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Blocks,
  Bookmark,
  BookOpen,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Circle,
  Command,
  CornerDownRight,
  GraduationCap,
  Home,
  Info,
  Keyboard,
  ListChecks,
  Menu,
  Moon,
  Network,
  NotebookPen,
  Search,
  ShieldCheck,
  Trash2,
  Sun,
  Type,
  X
} from "lucide-react";
import Hero from "./components/Hero.jsx";
import InteractiveLearningConsole from "./components/InteractiveLearningConsole.jsx";
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
  ["interactive-lab-console", "Live Console"],
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
  ["phase2-workbench", "Blocks"],
  ["phase2-anatomy", "Anatomy"],
  ["phase2-hash-builder", "Hash Lab"],
  ["phase2-chain-lab", "Tamper Lab"],
  ["phase2-validate", "Validate"],
  ["phase3", "Transactions"],
  ["wallet-lab", "Wallets"],
  ["transaction-builder", "Tx Builder"],
  ["transaction-tamper", "Tx Tamper"],
  ["mempool-block", "Mempool"],
  ["phase3-practice", "Tx Challenge"],
  ["phase4", "Wallets"],
  ["wallet-generator", "Wallets"],
  ["key-visualizer", "Keys"],
  ["ownership-simulator", "Ownership"],
  ["security-risk-lab", "Security"],
  ["address-send", "Send"],
  ["seed-phrase", "Seed"],
  ["phase4-practice", "Wallet Challenge"],
  ["phase5", "Mining"],
  ["mining-simulator", "Mining"],
  ["difficulty-race", "Race"],
  ["reward-energy", "Energy"],
  ["tamper-remine", "Re-mine"],
  ["phase5-practice", "Mining Challenge"],
  ["phase6", "Consensus"],
  ["node-network", "Nodes"],
  ["proposal-voting", "Voting"],
  ["consensus-voting-board", "Vote Board"],
  ["fork-lab", "Forks"],
  ["fork-split-animation", "Fork Split"],
  ["double-spend-bft", "BFT"],
  ["double-spend-alarm", "Spend Alarm"],
  ["consensus-types", "Consensus Types"],
  ["phase6-practice", "Consensus Challenge"],
  ["phase7", "Contracts"],
  ["contract-explainer", "Contract Flow"],
  ["contract-anatomy", "Contract Anatomy"],
  ["smart-contract-state-machine", "State Machine"],
  ["escrow-playground", "Escrow"],
  ["contract-use-bugs", "Bugs"],
  ["phase7-practice", "Contract Challenge"],
  ["phase8", "Tokens"],
  ["fungible-nft", "Token Types"],
  ["erc20-lab", "ERC-20"],
  ["nft-lab", "NFT"],
  ["nft-ownership-gallery-3d", "3D NFT Gallery"],
  ["marketplace-metadata", "Market"],
  ["token-standards", "Standards"],
  ["phase8-events", "Token Events"],
  ["phase8-practice", "Token Challenge"],
  ["phase9", "DeFi"],
  ["defi-flow", "DeFi Flow"],
  ["swap-liquidity", "Swap Pool"],
  ["lending-staking", "Lending"],
  ["dao-governance", "DAO"],
  ["real-world-supply", "Use Cases"],
  ["defi-risks", "Risks"],
  ["phase9-events", "DeFi Events"],
  ["phase9-practice", "DeFi Challenge"],
  ["phase10", "Final"],
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

const navGroups = [
  ["Start", ["hero", "interactive-lab-console", "learning-console", "blockchain-walkthrough", "practice"]],
  ["Core", ["phase2-workbench", "phase3", "phase4", "phase5", "phase6", "phase7", "phase8", "phase9", "phase10"]],
  ["Labs", ["transaction-journey", "hash-change-visualizer", "tamper-link-lab", "network-pulse", "ledger-sync-replay", "mempool-waiting-room", "difficulty-target-gate", "mining-race-arena", "wallet-security-simulation", "final-mission-mode"]],
  ["Cases", ["bitcoin-case", "supply-chain-case", "certificate-case", "land-registry-case", "healthcare-case", "dao-treasury-case", "defi-lending-case"]],
  ["Review", ["revision-dashboard", "capstone-flow", "integrated-labs", "security-challenge", "games", "final-assessment", "completion-export", "summary"]]
];

const navLookup = Object.fromEntries(navItems);

const mobileQuickLinks = [
  ["hero", "Home", Home],
  ["learning-console", "Console", Command],
  ["practice", "Practice", ListChecks],
  ["summary", "Summary", Award]
];

const glossaryItems = [
  ["Hash", "A digital fingerprint that changes when the input changes."],
  ["Nonce", "A number miners change while searching for a valid proof-of-work hash."],
  ["Mempool", "A waiting area for valid transactions before they enter a block."],
  ["Consensus", "A network agreement process for accepting one valid state."],
  ["Wallet", "A key-controlled identity used to sign blockchain actions."],
  ["Smart contract", "Code that runs rules and records state changes on-chain."],
  ["Liquidity pool", "Token reserves that enable decentralized swaps."],
  ["LTV", "Borrowed value compared with collateral value."]
];

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("bfv-theme-mode") || localStorage.getItem("bfv-theme") || "system");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("bfv-font-size") || "normal");
  const [density, setDensity] = useState(() => localStorage.getItem("bfv-density") || "comfortable");
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("bfv-reduced-motion") === "true");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [pinned, setPinned] = useState(() => new Set(readJson("bfv-pinned-topics", [])));
  const [notes, setNotes] = useState(() => readJson("bfv-topic-notes", {}));
  const [toast, setToast] = useState(null);
  const [completed, setCompleted] = useState(() => new Set(getStoredProgress()));
  const completionPercent = Math.round((completed.size / navItems.length) * 100);
  const lastCompleted = useMemo(() => [...completed].at(-1) || "interactive-lab-console", [completed]);
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return navItems
      .filter(([id, label]) => `${id} ${label}`.toLowerCase().includes(term))
      .slice(0, 8);
  }, [searchTerm]);
  const strongestTopics = useMemo(() => {
    const groups = navGroups.map(([name, ids]) => {
      const seen = ids.filter(id => completed.has(id)).length;
      return { name, seen, total: ids.length, percent: Math.round((seen / ids.length) * 100) };
    });
    return groups.sort((a, b) => b.percent - a.percent);
  }, [completed]);

  useEffect(() => {
    const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = theme === "dark" || (theme === "system" && systemDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
    document.documentElement.dataset.fontSize = fontSize;
    document.documentElement.dataset.density = density;
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
    localStorage.setItem("bfv-theme-mode", theme);
    localStorage.setItem("bfv-font-size", fontSize);
    localStorage.setItem("bfv-density", density);
    localStorage.setItem("bfv-reduced-motion", String(reducedMotion));
  }, [theme, fontSize, density, reducedMotion]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    localStorage.setItem("bfv-pinned-topics", JSON.stringify([...pinned]));
  }, [pinned]);

  useEffect(() => {
    localStorage.setItem("bfv-topic-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (!typing && event.key === "?") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setGlossaryOpen(false);
        setSettingsOpen(false);
        setNotesOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          setActiveId(entry.target.id);
          setCompleted(current => {
            const next = new Set(current).add(entry.target.id);
            saveProgress([...next]);
            if (!current.has(entry.target.id)) setToast(`${navLookup[entry.target.id] || "Topic"} saved`);
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
      { icon: GraduationCap, label: "Topics explored", value: `${completed.size}/${navItems.length}` }
    ],
    [completed.size]
  );

  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    setSearchTerm("");
    setMenuOpen(false);
  }

  function togglePin(id = activeId) {
    setPinned(current => {
      const next = new Set(current);
      const label = navLookup[id] || "Topic";
      if (next.has(id)) {
        next.delete(id);
        setToast(`${label} unpinned`);
      } else {
        next.add(id);
        setToast(`${label} pinned`);
      }
      return next;
    });
  }

  function updateNote(id, value) {
    setNotes(current => ({ ...current, [id]: value }));
  }

  function clearNote(id) {
    setNotes(current => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setToast("Note cleared");
  }

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

          <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Primary">
            {navGroups.map(([group, ids]) => (
              <div key={group} className="group relative">
                <button type="button" className={`inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-black transition ${ids.includes(activeId) ? "bg-cyanx/10 text-cyanx" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"}`}>
                  {group} <ChevronDown size={15} />
                </button>
                <div className="invisible absolute right-0 top-11 grid w-64 translate-y-1 gap-1 rounded-lg border border-slate-200 bg-white p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-slate-900">
                  {ids.map(id => (
                    <button key={id} type="button" onClick={() => jumpTo(id)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold transition hover:bg-slate-100 dark:hover:bg-white/10 ${activeId === id ? "text-cyanx" : "text-slate-600 dark:text-slate-300"}`}>
                      <span>{navLookup[id]}</span>
                      {completed.has(id) && <CheckCircle2 size={15} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="relative ml-auto hidden min-w-64 lg:block xl:ml-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Jump to a lab"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/10"
            />
            {searchResults.length > 0 && (
              <div className="absolute right-0 top-12 z-50 grid w-full gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-slate-900">
                {searchResults.map(([id, label]) => (
                  <button key={id} type="button" onClick={() => jumpTo(id)} className="rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10">
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a href={`#${lastCompleted}`} className="hidden h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 md:inline-flex">
            Continue
          </a>

          <button type="button" onClick={() => setGlossaryOpen(true)} className="hidden h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 md:grid" aria-label="Open glossary">
            <BookMarked size={18} />
          </button>

          <button type="button" onClick={() => togglePin()} className={`hidden h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 md:grid ${pinned.has(activeId) ? "text-cyanx" : ""}`} aria-label="Pin current topic">
            <Bookmark size={18} fill={pinned.has(activeId) ? "currentColor" : "none"} />
          </button>

          <button type="button" onClick={() => setNotesOpen(true)} className="hidden h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 md:grid" aria-label="Open notes">
            <NotebookPen size={18} />
          </button>

          <button type="button" onClick={() => setPaletteOpen(true)} className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 lg:inline-flex" aria-label="Open command palette">
            <Keyboard size={18} />
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-white/10">Ctrl K</span>
          </button>

          <button type="button" onClick={() => setSettingsOpen(true)} className="hidden h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 md:grid" aria-label="Open display settings">
            <Type size={18} />
          </button>

          <button
            type="button"
            onClick={() => setTheme(value => value === "dark" ? "light" : "dark")}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 font-bold shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          <button type="button" onClick={() => setMenuOpen(value => !value)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/10 xl:hidden" aria-label="Toggle menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950 xl:hidden">
            <div className="grid gap-2 sm:grid-cols-2">
              {navGroups.flatMap(([, ids]) => ids).map(id => (
                <button key={id} type="button" onClick={() => jumpTo(id)} className={`rounded-lg px-3 py-2 text-left text-sm font-bold ${activeId === id ? "bg-cyanx/10 text-cyanx" : "bg-slate-50 dark:bg-white/5"}`}>
                  {navLookup[id]}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="h-1 bg-slate-200 dark:bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-bluex to-cyanx"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
          />
        </div>
      </header>

      <ProgressMap groups={navGroups} completed={completed} activeId={activeId} onJump={jumpTo} />

      <main>
        <Hero stats={shellStats} />
        <InteractiveLearningConsole />
        <ProfessionalCommandCenter completionPercent={completionPercent} completed={completed} />
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

        <Summary completionPercent={completionPercent} completed={completed.size} total={navItems.length} strongestTopics={strongestTopics} pinned={[...pinned].map(id => navLookup[id] || id)} notes={notes} navLookup={navLookup} />
      </main>

      <LabNavigator />
      <MobileNav activeId={activeId} links={mobileQuickLinks} onJump={jumpTo} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} navItems={navItems} completed={completed} activeId={activeId} pinned={pinned} onJump={jumpTo} onOpenGlossary={() => setGlossaryOpen(true)} onOpenSettings={() => setSettingsOpen(true)} onOpenNotes={() => setNotesOpen(true)} onTogglePin={() => togglePin()} />
      <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      <NotesDrawer open={notesOpen} onClose={() => setNotesOpen(false)} activeId={activeId} navLookup={navLookup} notes={notes} pinned={pinned} onJump={jumpTo} onNoteChange={updateNote} onClearNote={clearNote} onTogglePin={togglePin} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} theme={theme} setTheme={setTheme} fontSize={fontSize} setFontSize={setFontSize} density={density} setDensity={setDensity} reducedMotion={reducedMotion} setReducedMotion={setReducedMotion} />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 z-50 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-black text-emerald-700 shadow-soft dark:border-emerald-500/30 dark:bg-slate-900 dark:text-emerald-200 md:bottom-4"
          >
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} /> {toast}</span>
          </motion.div>
        )}
        {!toast && completed.size > 0 && (
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

function ProgressMap({ groups, completed, activeId, onJump }) {
  return (
    <aside className="sticky top-[4.25rem] z-40 hidden border-b border-slate-200/70 bg-white/78 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 lg:block">
      <div className="mx-auto grid max-w-7xl grid-cols-5 gap-2 px-6 py-2">
        {groups.map(([name, ids]) => {
          const percent = Math.round((ids.filter(id => completed.has(id)).length / ids.length) * 100);
          const active = ids.includes(activeId);
          return (
            <button key={name} type="button" onClick={() => onJump(ids.find(id => !completed.has(id)) || ids[0])} className={`rounded-lg px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/10 ${active ? "ring-2 ring-cyanx/40" : ""}`}>
              <span className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {name}
                <span>{percent}%</span>
              </span>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <span className="block h-full rounded-full bg-gradient-to-r from-bluex to-cyanx" style={{ width: `${percent}%` }} />
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function MobileNav({ activeId, links, onJump }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-slate-200 bg-white/95 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 md:hidden" aria-label="Mobile quick navigation">
      {links.map(([id, label, Icon]) => (
        <button key={id} type="button" onClick={() => onJump(id)} className={`grid min-h-16 place-items-center gap-1 text-xs font-black ${activeId === id ? "text-cyanx" : "text-slate-500 dark:text-slate-300"}`}>
          <Icon size={19} />
          {label}
        </button>
      ))}
    </nav>
  );
}

function CommandPalette({ open, onClose, navItems, completed, activeId, pinned, onJump, onOpenGlossary, onOpenSettings, onOpenNotes, onTogglePin }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base = term
      ? navItems.filter(([id, label]) => `${id} ${label}`.toLowerCase().includes(term))
      : navItems.filter(([id]) => !completed.has(id)).slice(0, 10);
    return base.slice(0, 10);
  }, [query, navItems, completed]);

  function run(action) {
    action();
    onClose();
    setQuery("");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button type="button" aria-label="Close command palette" className="fixed inset-0 z-[90] bg-slate-950/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed left-1/2 top-16 z-[100] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-slate-950" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <Command className="text-cyanx" size={20} />
              <input
                autoFocus
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search labs, cases, tools"
                className="h-10 flex-1 bg-transparent font-bold outline-none"
              />
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close">
                <X size={17} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto p-2">
              <PaletteAction icon={BookMarked} label="Open glossary" hint="Definitions and color legend" onClick={() => run(onOpenGlossary)} />
              <PaletteAction icon={Type} label="Open display settings" hint="Theme, text size, density, motion" onClick={() => run(onOpenSettings)} />
              <PaletteAction icon={NotebookPen} label="Open notes" hint="Current topic notes and pinned topics" onClick={() => run(onOpenNotes)} />
              <PaletteAction icon={Bookmark} label={pinned.has(activeId) ? "Unpin current topic" : "Pin current topic"} hint="Save or remove this topic from pinned items" onClick={() => run(onTogglePin)} />
              {results.map(([id, label]) => (
                <PaletteAction
                  key={id}
                  icon={completed.has(id) ? CheckCircle2 : CornerDownRight}
                  label={label}
                  hint={id === activeId ? "Currently visible" : completed.has(id) ? "Saved" : "Not yet saved"}
                  onClick={() => run(() => onJump(id))}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
              <span>Ctrl K opens</span>
              <span>Esc closes</span>
              <span>? opens help</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotesDrawer({ open, onClose, activeId, navLookup, notes, pinned, onJump, onNoteChange, onClearNote, onTogglePin }) {
  const activeLabel = navLookup[activeId] || "Current topic";
  const pinnedItems = [...pinned].map(id => [id, navLookup[id] || id]);
  const notedItems = Object.entries(notes).filter(([, value]) => value?.trim());

  return (
    <Drawer open={open} onClose={onClose} title="Learner Notes" icon={NotebookPen}>
      <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Current topic</p>
            <h3 className="text-xl font-black">{activeLabel}</h3>
          </div>
          <button type="button" onClick={() => onTogglePin(activeId)} className={`grid h-10 w-10 place-items-center rounded-lg border border-slate-200 dark:border-white/10 ${pinned.has(activeId) ? "text-cyanx" : ""}`} aria-label="Pin current topic">
            <Bookmark size={18} fill={pinned.has(activeId) ? "currentColor" : "none"} />
          </button>
        </div>
        <textarea
          value={notes[activeId] || ""}
          onChange={event => onNoteChange(activeId, event.target.value)}
          rows={7}
          placeholder="Write a quick note, question, or reminder."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-semibold leading-6 outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/15 dark:border-white/10 dark:bg-white/5"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => onClearNote(activeId)} className="btn-secondary"><Trash2 size={17} /> Clear Note</button>
          <button type="button" onClick={() => onJump(activeId)} className="btn-primary">Open Topic</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <NoteList title="Pinned topics" empty="No pinned topics yet." items={pinnedItems} onJump={onJump} />
        <NoteList title="Saved notes" empty="No notes yet." items={notedItems.map(([id, value]) => [id, navLookup[id] || id, value])} onJump={onJump} showPreview />
      </div>
    </Drawer>
  );
}

function NoteList({ title, empty, items, onJump, showPreview }) {
  return (
    <section className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
      <h3 className="text-lg font-black">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map(([id, label, preview]) => (
          <button key={id} type="button" onClick={() => onJump(id)} className="rounded-lg bg-slate-50 p-3 text-left font-bold transition hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10">
            <span className="block">{label}</span>
            {showPreview && <span className="mt-1 block line-clamp-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{preview}</span>}
          </button>
        )) : <p className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">{empty}</p>}
      </div>
    </section>
  );
}

function PaletteAction({ icon: Icon, label, hint, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-white/10">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyanx/10 text-cyanx"><Icon size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-black">{label}</span>
        <span className="block truncate text-sm font-semibold text-slate-500 dark:text-slate-400">{hint}</span>
      </span>
    </button>
  );
}

function GlossaryDrawer({ open, onClose }) {
  return (
    <Drawer open={open} onClose={onClose} title="Glossary" icon={BookMarked}>
      <div className="grid gap-3">
        {glossaryItems.map(([term, definition]) => (
          <article key={term} className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
            <h3 className="font-black">{term}</h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{definition}</p>
          </article>
        ))}
      </div>
      <StatusLegend />
    </Drawer>
  );
}

function SettingsDrawer({ open, onClose, theme, setTheme, fontSize, setFontSize, density, setDensity, reducedMotion, setReducedMotion }) {
  return (
    <Drawer open={open} onClose={onClose} title="Display" icon={Type}>
      <ControlGroup label="Theme" value={theme} onChange={setTheme} options={["system", "light", "dark"]} />
      <ControlGroup label="Text size" value={fontSize} onChange={setFontSize} options={["normal", "large", "larger"]} />
      <ControlGroup label="Density" value={density} onChange={setDensity} options={["comfortable", "compact"]} />
      <label className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-4 font-black dark:bg-white/5">
        Reduced motion
        <input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} className="h-5 w-5 accent-cyanx" />
      </label>
    </Drawer>
  );
}

function ControlGroup({ label, value, onChange, options }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 font-bold capitalize dark:border-white/10 dark:bg-white/10">
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Drawer({ open, onClose, title, icon: Icon, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button type="button" aria-label="Close panel" className="fixed inset-0 z-[70] bg-slate-950/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="fixed bottom-0 right-0 top-0 z-[80] w-full max-w-md overflow-auto border-l border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-950" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-2xl font-black"><Icon className="text-cyanx" /> {title}</h2>
              <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 dark:border-white/10" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function StatusLegend() {
  const items = [
    ["Valid", "bg-emerald-500"],
    ["Pending", "bg-amber-500"],
    ["Rejected", "bg-red-500"],
    ["Confirmed", "bg-blue-500"],
    ["Warning", "bg-violet-500"]
  ];
  return (
    <div className="mt-5 rounded-lg border border-slate-200 p-4 dark:border-white/10">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400"><Info size={16} /> Status colors</p>
      <div className="grid gap-2">
        {items.map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-2 font-bold"><Circle className={`${color} rounded-full text-transparent`} size={13} /> {label}</span>
        ))}
      </div>
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
