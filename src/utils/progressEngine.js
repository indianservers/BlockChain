export const capstoneKey = "bfv-phase10-progress";

export function loadCapstoneProgress() {
  try {
    return JSON.parse(localStorage.getItem(capstoneKey) || "null") ?? defaultCapstoneProgress();
  } catch {
    return defaultCapstoneProgress();
  }
}

export function saveCapstoneProgress(progress) {
  localStorage.setItem(capstoneKey, JSON.stringify(progress));
}

export function defaultCapstoneProgress() {
  return {
    learnerName: "",
    completed: {},
    badges: [],
    assessmentAnswers: {},
    assessmentScore: 0,
    completedAt: ""
  };
}

export function gradeFromScore(score, total) {
  const percent = total ? Math.round((score / total) * 100) : 0;
  if (percent >= 90) return "A";
  if (percent >= 75) return "B";
  if (percent >= 60) return "C";
  if (percent >= 40) return "D";
  return "Needs Practice";
}

export function exportAllProgress() {
  const all = {};
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("bfv-")) all[key] = localStorage.getItem(key);
  });
  return JSON.stringify(all, null, 2);
}

export function importAllProgress(json) {
  const parsed = JSON.parse(json);
  Object.entries(parsed).forEach(([key, value]) => {
    if (key.startsWith("bfv-")) localStorage.setItem(key, value);
  });
}

export function resetAllBfvProgress() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("bfv-")) localStorage.removeItem(key);
  });
}
