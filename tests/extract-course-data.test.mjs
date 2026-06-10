import assert from "node:assert/strict";
import { parseCourseMarkdown } from "../scripts/extract-course-data.mjs";

const sample = `# Conversation française - Révision finale

# 1. Habitation et localisation

## 核心词汇

| Français | 中文 |
|---|---|
| une maison | 房子 |
| à côté de | 在旁边 |

## 介词填空：原题 + 答案 + 翻译

| # | Phrase | Réponse | 中文 |
|---|---|---|---|
| 1 | J'habite ... une grande maison. | dans | 我住在一栋大房子里。 |

## 口语问题：中文翻译 + 可用回答

| Question | 中文 | Exemple de réponse |
|---|---|---|
| Quel logement avez-vous ? | 你住什么样的房子？ | J'habite dans un appartement. |
`;

const data = parseCourseMarkdown(sample);

assert.equal(data.title, "Conversation française - Révision finale");
assert.equal(data.chapters.length, 1);
assert.equal(data.chapters[0].title, "Habitation et localisation");
assert.deepEqual(data.chapters[0].vocabulary[0], {
  french: "une maison",
  chinese: "房子",
});
assert.equal(data.chapters[0].exercises[0].answer, "dans");
assert.equal(data.chapters[0].oralQuestions[0].example, "J'habite dans un appartement.");
assert.ok(data.reviewCards.some((card) => card.front === "une maison"));
assert.ok(data.reviewCards.some((card) => card.front === "J'habite dans un appartement."));
