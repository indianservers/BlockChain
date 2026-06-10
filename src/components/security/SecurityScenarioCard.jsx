import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

export default function SecurityScenarioCard({ scenario, answer, onAnswer }) {
  const correct = answer && answer === scenario.answer;
  const wrong = answer && answer !== scenario.answer;
  return (
    <article className={`rounded-lg border p-5 shadow-soft ${correct ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-500/15" : wrong ? "border-red-300 bg-red-50 dark:bg-red-500/15" : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/80"}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-black">{scenario.text}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${severityClass(scenario.severity)}`}>{scenario.severity}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Safe", "Risky", "Investigate"].map(choice => (
          <button key={choice} type="button" onClick={() => onAnswer(scenario.id, choice)} className={answer === choice ? "btn-primary" : "btn-secondary"}>{choice}</button>
        ))}
      </div>
      {answer && (
        <div className="mt-4 rounded-lg bg-white/70 p-4 font-bold dark:bg-slate-950/35">
          <p className={`mb-2 inline-flex items-center gap-2 font-black ${correct ? "text-emerald-700 dark:text-emerald-200" : "text-red-700 dark:text-red-200"}`}>
            {correct ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {correct ? "Correct" : `Wrong. Correct answer: ${scenario.answer}`}
          </p>
          <p>{scenario.explanation}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-cyanx"><HelpCircle size={16} /> {scenario.lesson}</p>
        </div>
      )}
    </article>
  );
}

function severityClass(severity) {
  if (severity === "High") return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100";
  if (severity === "Medium") return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100";
}
