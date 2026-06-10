import { useState } from "react";
import { quizQuestions } from "../data/content.js";
import { getStoredQuizScore, saveQuizScore } from "../utils/storage.js";

export default function Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => getStoredQuizScore());
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const question = quizQuestions[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        saveQuizScore(next);
        return next;
      });
    }
  }

  function next() {
    if (index === quizQuestions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex(current => current + 1);
    setSelected(null);
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    saveQuizScore(0);
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{finished ? "Complete" : `Question ${index + 1} of ${quizQuestions.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {finished ? (
        <div>
          <h3 className="text-3xl font-black">Final score: {score}/{quizQuestions.length}</h3>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Your best current score is saved in localStorage for this browser.</p>
          <button type="button" onClick={restart} className="btn-primary mt-6">Restart Quiz</button>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-black">{question.question}</h3>
          <div className="mt-5 grid gap-3">
            {question.options.map(option => {
              const isCorrect = selected && option === question.answer;
              const isWrong = selected === option && option !== question.answer;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  className={`rounded-lg border p-4 text-left font-bold transition ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                      : isWrong
                        ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-500/15 dark:text-red-200"
                        : "border-slate-200 bg-slate-50 hover:border-cyanx dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <p className={`mt-4 min-h-7 font-black ${selected === question.answer ? "text-emerald-600" : "text-red-500"}`}>
            {selected ? (selected === question.answer ? "Correct. Nice work." : `Not quite. Correct answer: ${question.answer}.`) : ""}
          </p>
          <button type="button" onClick={next} disabled={!selected} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">
            {index === quizQuestions.length - 1 ? "Show Score" : "Next Question"}
          </button>
        </>
      )}
    </article>
  );
}
