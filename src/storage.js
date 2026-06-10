const KEY = "french-study-tool-progress";
const WORD_KEY = "french-study-tool-word-progress";

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
  localStorage.removeItem(WORD_KEY);
}

export function loadWordProgress() {
  try {
    const words = JSON.parse(localStorage.getItem(WORD_KEY)) || {};
    return { words };
  } catch {
    return { words: {} };
  }
}

export function nextReviewDelay(status, streak = 0) {
  if (status === "known") {
    return [1, 2, 4, 7, 15, 30][Math.max(0, Math.min(streak - 1, 5))] * 24 * 60 * 60 * 1000;
  }
  if (status === "fuzzy") return 6 * 60 * 60 * 1000;
  return 10 * 60 * 1000;
}

export function updateWordProgress(progress, wordKey, status, now = new Date()) {
  const next = { words: { ...(progress.words || {}) } };
  const current = next.words[wordKey] || { seen: 0, known: 0, fuzzy: 0, unknown: 0, streak: 0 };
  const streak = status === "known" ? current.streak + 1 : 0;
  const updated = {
    ...current,
    seen: current.seen + 1,
    known: current.known + (status === "known" ? 1 : 0),
    fuzzy: current.fuzzy + (status === "fuzzy" ? 1 : 0),
    unknown: current.unknown + (status === "unknown" ? 1 : 0),
    streak,
    status,
    updatedAt: now.toISOString(),
    nextReviewAt: new Date(now.getTime() + nextReviewDelay(status, streak)).toISOString(),
  };
  next.words[wordKey] = updated;
  return next;
}

export function saveWordProgress(wordKey, status) {
  const progress = updateWordProgress(loadWordProgress(), wordKey, status);
  localStorage.setItem(WORD_KEY, JSON.stringify(progress.words));
  return progress;
}

export function getWordStatus(progress, wordKey) {
  const record = progress.words?.[wordKey];
  if (!record) return "unknown";
  if (record.status === "known" && record.streak >= 2) return "known";
  if (record.status === "known") return "fuzzy";
  return record.status || "unknown";
}

export function isReviewDue(record, now = new Date()) {
  if (!record?.nextReviewAt) return true;
  return new Date(record.nextReviewAt).getTime() <= now.getTime();
}

export function isWeakWord(record, now = new Date()) {
  if (!record) return true;
  const mistakes = (record.fuzzy || 0) + (record.unknown || 0);
  const errorRate = record.seen ? mistakes / record.seen : 1;
  return record.status !== "known" || errorRate >= 0.4 || isReviewDue(record, now);
}
