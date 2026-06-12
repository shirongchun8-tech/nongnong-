import assert from "node:assert/strict";
import { buildCourseDataFromIndex, lookupWord, parseCourseMarkdown, tokenizeFrenchText } from "../scripts/extract-course-data.mjs";

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
  ipa: "/yn mɛzɔ̃/",
  visual: "⌂",
  hint: "想象一栋小房子，maison 就是家/房子。",
});
assert.equal(data.chapters[0].exercises[0].answer, "dans");
assert.equal(data.chapters[0].oralQuestions[0].example, "J'habite dans un appartement.");
assert.ok(data.reviewCards.some((card) => card.front === "une maison"));
assert.ok(data.reviewCards.some((card) => card.front === "J'habite dans un appartement."));
assert.ok(data.reviewCards.some((card) => card.type === "dialogue" && card.teacher === "Quel logement avez-vous ?"));
assert.deepEqual(tokenizeFrenchText("J'habite dans un appartement."), ["j'", "habite", "dans", "un", "appartement"]);
assert.equal(lookupWord("vais").lemma, "aller");
assert.equal(lookupWord("vais").pos, "动词");
assert.equal(lookupWord("lampe").chinese, "灯；台灯");
assert.equal(lookupWord("mange").lemma, "manger");
assert.equal(lookupWord("mange").chinese, "吃");
assert.equal(lookupWord("parle").lemma, "parler");
assert.equal(lookupWord("lieux").lemma, "lieu");
assert.equal(lookupWord("lieux").chinese, "地点；场所");
assert.match(lookupWord("glorifiez").chinese, /原词：glorifiez/);
assert.match(lookupWord("glorifiez").chinese, /原形：glorifier/);
assert.match(lookupWord("glorifiez").chinese, /第二人称复数或礼貌形式/);
assert.ok(data.chapters[0].wordBank.some((word) => word.lemma === "avoir" && word.forms.includes("avez")));
assert.ok(data.chapters[0].wordBank.some((word) => word.lemma === "appartement" && word.example.includes("appartement")));

const indexData = {
  courses: [
    {
      course: 1,
      topic: "Prononciation",
      grammar: ["Le verbe être"],
      vocabulary: Array.from({ length: 55 }, (_, index) => ({
        word: index === 0 ? "suis" : `mot${index}`,
        frequency: 5,
        example: index === 0 ? "Je suis étudiant." : `Je regarde le mot${index}.`,
      })),
      phrases: ["Je suis", "un téléphone"],
      sentences: ["Je suis étudiant.", "C'est un téléphone.", "This is a phone.", "There are movies in a movie theater."],
      dialogues: ["A: Bonjour !\nB: Bonjour !"],
    },
  ],
};
const fullCourseData = buildCourseDataFromIndex(indexData);
const bannedText = /课程中出现|课程语法点|词义提示|暂无中文|课程例句|课程词汇/;
assert.equal(fullCourseData.chapters.length, 1);
assert.equal(fullCourseData.chapters[0].vocabulary.length, 55);
assert.equal(fullCourseData.chapters[0].grammar.length, 1);
assert.equal(fullCourseData.chapters[0].learningPath.join(" -> "), "单词 -> 短语 -> 句子 -> 对话/课文");
assert.ok(fullCourseData.reviewCards.some((card) => card.type === "vocabulary" && card.wordKey === "être"));
assert.ok(fullCourseData.sections.words.length < 55);
assert.ok(fullCourseData.sections.words.some((word) => word.lemma === "être" && word.ipa));
assert.equal(fullCourseData.sections.grammar.length, 1);
assert.ok(fullCourseData.sections.sentences[0].chinese);
assert.ok(!fullCourseData.sections.sentences.some((sentence) => sentence.french === "This is a phone."));
assert.ok(!fullCourseData.sections.sentences.some((sentence) => sentence.french === "There are movies in a movie theater."));
assert.equal(new Set(fullCourseData.sections.words.map((word) => word.key)).size, fullCourseData.sections.words.length);
assert.doesNotMatch(fullCourseData.sections.grammar[0].chinese, bannedText);
assert.doesNotMatch(fullCourseData.sections.sentences[0].chinese, bannedText);
assert.doesNotMatch(fullCourseData.sections.words.map((word) => word.chinese).join("\n"), bannedText);

const unknownTokenData = buildCourseDataFromIndex({
  courses: [
    {
      course: 2,
      topic: "Unknown fallback",
      grammar: ["Expression avec xyzzy", "Conjugaison générale (PRESENT)", "Faites la comparaison en utilisant l’adjectif proposé."],
      vocabulary: [{ word: "xyzzy", frequency: 1, example: "Je xyzzy." }],
      phrases: [],
      sentences: [
        "Je xyzzy.",
        "Conjugaison générale (PRESENT)",
        "Répondez aux questions avec le vocabulaire suivant :",
        "Qu'est-ce qu'il y a dans … ?",
        "Tu ..................... de la guitare. [JOUER]",
        "Prénom & nom : Je suis ………… ……………",
        "• A: Bonjour !",
      ],
      dialogues: [],
    },
  ],
});
assert.doesNotMatch(JSON.stringify(unknownTokenData), /释义待补充/);
assert.match(unknownTokenData.sections.words[0].chinese, /原词：xyzzy/);
assert.ok(!unknownTokenData.sections.sentences.some((sentence) => sentence.french === "Conjugaison générale (PRESENT)"));
assert.ok(!unknownTokenData.sections.sentences.some((sentence) => sentence.french.startsWith("Répondez aux questions")));
assert.ok(!unknownTokenData.sections.sentences.some((sentence) => sentence.french.includes("[JOUER]")));
assert.ok(!unknownTokenData.sections.sentences.some((sentence) => sentence.french.startsWith("Prénom")));
assert.ok(unknownTokenData.sections.sentences.some((sentence) => sentence.french === "A: Bonjour !"));
assert.match(unknownTokenData.sections.grammar.find((item) => item.title === "Conjugaison générale (PRESENT)").chinese, /一般现在时动词变位/);
assert.ok(!unknownTokenData.sections.grammar.some((item) => item.title.startsWith("Faites la comparaison")));
