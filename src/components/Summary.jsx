import { CheckCircle2 } from "lucide-react";

const takeaways = [
  "Blockchain is a distributed ledger.",
  "Data is stored in blocks.",
  "Blocks are connected chronologically.",
  "Many participants maintain ledger copies.",
  "Blockchain reduces dependency on central authority."
];

export default function Summary({ completionPercent, completed, total }) {
  return (
    <section id="summary" className="section-wrap">
      <div className="panel overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_.45fr]">
          <div className="p-6 md:p-8">
            <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">Learning summary</p>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">Ready for technical depth</h2>
            <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">By the end of this phase, learners should understand these foundations clearly.</p>
            <ul className="mt-7 grid gap-3">
              {takeaways.map(item => (
                <li key={item} className="flex gap-3 rounded-lg bg-slate-50 p-4 font-bold dark:bg-white/5">
                  <CheckCircle2 className="shrink-0 text-cyanx" size={22} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <aside className="grid content-center bg-gradient-to-br from-bluex to-cyanx p-8 text-white">
            <p className="text-sm font-extrabold uppercase tracking-wide text-white/80">Saved progress</p>
            <strong className="mt-3 text-6xl font-black">{completionPercent}%</strong>
            <p className="mt-3 text-lg font-bold text-white/90">{completed} of {total} sections viewed</p>
            <p className="mt-6 leading-7 text-white/85">Progress, theme, quiz score, and simulator activity are stored in localStorage. No backend required.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
