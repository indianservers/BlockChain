import { timelineSteps } from "../data/content.js";

export default function Timeline() {
  return (
    <section id="timeline" className="section-wrap">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">Timeline</p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">From raw data to shared ledger update</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">This is the beginner-friendly sequence learners should remember before studying deeper protocols.</p>
      </div>
      <div className="relative grid gap-4 lg:grid-cols-6">
        {timelineSteps.map((step, index) => (
          <article key={step.title} className="panel relative p-5">
            <div className="mb-5 flex items-center justify-between">
              <step.icon className="text-cyanx" size={26} />
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-sm font-black dark:bg-white/10">{index + 1}</span>
            </div>
            <h3 className="text-lg font-black">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
