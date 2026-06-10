export function getStoredProgress() {
  try {
    return JSON.parse(localStorage.getItem("bfv-progress") || "[]");
  } catch {
    return [];
  }
}

export function saveProgress(progress) {
  localStorage.setItem("bfv-progress", JSON.stringify(progress));
}

export function getStoredQuizScore() {
  return Number(localStorage.getItem("bfv-quiz-score") || 0);
}

export function saveQuizScore(score) {
  localStorage.setItem("bfv-quiz-score", String(score));
}

export function shuffle(items) {
  return items
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.value);
}
