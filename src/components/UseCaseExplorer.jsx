import { useState } from "react";
import { useCases } from "../data/content.js";

export default function UseCaseExplorer() {
  const [active, setActive] = useState(useCases[0]);

  return (
    <section id="use-cases" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">Use case explorer</p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Where blockchain foundations show up</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">Different industries use the same basic pattern: shared records, verification, and lower dependency on a single authority.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {useCases.map(item => (
            <button key={item.title} type="button" onClick={() => setActive(item)} className={`panel p-5 text-left transition hover:-translate-y-1 ${active.title === item.title ? "border-cyanx ring-4 ring-cyanx/15" : ""}`}>
              <item.icon className="mb-4 text-cyanx" size={27} />
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
            </button>
          ))}
        </div>
        <aside className="panel sticky top-24 h-fit p-6">
          <p className="text-sm font-extrabold uppercase tracking-wide text-cyanx">Practical example</p>
          <h3 className="mt-2 text-3xl font-black">{active.title}</h3>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{active.example}</p>
        </aside>
      </div>
    </section>
  );
}
