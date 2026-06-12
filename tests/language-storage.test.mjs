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
  deleteLanguageWord,
  exportLanguageContent,
  importLanguageContent,
  loadLanguageContent,
  saveLanguageContent,
  upsertLanguageWord,
} from "../src/languageStorage.js";

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
