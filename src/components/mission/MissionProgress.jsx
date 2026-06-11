export default function MissionProgress({ complete, total }) {
  const percent = Math.round((complete / total) * 100);
  return (
    <article className="panel p-5">
      <div className="mb-2 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>Mission progress</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full bg-gradient-to-r from-bluex to-cyanx transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 font-bold">{complete}/{total} mission actions complete</p>
    </article>
  );
}
