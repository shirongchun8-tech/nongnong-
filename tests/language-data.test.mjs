import assert from "node:assert/strict";
import { getStarterWords } from "../src/languageData.js";

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
