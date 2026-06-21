import assert from "node:assert/strict";

const memory = {};
global.localStorage = {
  getItem(key) {
    return memory[key] || null;
  },
  setItem(key, value) {
    memory[key] = String(value);
  },
  removeItem(key) {
    delete memory[key];
  },
};

import {
  calculateLanguageStats,
  deleteLanguageWord,
  exportLanguageContent,
  importLanguageContent,
  getLanguageCardStatus,
  getLanguageStatusCounts,
  loadLanguageContent,
  loadLanguageProgress,
  normalizeLanguageWord,
  rateLanguageWord,
  saveLanguageContent,
  saveLanguageProgress,
  upsertLanguageWord,
} from "../src/languageStorage.js";

const normalizedStarterWord = normalizeLanguageWord({
  id: "starter-ja-3",
  languageId: "ja",
  term: "食べ物",
  chinese: "食物",
  reading: "たべもの / tabemono",
  baseTerm: "food",
  source: "基础词",
});
assert.equal(normalizedStarterWord.baseTerm, "food");

let content = saveLanguageContent({
  words: [
    {
      id: "ko-1",
      languageId: "ko",
      term: "안녕하세요",
      chinese: "你好",
      pos: "问候语",
      reading: "annyeonghaseyo",
      forms: ["안녕하세요"],
      example: "안녕하세요, 만나서 반갑습니다.",
    },
  ],
});

assert.equal(loadLanguageContent().words[0].term, "안녕하세요");
assert.equal(loadLanguageContent().words[0].languageId, "ko");

content = upsertLanguageWord(content, {
  id: "ko-1",
  languageId: "ko",
  term: "안녕하세요",
  chinese: "你好；您好",
  pos: "问候语",
});

assert.equal(content.words.length, 1);
assert.equal(content.words[0].chinese, "你好；您好");

content = upsertLanguageWord(content, {
  languageId: "ja",
  term: "水",
  chinese: "水",
  reading: "みず / mizu",
});

assert.equal(content.words.length, 2);
assert.ok(content.words[1].id.startsWith("custom-ja-"));

content = deleteLanguageWord(content, "ko-1");
assert.equal(content.words.length, 1);
assert.equal(content.words[0].languageId, "ja");

const exported = exportLanguageContent(content);
assert.match(exported, /"term": "水"/);

const imported = importLanguageContent(exported, { words: [] });
assert.equal(imported.words[0].term, "水");
assert.equal(loadLanguageContent().words[0].term, "水");

let progress = saveLanguageProgress({ cards: {}, sessions: {} });
progress = rateLanguageWord(progress, "starter-en-0", "unknown", new Date("2026-06-12T00:00:00Z"));
assert.equal(progress.cards["starter-en-0"].status, "unknown");
assert.equal(progress.cards["starter-en-0"].box, 1);
assert.equal(progress.cards["starter-en-0"].nextReviewAt, "2026-06-12T00:10:00.000Z");
assert.equal(getLanguageCardStatus(progress.cards["starter-en-0"]), "unknown");

progress = rateLanguageWord(progress, "starter-en-0", "vague", new Date("2026-06-12T00:20:00Z"));
assert.equal(progress.cards["starter-en-0"].status, "vague");
assert.equal(progress.cards["starter-en-0"].nextReviewAt, "2026-06-12T06:20:00.000Z");
assert.equal(getLanguageCardStatus(progress.cards["starter-en-0"]), "vague");

progress = rateLanguageWord(progress, "starter-en-0", "known", new Date("2026-06-13T00:00:00Z"));
assert.equal(progress.cards["starter-en-0"].status, "known");
assert.equal(progress.cards["starter-en-0"].box, 2);
assert.equal(progress.cards["starter-en-0"].nextReviewAt, "2026-06-14T00:00:00.000Z");

progress = rateLanguageWord(progress, "starter-en-0", "known", new Date("2026-06-14T00:00:00Z"));
assert.equal(progress.cards["starter-en-0"].status, "known");
assert.equal(progress.cards["starter-en-0"].box, 3);
assert.equal(progress.cards["starter-en-0"].nextReviewAt, "2026-06-17T00:00:00.000Z");
assert.equal(loadLanguageProgress().cards["starter-en-0"].status, "known");

const stats = calculateLanguageStats(
  [
    { id: "starter-en-0" },
    { id: "starter-en-1" },
  ],
  progress,
  new Date("2026-06-18T00:00:00Z"),
);
assert.equal(stats.total, 2);
assert.equal(stats.due, 1);
assert.equal(stats.newCount, 1);
assert.equal(stats.mastered, 1);
assert.equal(stats.unlearned, 1);
assert.equal(stats.known, 1);

const statusCounts = getLanguageStatusCounts(
  [
    { id: "starter-en-0" },
    { id: "starter-en-1" },
  ],
  progress,
);
assert.deepEqual(statusCounts, {
  total: 2,
  unlearned: 1,
  unknown: 0,
  vague: 0,
  known: 1,
});
