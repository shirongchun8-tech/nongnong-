const CUSTOM_KEY = "multi-language-word-studio-custom";
const PROGRESS_KEY = "multi-language-word-studio-progress";
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const BOX_DELAYS = {
  1: 10 * MINUTE,
  2: DAY,
  3: 3 * DAY,
  4: 7 * DAY,
  5: 15 * DAY,
  6: 30 * DAY,
};
const STATUS_LABELS = {
  unlearned: "未学习",
  unknown: "不认识",
  vague: "模糊",
  known: "认识",
};

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeLanguageId(value) {
  return ["en", "ko", "fr", "ja"].includes(value) ? value : "en";
}

function normalizeForms(forms, term) {
  const values = Array.isArray(forms)
    ? forms
    : String(forms || "")
        .split(/[,，;；\n]/)
        .map((item) => item.trim());
  const unique = values.filter(Boolean);
  if (term && !unique.includes(term)) unique.unshift(term);
  return [...new Set(unique)];
}

function normalizeCardStatus(status, lastRating = "") {
  if (status === "known" || status === "unknown" || status === "vague" || status === "unlearned") return status;
  if (status === "fuzzy") return "vague";
  if (lastRating === "known") return "known";
  if (lastRating === "unknown") return "unknown";
  if (lastRating === "fuzzy" || lastRating === "vague") return "vague";
  return "unlearned";
}

function createWordId(languageId) {
  const random = Math.random().toString(36).slice(2, 8);
  return `custom-${languageId}-${Date.now()}-${random}`;
}

export function normalizeLanguageWord(item = {}) {
  const languageId = normalizeLanguageId(item.languageId);
  const term = cleanText(item.term || item.word || item.front);
  return {
    id: cleanText(item.id) || createWordId(languageId),
    languageId,
    term,
    chinese: cleanText(item.chinese || item.back),
    pos: cleanText(item.pos) || "词汇",
    reading: cleanText(item.reading || item.ipa),
    forms: normalizeForms(item.forms, term),
    example: cleanText(item.example),
    source: cleanText(item.source) || "我的词库",
    baseTerm: cleanText(item.baseTerm),
    updatedAt: cleanText(item.updatedAt) || new Date().toISOString(),
  };
}

export function normalizeLanguageContent(content = {}) {
  const words = (Array.isArray(content.words) ? content.words : [])
    .map(normalizeLanguageWord)
    .filter((word) => word.term && word.chinese);
  return { version: 1, words };
}

export function loadLanguageContent() {
  try {
    return normalizeLanguageContent(JSON.parse(localStorage.getItem(CUSTOM_KEY)) || {});
  } catch {
    return normalizeLanguageContent();
  }
}

export function saveLanguageContent(content) {
  const normalized = normalizeLanguageContent(content);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(normalized));
  return normalized;
}

export function upsertLanguageWord(content, item) {
  const normalized = normalizeLanguageContent(content);
  const word = normalizeLanguageWord(item);
  const words = normalized.words.filter((current) => current.id !== word.id);
  return saveLanguageContent({
    words: [...words, { ...word, updatedAt: new Date().toISOString() }],
  });
}

export function deleteLanguageWord(content, id) {
  const normalized = normalizeLanguageContent(content);
  return saveLanguageContent({
    words: normalized.words.filter((word) => word.id !== id),
  });
}

export function exportLanguageContent(content, progress = loadLanguageProgress()) {
  return JSON.stringify(
    {
      ...normalizeLanguageContent(content),
      progress: normalizeLanguageProgress(progress),
    },
    null,
    2,
  );
}

export function importLanguageContent(json, current = loadLanguageContent()) {
  const parsed = JSON.parse(json);
  const incoming = normalizeLanguageContent(parsed);
  const existing = normalizeLanguageContent(current);
  const byId = new Map(existing.words.map((word) => [word.id, word]));
  for (const word of incoming.words) byId.set(word.id, word);
  if (parsed?.progress) {
    saveLanguageProgress(mergeLanguageProgress(loadLanguageProgress(), parsed.progress));
  }
  return saveLanguageContent({ words: [...byId.values()] });
}

function normalizeCardRecord(record = {}) {
  const lastRating = cleanText(record.lastRating);
  return {
    seen: Number(record.seen) || 0,
    known: Number(record.known) || 0,
    fuzzy: Number(record.fuzzy) || 0,
    unknown: Number(record.unknown) || 0,
    streak: Number(record.streak) || 0,
    box: Math.max(1, Math.min(Number(record.box) || 1, 6)),
    status: normalizeCardStatus(record.status, lastRating),
    lastRating,
    updatedAt: cleanText(record.updatedAt),
    nextReviewAt: cleanText(record.nextReviewAt),
  };
}

