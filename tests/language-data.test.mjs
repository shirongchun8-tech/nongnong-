import assert from "node:assert/strict";
import { getStarterWords } from "../src/languageData.js";

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
