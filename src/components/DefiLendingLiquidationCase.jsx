import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Banknote, CheckCircle2, CircleDollarSign, Gauge, RefreshCw, TrendingDown, WalletCards } from "lucide-react";
import { defiLendingCaseQuiz } from "../data/defiLendingCase.js";
import {
  borrowAsset,
  createDefiLendingState,
  depositCollateral,
  lendingMetrics,
  partialLiquidation,
  repayLoan,
  resetDefiLendingCase,
  simulatePriceDrop,
  updatePrice,
  withdrawCollateral
} from "../utils/defiLendingCaseEngine.js";

export default function DefiLendingLiquidationCase() {
  const [state, setState] = useState(() => loadLendingState());
  const [amounts, setAmounts] = useState({ deposit: 1, borrow: 1000, priceDrop: 30, repay: 1000, withdraw: 0.5 });
  const metrics = useMemo(() => lendingMetrics(state), [state]);

  useEffect(() => {
    localStorage.setItem("bfv-defi-lending-case", JSON.stringify(state));
  }, [state]);

  return (
    <>
      <section id="defi-lending-case" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <CircleDollarSign size={17} /> Case Study
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">DeFi Lending and Liquidation</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Practice how collateralized loans work, why price drops reduce safety, and how liquidation protects lenders when health factor falls too low.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Collateral value" value={`$${metrics.collateralValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
            <HeroStat label="Borrowed" value={`$${state.position.borrowed.toLocaleString()}`} />
            <HeroStat label="Health factor" value={formatHealth(metrics.healthFactor)} />
            <HeroStat label="Badge" value={state.completed ? "Earned" : "Pending"} />
          </div>
        </div>
      </section>

      <section id="lending-dashboard" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Gauge} eyebrow="DeFi dashboard" title="Collateral, debt, LTV, and health factor" description="A lending protocol lets users borrow assets after depositing collateral. The health factor moves as debt, collateral, and price change." />
        <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard title="Deposited collateral" value={`${state.position.collateral.toFixed(4)} ${state.market.collateralAsset}`} note={`Price: $${state.market.collateralPrice.toLocaleString()}`} icon={WalletCards} />
            <MetricCard title="Borrowed asset" value={`$${state.position.borrowed.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} note={state.market.borrowAsset} icon={Banknote} />
            <MetricCard title="Loan-to-value" value={`${Math.round(metrics.ltv * 100)}%`} note="Borrowed amount / collateral value" icon={CircleDollarSign} />
            <MetricCard title="Liquidation threshold" value={`${Math.round(state.market.liquidationThreshold * 100)}%`} note="Debt becomes unsafe near this level" icon={AlertTriangle} />
          </div>
          <HealthMeter metrics={metrics} />
        </div>
      </section>

      <section id="collateral-borrow" className="section-wrap">
        <PhaseTitle icon={WalletCards} eyebrow="Deposit and borrow" title="Open a collateralized loan position" description="Deposit collateral first, then borrow. Borrowing too much lowers the health factor and increases liquidation risk." />
        <div className="grid gap-5 lg:grid-cols-2">
          <ActionPanel
            title="Deposit collateral"
            label={`Amount (${state.market.collateralAsset})`}
            value={amounts.deposit}
            onChange={value => setAmounts(current => ({ ...current, deposit: Number(value) }))}
            button="Deposit Collateral"
            onAction={() => setState(current => depositCollateral(current, amounts.deposit))}
          />
          <ActionPanel
            title="Borrow asset"
            label={`Amount (${state.market.borrowAsset})`}
            value={amounts.borrow}
            onChange={value => setAmounts(current => ({ ...current, borrow: Number(value) }))}
            button="Borrow Asset"
            onAction={() => setState(current => borrowAsset(current, amounts.borrow))}
          />
        </div>
      </section>

      <section id="price-liquidation" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={TrendingDown} eyebrow="Price drop simulator" title="Trigger liquidation by reducing collateral value" description="If collateral price falls, the same debt is backed by less value. When health factor drops below 1, liquidators can repay part of the debt and seize collateral." />
        <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <article className="panel p-5">
            <h3 className="text-2xl font-black">Collateral price controls</h3>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Current ETH price</span>
              <input type="range" min="500" max="3500" step="50" value={state.market.collateralPrice} onChange={event => setState(current => updatePrice(current, Number(event.target.value)))} className="w-full" />
              <span className="mt-2 block font-black">${state.market.collateralPrice.toLocaleString()}</span>
            </label>
            <label className="mt-5 block">
              <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Drop percent</span>
              <input type="number" value={amounts.priceDrop} onChange={event => setAmounts(current => ({ ...current, priceDrop: Number(event.target.value) }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => simulatePriceDrop(current, amounts.priceDrop))} className="btn-secondary"><TrendingDown size={18} /> Simulate Price Drop</button>
              <button type="button" onClick={() => setState(current => partialLiquidation(current))} className="btn-primary">Partial Liquidation</button>
            </div>
          </article>
          <LiquidationPanel state={state} metrics={metrics} />
        </div>
      </section>

      <section id="repay-withdraw" className="section-wrap">
        <PhaseTitle icon={Banknote} eyebrow="Recover position" title="Repay loan and withdraw collateral safely" description="Repaying debt improves health factor. Withdrawing collateral is rejected if it would make the remaining position too risky." />
        <div className="grid gap-5 lg:grid-cols-2">
          <ActionPanel
            title="Repay loan"
            label={`Amount (${state.market.borrowAsset})`}
            value={amounts.repay}
            onChange={value => setAmounts(current => ({ ...current, repay: Number(value) }))}
            button="Repay Loan"
            onAction={() => setState(current => repayLoan(current, amounts.repay))}
          />
          <ActionPanel
            title="Withdraw collateral"
            label={`Amount (${state.market.collateralAsset})`}
            value={amounts.withdraw}
            onChange={value => setAmounts(current => ({ ...current, withdraw: Number(value) }))}
            button="Withdraw Collateral"
            onAction={() => setState(current => withdrawCollateral(current, amounts.withdraw))}
          />
        </div>
      </section>

      <section id="lending-risk" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={AlertTriangle} eyebrow="Risk explanation" title="Collateralized loans are powerful, but price risk is real" description="DeFi lending can be transparent and automated, but borrowers must monitor volatility, liquidation thresholds, oracle prices, and smart contract risk." />
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-soft dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            <AlertTriangle className="mb-4" size={34} />
            <h3 className="text-2xl font-black">What liquidation means</h3>
            <p className="mt-3 leading-8 font-bold">
              Liquidation is not a punishment. It is an automated safety mechanism: if collateral no longer safely backs the loan, a liquidator repays part of the debt and receives collateral plus a bonus.
            </p>
            <p className="mt-5 rounded-lg bg-white/60 p-4 font-black dark:bg-white/10">
              Keep health factor above 1.15 in this lab. Below 1.00, partial liquidation becomes available.
            </p>
          </article>
          <EventLog events={state.events} />
        </div>
      </section>

      <section id="lending-quiz" className="section-wrap">
        <PhaseTitle icon={CheckCircle2} eyebrow="Case quiz and badge" title="Check DeFi lending and liquidation understanding" description="Review collateral, borrowing, LTV, health factor, liquidation threshold, partial liquidation, repayment, and withdrawal." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <LendingQuiz />
          <article className="panel p-6">
            <BadgeCheck className="mb-4 text-cyanx" size={34} />
            <h3 className="text-3xl font-black">Completion badge</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">DeFi Lending and Liquidation</p>
            <p className={`mt-5 rounded-lg p-4 font-black ${state.completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
              {state.completed ? "Badge earned: liquidation or full repayment completed." : "Trigger partial liquidation or fully repay the loan to earn the case badge."}
            </p>
            <button type="button" onClick={() => setState(resetDefiLendingCase())} className="btn-secondary mt-5"><RefreshCw size={18} /> Reset Lending Case</button>
          </article>
        </div>
      </section>
    </>
  );
}

function HealthMeter({ metrics }) {
  const display = metrics.healthFactor === Infinity ? 100 : Math.min(100, Math.round((metrics.healthFactor / 2) * 100));
  const tone = metrics.liquidatable ? "from-red-500 to-red-600" : metrics.liquidationRisk ? "from-amber-400 to-orange-500" : "from-emerald-400 to-cyanx";
  return (
    <article className="panel p-6">
      <Gauge className="mb-4 text-cyanx" size={34} />
      <h3 className="text-3xl font-black">Dynamic health-factor meter</h3>
      <div className="mt-6 h-6 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className={`h-full bg-gradient-to-r ${tone} transition-all`} style={{ width: `${display}%` }} />
      </div>
      <p className="mt-5 text-5xl font-black">{formatHealth(metrics.healthFactor)}</p>
      <p className={`mt-3 rounded-lg p-4 font-black ${metrics.liquidatable ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200" : metrics.liquidationRisk ? "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"}`}>
        {metrics.liquidatable ? "Liquidation available" : metrics.liquidationRisk ? "Risky position" : "Healthy position"}
      </p>
    </article>
  );
}

function MetricCard({ title, value, note, icon: Icon }) {
  return (
    <article className="panel p-5">
      <Icon className="mb-4 text-cyanx" size={30} />
      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-2 text-3xl font-black">{value}</h3>
      <p className="mt-3 font-bold text-slate-600 dark:text-slate-300">{note}</p>
    </article>
  );
}

function ActionPanel({ title, label, value, onChange, button, onAction }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">{title}</h3>
      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
        <input type="number" value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
      </label>
      <button type="button" onClick={onAction} className="btn-primary mt-5">{button}</button>
    </article>
  );
}

function LiquidationPanel({ state, metrics }) {
  const maxSafeDebt = metrics.collateralValue * state.market.liquidationThreshold;
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Liquidation threshold</h3>
      <div className="mt-5 grid gap-3">
        <Field label="Collateral value" value={`$${metrics.collateralValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <Field label="Borrowed" value={`$${state.position.borrowed.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <Field label="Max debt before HF = 1" value={`$${maxSafeDebt.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <Field label="Liquidation bonus" value={`${Math.round(state.market.liquidationBonus * 100)}% collateral bonus`} />
      </div>
      <p className={`mt-5 rounded-lg p-4 font-black ${metrics.liquidatable ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"}`}>
        {metrics.liquidatable ? "Health factor below 1: partial liquidation can run." : "Health factor above 1: liquidation is blocked."}
      </p>
    </article>
  );
}

function EventLog({ events }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">Lending event log</h3>
      </div>
      <div className="max-h-96 overflow-auto p-4 font-mono text-sm">
        {events.map(item => (
          <div key={item.id} className="mb-3 text-slate-200">
            <span className="text-cyanx">[{item.time}]</span> <span className="text-emerald-300">{item.name}</span> {item.message}
          </div>
        ))}
      </div>
    </article>
  );
}

function LendingQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-defi-lending-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = defiLendingCaseQuiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-defi-lending-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${defiLendingCaseQuiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <h3 className="text-3xl font-black">Case score: {score}/{defiLendingCaseQuiz.length}</h3>
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
          <button type="button" disabled={!selected} onClick={() => { if (index === defiLendingCaseQuiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="break-words font-black">{value}</p>
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

function loadLendingState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-defi-lending-case") || "null");
    return stored?.market ? stored : createDefiLendingState();
  } catch {
    return createDefiLendingState();
  }
}

function formatHealth(value) {
  return value === Infinity ? "No debt" : value.toFixed(2);
}