export function normalizeLanguageProgress(progress = {}) {
  const cards = {};
  const rawCards = progress.cards && typeof progress.cards === "object" ? progress.cards : {};
  for (const [wordId, record] of Object.entries(rawCards)) {
    if (cleanText(wordId)) cards[wordId] = normalizeCardRecord(record);
  }
  const sessions = progress.sessions && typeof progress.sessions === "object" ? progress.sessions : {};
  return { version: 1, cards, sessions };
}

export function loadLanguageProgress() {
  try {
    return normalizeLanguageProgress(JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {});
  } catch {
    return normalizeLanguageProgress();
  }
}

export function saveLanguageProgress(progress) {
  const normalized = normalizeLanguageProgress(progress);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(normalized));
  return normalized;
}

function mergeLanguageProgress(current, incoming) {
  const normalizedCurrent = normalizeLanguageProgress(current);
  const normalizedIncoming = normalizeLanguageProgress(incoming);
  return {
    version: 1,
    cards: { ...normalizedCurrent.cards, ...normalizedIncoming.cards },
    sessions: { ...normalizedCurrent.sessions, ...normalizedIncoming.sessions },
  };
}

export function nextLanguageReviewDelay(rating, nextBox = 1) {
  if (rating === "unknown") return 10 * MINUTE;
  if (rating === "fuzzy" || rating === "vague") return 6 * HOUR;
  return BOX_DELAYS[Math.max(1, Math.min(nextBox, 6))] || DAY;
}

export function rateLanguageWord(progress, wordId, rating, now = new Date()) {
  const normalized = normalizeLanguageProgress(progress);
  const current = normalized.cards[wordId] || normalizeCardRecord({ status: "new", box: 1 });
  const cleanRating = rating === "fuzzy" ? "vague" : ["known", "vague", "unknown"].includes(rating) ? rating : "vague";
  const nextBox =
    cleanRating === "known"
      ? Math.min((current.box || 1) + 1, 6)
      : cleanRating === "unknown"
        ? 1
        : Math.max(current.box || 1, 1);
  const streak = cleanRating === "known" ? (current.streak || 0) + 1 : 0;
  const nextReviewAt = new Date(now.getTime() + nextLanguageReviewDelay(cleanRating, nextBox)).toISOString();
  normalized.cards[wordId] = {
    ...current,
    seen: current.seen + 1,
    known: current.known + (cleanRating === "known" ? 1 : 0),
    fuzzy: current.fuzzy + (cleanRating === "vague" ? 1 : 0),
    unknown: current.unknown + (cleanRating === "unknown" ? 1 : 0),
    streak,
    box: nextBox,
    status: cleanRating,
    lastRating: cleanRating,
    updatedAt: now.toISOString(),
    nextReviewAt,
  };
  return saveLanguageProgress(normalized);
}

export function getLanguageCardStatus(record) {
  return record ? normalizeCardStatus(record.status, record.lastRating) : "unlearned";
}

export function languageStatusLabel(status) {
  return STATUS_LABELS[normalizeCardStatus(status)] || STATUS_LABELS.unlearned;
}

export function isLanguageReviewDue(record, now = new Date()) {
  if (!record?.nextReviewAt) return false;
  return new Date(record.nextReviewAt).getTime() <= now.getTime();
}

export function calculateLanguageStats(words, progress, now = new Date()) {
  const normalized = normalizeLanguageProgress(progress);
  const records = words.map((word) => normalized.cards[word.id]);
  const newCount = records.filter((record) => !record).length;
  const due = records.filter((record) => record && isLanguageReviewDue(record, now)).length;
  const mastered = records.filter((record) => getLanguageCardStatus(record) === "known").length;
  const learning = records.filter((record) => ["unknown", "vague"].includes(getLanguageCardStatus(record))).length;
  const difficult = records.filter((record) => record && ((record.fuzzy || 0) + (record.unknown || 0)) > (record.known || 0)).length;
  const statusCounts = getLanguageStatusCounts(words, normalized);
  return {
    total: words.length,
    due,
    newCount,
    learning,
    mastered,
    difficult,
    ...statusCounts,
  };
}

export function getLanguageStatusCounts(words, progress) {
  const normalized = normalizeLanguageProgress(progress);
  const counts = {
    total: words.length,
    unlearned: 0,
    unknown: 0,
    vague: 0,
    known: 0,
  };
  for (const word of words) {
    counts[getLanguageCardStatus(normalized.cards[word.id])] += 1;
  }
  return counts;
}
