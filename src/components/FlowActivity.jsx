import { useState } from "react";
import { flowSteps } from "../data/content.js";
import { shuffle } from "../utils/storage.js";

export default function FlowActivity() {
  const [items, setItems] = useState(() => shuffle([...flowSteps]));
  const [dragged, setDragged] = useState(null);
  const [feedback, setFeedback] = useState("");

  function dropOn(targetIndex) {
    if (dragged === null || dragged === targetIndex) return;
    setItems(current => {
      const next = [...current];
      const [moved] = next.splice(dragged, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragged(null);
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems(current => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function check() {
    const correct = items.every((item, index) => item === flowSteps[index]);
    setFeedback(correct ? "Correct sequence. The blockchain flow is ready." : "Some steps are out of order. Start with transaction creation and finish with ledger update.");
  }

  return (
    <article className="panel p-6">
      <h3 className="text-2xl font-black">Arrange the blockchain flow</h3>
      <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">Drag steps into order, or use arrow keys after focusing a step.</p>
      <ol className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <li
            key={item}
            draggable
            tabIndex={0}
            onDragStart={() => setDragged(index)}
            onDragOver={event => event.preventDefault()}
            onDrop={() => dropOn(index)}
            onKeyDown={event => {
              if (event.key === "ArrowUp") move(index, -1);
              if (event.key === "ArrowDown") move(index, 1);
            }}
            className="flex cursor-grab items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 font-black focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-sm text-cyanx dark:bg-slate-900">{index + 1}</span>
            {item}
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={check} className="btn-primary">Check Answer</button>
        <button type="button" onClick={() => { setItems(shuffle([...flowSteps])); setFeedback(""); }} className="btn-secondary">Shuffle</button>
      </div>
      <p className={`mt-4 min-h-7 font-black ${feedback.startsWith("Correct") ? "text-emerald-600" : "text-red-500"}`} aria-live="polite">{feedback}</p>
    </article>
  );
}
