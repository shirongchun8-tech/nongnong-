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
export const DEFAULT_DAILY_LANGUAGE_PLAN = {
  newLimit: 20,
  reviewLimit: 60,
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
  const dailyPlans = normalizeDailyPlans(progress.dailyPlans);
  return { version: 1, cards, sessions, dailyPlans };
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
    dailyPlans: { ...normalizedCurrent.dailyPlans, ...normalizedIncoming.dailyPlans },
  };
}

function cleanStringList(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(cleanText).filter(Boolean))];
}

function normalizeDailyPlan(plan = {}) {
  return {
    dateKey: cleanText(plan.dateKey),
    languageId: normalizeLanguageId(plan.languageId),
    newLimit: Number(plan.newLimit) || DEFAULT_DAILY_LANGUAGE_PLAN.newLimit,
    reviewLimit: Number(plan.reviewLimit) || DEFAULT_DAILY_LANGUAGE_PLAN.reviewLimit,
    newWordIds: cleanStringList(plan.newWordIds),
    reviewWordIds: cleanStringList(plan.reviewWordIds),
    completedNewIds: cleanStringList(plan.completedNewIds),
    completedReviewIds: cleanStringList(plan.completedReviewIds),
    updatedAt: cleanText(plan.updatedAt),
  };
}

function normalizeDailyPlans(dailyPlans = {}) {
  if (!dailyPlans || typeof dailyPlans !== "object") return {};
  return Object.fromEntries(
    Object.entries(dailyPlans)
      .map(([languageId, plan]) => [normalizeLanguageId(languageId), normalizeDailyPlan({ ...plan, languageId })])
      .filter(([, plan]) => plan.dateKey),
  );
}

export function languageDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function byPlanPriority(progress, now = new Date()) {
  return (left, right) => {
    const leftRecord = progress.cards[left.id];
    const rightRecord = progress.cards[right.id];
    const priority = (word, record) => {
      const status = getLanguageCardStatus(record);
      if (status === "unknown") return 0;
      if (status === "vague") return 1;
      if (record && isLanguageReviewDue(record, now)) return 2;
      if (status === "known") return 3;
      return 4;
    };
    return priority(left, leftRecord) - priority(right, rightRecord);
  };
}

export function ensureDailyLanguagePlan(progress, words, options = {}) {
  const normalized = normalizeLanguageProgress(progress);
  const languageId = normalizeLanguageId(options.languageId);
  const dateKey = cleanText(options.dateKey) || languageDateKey(options.now || new Date());
  const existing = normalized.dailyPlans[languageId];
  if (existing?.dateKey === dateKey) return existing;

  const newLimit = Number(options.newLimit) || DEFAULT_DAILY_LANGUAGE_PLAN.newLimit;
  const reviewLimit = Number(options.reviewLimit) || DEFAULT_DAILY_LANGUAGE_PLAN.reviewLimit;
  const now = options.now || new Date();
  const reviewWords = words
    .filter((word) => {
      const record = normalized.cards[word.id];
      const status = getLanguageCardStatus(record);
      return status === "unknown" || status === "vague" || (status === "known" && isLanguageReviewDue(record, now));
    })
    .sort(byPlanPriority(normalized, now))
    .slice(0, reviewLimit);
  const reviewWordIds = new Set(reviewWords.map((word) => word.id));
  const newWordIds = words
    .filter((word) => !reviewWordIds.has(word.id) && getLanguageCardStatus(normalized.cards[word.id]) === "unlearned")
    .slice(0, newLimit)
    .map((word) => word.id);

  return {
    dateKey,
    languageId,
    newLimit,
    reviewLimit,
    newWordIds,
    reviewWordIds: [...reviewWordIds],
    completedNewIds: [],
    completedReviewIds: [],
    updatedAt: now.toISOString(),
  };
}

export function saveDailyLanguagePlan(progress, languageId, plan) {
  const normalized = normalizeLanguageProgress(progress);
  normalized.dailyPlans[normalizeLanguageId(languageId)] = normalizeDailyPlan(plan);
  return saveLanguageProgress(normalized);
}

export function completeDailyLanguageWord(progress, languageId, wordId) {
  const normalized = normalizeLanguageProgress(progress);
  const cleanLanguageId = normalizeLanguageId(languageId);
  const plan = normalized.dailyPlans[cleanLanguageId];
  if (!plan) return normalized;
  const cleanWordId = cleanText(wordId);
  const add = (values) => (values.includes(cleanWordId) ? values : [...values, cleanWordId]);
  if (plan.newWordIds.includes(cleanWordId)) plan.completedNewIds = add(plan.completedNewIds);
  if (plan.reviewWordIds.includes(cleanWordId)) plan.completedReviewIds = add(plan.completedReviewIds);
  normalized.dailyPlans[cleanLanguageId] = normalizeDailyPlan({ ...plan, updatedAt: new Date().toISOString() });
  return saveLanguageProgress(normalized);
}

export function getDailyLanguagePlanStats(plan) {
  const normalized = normalizeDailyPlan(plan);
  const newDone = normalized.completedNewIds.filter((id) => normalized.newWordIds.includes(id)).length;
  const reviewDone = normalized.completedReviewIds.filter((id) => normalized.reviewWordIds.includes(id)).length;
  return {
    newDone,
    newTotal: normalized.newWordIds.length,
    reviewDone,
    reviewTotal: normalized.reviewWordIds.length,
    totalDone: newDone + reviewDone,
    total: normalized.newWordIds.length + normalized.reviewWordIds.length,
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
