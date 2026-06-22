import assert from "node:assert/strict";
import { getStarterWords, getVocabularyComparison, getWordExample } from "../src/languageData.js";

const imported1368 = ["en", "fr", "ja", "ko"].map((languageId) => {
  const words = getStarterWords(languageId).filter((word) => word.source === "1368词库");
  assert.equal(words.length, 1368, `${languageId} should include the 1368 imported vocabulary`);
  assert.ok(words.every((word) => word.term && word.chinese && word.pos), `${languageId} imported words should be card-ready`);
  return words;
});

assert.equal(imported1368[0][0].chinese, imported1368[1][0].chinese);
assert.notEqual(imported1368[0][0].term, imported1368[1][0].term);
assert.notEqual(imported1368[0][0].term, imported1368[2][0].term);
assert.notEqual(imported1368[0][0].term, imported1368[3][0].term);

const importedJapanese = getStarterWords("ja").filter((word) => word.source === "1368词库");
assert.equal(importedJapanese.filter((word) => word.reading).length, 1368);
assert.ok(importedJapanese.every((word) => word.baseTerm));

const holdComparison = getVocabularyComparison(imported1368[0][0]);
assert.equal(holdComparison?.baseTerm, "hold");
assert.deepEqual(
  holdComparison.items.map((item) => item.languageId),
  ["en", "fr", "ja", "ko"],
);
assert.ok(holdComparison.items.every((item) => item.word?.term));
assert.ok(holdComparison.items.find((item) => item.languageId === "ja")?.word.reading);
assert.equal(holdComparison.items.find((item) => item.languageId === "ja")?.word.term, "つかむ");
assert.equal(holdComparison.items.find((item) => item.languageId === "ja")?.word.reading, "tsukamu");

const generatedHoldExample = getWordExample({
  ...imported1368[0][0],
  example: "",
});
assert.equal(generatedHoldExample.generated, true);
assert.equal(generatedHoldExample.text, "暂无自然例句");
assert.equal(generatedHoldExample.chinese, "这个词暂时没有可靠例句。");
assert.ok(generatedHoldExample.vocabularyTerms.includes("hold"));

const existingFoodExample = getWordExample(getStarterWords("en").find((word) => word.term === "food"));
assert.equal(existingFoodExample.generated, false);
assert.equal(existingFoodExample.text, "This food is good.");

const aboveExamples = Object.fromEntries(
  ["en", "fr", "ja", "ko"].map((languageId) => [languageId, getWordExample(getStarterWords(languageId).find((word) => word.baseTerm === "above"))]),
);
assert.equal(aboveExamples.en.generated, true);
assert.equal(aboveExamples.en.text, "The book is above the table.");
assert.equal(aboveExamples.fr.text, "Le livre est au-dessus de la table.");
assert.equal(aboveExamples.ja.text, "本は机の上にあります。");
assert.equal(aboveExamples.ko.text, "책이 탁자 위에 있어요.");
assert.ok(Object.values(aboveExamples).every((example) => !example.text.includes("→")));
assert.ok(Object.values(aboveExamples).every((example) => !/use .* with|utilise .* avec|사용해요/.test(example.text)));

const foodJapanese = getStarterWords("ja").find((word) => word.term === "食べ物");
const foodComparison = getVocabularyComparison(foodJapanese);
assert.equal(foodComparison?.baseTerm, "food");
assert.deepEqual(
  foodComparison.items.map((item) => item.languageId),
  ["en", "fr", "ja", "ko"],
);
assert.equal(foodComparison.items.find((item) => item.languageId === "en")?.word.term, "food");
assert.equal(foodComparison.items.find((item) => item.languageId === "fr")?.word.term, "nourriture");
assert.equal(foodComparison.items.find((item) => item.languageId === "ja")?.word.reading, "たべもの / tabemono");
assert.equal(foodComparison.items.find((item) => item.languageId === "ko")?.word.term, "음식");

const frenchWords = getStarterWords("fr");
const byTerm = new Map(frenchWords.map((word) => [word.term, word]));

assert.ok(frenchWords.length >= 100);
assert.equal(byTerm.get("un appartement")?.chinese, "公寓");
assert.equal(byTerm.get("prendre le métro")?.chinese, "坐地铁");
assert.equal(byTerm.get("jouer aux jeux vidéo")?.chinese, "玩电子游戏");
assert.equal(byTerm.get("J'habite dans un appartement. Il est petit mais pratique.")?.example, "J'habite dans un appartement. Il est petit mais pratique.");
assert.equal(byTerm.get("Quel logement avez-vous ?")?.chinese, "你住什么样的房子？");
assert.equal(byTerm.get("Oui, j'ai bu un café ce matin.")?.chinese, "是的，我今天早上喝了咖啡。");

const uniqueTerms = new Set(frenchWords.map((word) => word.term));
assert.equal(uniqueTerms.size, frenchWords.length);
