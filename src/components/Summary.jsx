import { AlertTriangle, CheckCircle2, Download, FileDown, Printer, RefreshCw, Trophy } from "lucide-react";

const takeaways = [
  "Blockchain is a distributed ledger.",
  "Data is stored in blocks.",
  "Blocks are connected chronologically.",
  "Many participants maintain ledger copies.",
  "Blockchain reduces dependency on central authority."
];

export default function Summary({ completionPercent, completed, total, strongestTopics = [], pinned = [], notes = {}, navLookup = {} }) {
  const strongest = strongestTopics[0];
  const weakest = [...strongestTopics].reverse()[0];
  const savedNotes = Object.entries(notes)
    .filter(([, value]) => value?.trim())
    .map(([id, value]) => ({ topic: navLookup[id] || id, note: value }));
  const report = {
    completion: `${completionPercent}%`,
    completed,
    total,
    strongest: strongest?.name || "Start",
    focus: weakest?.name || "Practice",
    pinned,
    notes: savedNotes,
    generatedAt: new Date().toLocaleString()
  };
  const recommendations = [
    `Revisit ${weakest?.name || "Practice"} for the next hands-on run.`,
    completionPercent >= 80 ? "Use the final assessment and export controls for review." : "Use the console filters to alternate between Learn and Simulate.",
    strongest?.name ? `Use ${strongest.name} as the anchor while connecting newer concepts.` : "Start with the live console, then move into the guided walkthrough."
  ];

  function copyReport() {
    navigator.clipboard?.writeText(JSON.stringify(report, null, 2));
  }

  function downloadReport() {
    const blob = new Blob([JSON.stringify({ ...report, recommendations }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "blockchain-learning-report.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetSavedProgress() {
    if (!window.confirm("Reset saved progress for this app? Quiz and simulator data remain untouched.")) return;
    localStorage.removeItem("bfv-progress");
    window.location.reload();
  }

  return (
    <section id="summary" className="section-wrap">
      <div className="panel overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_.45fr]">
          <div className="p-6 md:p-8">
            <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">Learning summary</p>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">Ready for technical depth</h2>
            <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">By the end of this experience, learners should understand these foundations clearly.</p>
            <ul className="mt-7 grid gap-3">
              {takeaways.map(item => (
                <li key={item} className="flex gap-3 rounded-lg bg-slate-50 p-4 font-bold dark:bg-white/5">
                  <CheckCircle2 className="shrink-0 text-cyanx" size={22} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Insight icon={Trophy} title="Strongest" value={strongest?.name || "Getting started"} tone="good" />
              <Insight icon={AlertTriangle} title="Practice next" value={weakest?.name || "Explore more"} tone="warn" />
              <Insight icon={CheckCircle2} title="Badges ready" value={completionPercent >= 80 ? "Final review" : "Keep going"} tone="info" />
            </div>
            <article className="mt-6 rounded-lg border border-slate-200 p-5 dark:border-white/10">
              <h3 className="text-2xl font-black">Recommended run</h3>
              <div className="mt-4 grid gap-3">
                {recommendations.map(item => (
                  <p key={item} className="flex gap-3 rounded-lg bg-slate-50 p-3 font-bold dark:bg-white/5">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-cyanx" size={18} />
                    {item}
                  </p>
                ))}
              </div>
            </article>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Collection title="Pinned topics" items={pinned} empty="No pinned topics yet." />
              <Collection title="Saved notes" items={savedNotes.map(item => `${item.topic}: ${item.note}`)} empty="No saved notes yet." />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={copyReport} className="btn-secondary"><Download size={18} /> Copy Report</button>
              <button type="button" onClick={downloadReport} className="btn-secondary"><FileDown size={18} /> Download JSON</button>
              <button type="button" onClick={() => window.print()} className="btn-secondary"><Printer size={18} /> Print</button>
              <button type="button" onClick={resetSavedProgress} className="btn-secondary"><RefreshCw size={18} /> Reset Saved Progress</button>
            </div>
          </div>
          <aside className="grid content-center bg-gradient-to-br from-bluex to-cyanx p-8 text-white">
            <p className="text-sm font-extrabold uppercase tracking-wide text-white/80">Saved progress</p>
            <strong className="mt-3 text-6xl font-black">{completionPercent}%</strong>
            <p className="mt-3 text-lg font-bold text-white/90">{completed} of {total} topics viewed</p>
            <p className="mt-6 leading-7 text-white/85">Progress, theme, quiz score, and simulator activity are stored in localStorage. No backend required.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Collection({ title, items, empty }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
      <h3 className="font-black">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length ? items.slice(0, 4).map(item => (
          <p key={item} className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">{item}</p>
        )) : <p className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">{empty}</p>}
      </div>
    </article>
  );
}

function Insight({ icon: Icon, title, value, tone }) {
  const tones = {
    good: "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100",
    warn: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100",
    info: "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-100"
  };
  return (
    <article className={`rounded-lg p-4 ${tones[tone]}`}>
      <Icon className="mb-3" size={24} />
      <p className="text-sm font-black uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </article>
  );
}
