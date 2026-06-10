const KEY = "french-study-tool-progress";

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function saveReview(cardId, rating) {
  const progress = loadProgress();
  const current = progress[cardId] || { seen: 0, score: 0 };
  const delta = rating === "good" ? 2 : rating === "hard" ? 1 : -1;
  progress[cardId] = {
    seen: current.seen + 1,
    score: Math.max(0, current.score + delta),
    lastRating: rating,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(progress));
  return progress;
}

export function resetProgress() {
  localStorage.removeItem(KEY);
}
