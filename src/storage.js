const KEY = "french-study-tool-progress";
const WORD_KEY = "french-study-tool-word-progress";
const CUSTOM_KEY = "french-study-tool-custom-content";

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

function createCustomId(type) {
  const random = Math.random().toString(36).slice(2, 8);
  return `custom-${type}-${Date.now()}-${random}`;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeForms(forms, french) {
  const values = Array.isArray(forms)
    ? forms
    : String(forms || "")
        .split(/[,，;；\n]/)
        .map((item) => item.trim());
  const unique = values.filter(Boolean);
  if (french && !unique.includes(french)) unique.unshift(french);
  return [...new Set(unique)];
}

function normalizeCustomWord(item = {}) {
  const french = cleanText(item.french || item.lemma || item.word);
  return {
    id: cleanText(item.id) || createCustomId("word"),
    french,
    chinese: cleanText(item.chinese || item.back),
    pos: cleanText(item.pos) || "自定义词汇",
    ipa: cleanText(item.ipa),
    forms: normalizeForms(item.forms, french),
    example: cleanText(item.example),
    updatedAt: cleanText(item.updatedAt) || new Date().toISOString(),
  };
}

function normalizeCustomSentence(item = {}) {
  return {
    id: cleanText(item.id) || createCustomId("sentence"),
    french: cleanText(item.french || item.front),
    chinese: cleanText(item.chinese || item.back),
    updatedAt: cleanText(item.updatedAt) || new Date().toISOString(),
  };
}

export function normalizeCustomContent(content = {}) {
  const words = (Array.isArray(content.words) ? content.words : [])
    .map(normalizeCustomWord)
    .filter((item) => item.french && item.chinese);
  const sentences = (Array.isArray(content.sentences) ? content.sentences : [])
    .map(normalizeCustomSentence)
    .filter((item) => item.french && item.chinese);
  return { version: 1, words, sentences };
}

export function loadCustomContent() {
  try {
    return normalizeCustomContent(JSON.parse(localStorage.getItem(CUSTOM_KEY)) || {});
  } catch {
    return normalizeCustomContent();
  }
}

export function saveCustomContent(content) {
  const normalized = normalizeCustomContent(content);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(normalized));
  return normalized;
}

export function upsertCustomItem(content, type, item) {
  const key = type === "sentences" ? "sentences" : "words";
  const normalized = normalizeCustomContent(content);
  const nextItem = key === "words" ? normalizeCustomWord(item) : normalizeCustomSentence(item);
  const items = normalized[key].filter((current) => current.id !== nextItem.id);
  return saveCustomContent({ ...normalized, [key]: [...items, { ...nextItem, updatedAt: new Date().toISOString() }] });
}

export function deleteCustomItem(content, type, id) {
  const key = type === "sentences" ? "sentences" : "words";
  const normalized = normalizeCustomContent(content);
  return saveCustomContent({ ...normalized, [key]: normalized[key].filter((item) => item.id !== id) });
}

export function exportCustomContent(content) {
  return JSON.stringify(normalizeCustomContent(content), null, 2);
}

export function importCustomContent(json, current = loadCustomContent()) {
  const incoming = normalizeCustomContent(JSON.parse(json));
  const existing = normalizeCustomContent(current);
  const mergeById = (left, right) => {
    const map = new Map(left.map((item) => [item.id, item]));
    for (const item of right) map.set(item.id, item);
    return [...map.values()];
  };
  return saveCustomContent({
    words: mergeById(existing.words, incoming.words),
    sentences: mergeById(existing.sentences, incoming.sentences),
  });
}
