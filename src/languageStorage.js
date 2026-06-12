const CUSTOM_KEY = "multi-language-word-studio-custom";

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

export function exportLanguageContent(content) {
  return JSON.stringify(normalizeLanguageContent(content), null, 2);
}

export function importLanguageContent(json, current = loadLanguageContent()) {
  const incoming = normalizeLanguageContent(JSON.parse(json));
  const existing = normalizeLanguageContent(current);
  const byId = new Map(existing.words.map((word) => [word.id, word]));
  for (const word of incoming.words) byId.set(word.id, word);
  return saveLanguageContent({ words: [...byId.values()] });
}
