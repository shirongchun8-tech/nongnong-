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
  deleteCustomItem,
  exportCustomContent,
  getWordStatus,
  importCustomContent,
  isReviewDue,
  loadCustomContent,
  nextReviewDelay,
  saveCustomContent,
  updateWordProgress,
  upsertCustomItem,
} from "../src/storage.js";

assert.equal(nextReviewDelay("known", 1), 24 * 60 * 60 * 1000);
assert.equal(nextReviewDelay("unknown", 4), 10 * 60 * 1000);

let progress = {};
progress = updateWordProgress(progress, "vais", "unknown", new Date("2026-06-10T00:00:00Z"));
assert.equal(getWordStatus(progress, "vais"), "unknown");
assert.equal(isReviewDue(progress.words.vais, new Date("2026-06-10T00:11:00Z")), true);

progress = updateWordProgress(progress, "vais", "known", new Date("2026-06-10T00:12:00Z"));
assert.equal(getWordStatus(progress, "vais"), "fuzzy");

let custom = saveCustomContent({
  words: [{ id: "w1", french: "salut", chinese: "你好", pos: "感叹词", forms: ["salut"] }],
  sentences: [{ id: "s1", french: "Salut, ça va ?", chinese: "你好，怎么样？" }],
});
assert.equal(loadCustomContent().words[0].french, "salut");

custom = upsertCustomItem(custom, "words", { id: "w1", french: "salut", chinese: "你好；再见", pos: "感叹词" });
assert.equal(custom.words.length, 1);
assert.equal(custom.words[0].chinese, "你好；再见");

custom = upsertCustomItem(custom, "sentences", { french: "Je révise le français.", chinese: "我复习法语。" });
assert.equal(custom.sentences.length, 2);
assert.ok(custom.sentences[1].id.startsWith("custom-sentence-"));

custom = deleteCustomItem(custom, "sentences", "s1");
assert.equal(custom.sentences.length, 1);

const exported = exportCustomContent(custom);
assert.match(exported, /Je révise le français/);
const imported = importCustomContent(exported, { words: [], sentences: [] });
assert.equal(imported.words[0].french, "salut");
