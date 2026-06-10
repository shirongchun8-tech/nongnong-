import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.resolve(ROOT, "..", "0610", "Cours-RevisionFinale-Chinese-Review.md");
const OUT = path.resolve(ROOT, "src", "data", "courseData.js");

const VOCAB_ENRICHMENT = new Map(
  [
    ["une habitation", "/yn abitasjɔ̃/", "⌂", "habitation 指住处，想象一个可以住进去的房子。"],
    ["un logement", "/œ̃ lɔʒmɑ̃/", "▣", "logement 是住房，像一格可以入住的空间。"],
    ["une maison", "/yn mɛzɔ̃/", "⌂", "想象一栋小房子，maison 就是家/房子。"],
    ["un appartement", "/œ̃n‿apaʁtəmɑ̃/", "▤", "appartement 像楼里的一间公寓。"],
    ["un studio", "/œ̃ stydjo/", "▢", "studio 是小单间，想象一个小方间。"],
    ["une pièce", "/yn pjɛs/", "□", "pièce 是房间，也可以像一块空间。"],
    ["une chambre", "/yn ʃɑ̃bʁ/", "◫", "chambre 是卧室，想象床所在的房间。"],
    ["une cuisine", "/yn kɥizin/", "▥", "cuisine 是厨房，发音里有 /kɥi/ 的滑音。"],
    ["une bibliothèque", "/yn biblijɔtɛk/", "▤", "bibliothèque 是图书馆，想象一排书架。"],
    ["une gare", "/yn gaʁ/", "▭", "gare 是火车站，/ʁ/ 是法语小舌音。"],
    ["un musée", "/œ̃ myze/", "▧", "musée 是博物馆，注意 u 是圆唇 /y/。"],
    ["à côté de", "/a kote də/", "↔", "côté 是旁边，想象两样东西靠在一起。"],
    ["en face de", "/ɑ̃ fas də/", "⇄", "face 是面对，表示在对面。"],
    ["au-dessus de", "/o dəsy də/", "↑", "dessus 是上面，想象箭头向上。"],
    ["sous", "/su/", "↓", "sous 是下面，想象箭头向下。"],
    ["loin de", "/lwɛ̃ də/", "↗", "loin 是远，发 /lwɛ̃/。"],
    ["à droite de", "/a dʁwat də/", "→", "droite 是右边，记右箭头。"],
    ["à la campagne", "/a la kɑ̃paɲ/", "▵", "campagne 是乡下，想象田野。"],
    ["en centre-ville", "/ɑ̃ sɑ̃tʁ vil/", "◎", "centre-ville 是市中心，想象城市中心点。"],
    ["se déplacer", "/sə deplase/", "⇢", "se déplacer 是移动/出行，想象人从 A 到 B。"],
    ["prendre le métro", "/pʁɑ̃dʁ lə metʁo/", "▱", "prendre le métro 是坐地铁，métro 重音在最后。"],
    ["prendre le bus", "/pʁɑ̃dʁ lə bys/", "▰", "bus 的 u 是圆唇 /y/，不要读成英语 bus。"],
    ["prendre le train", "/pʁɑ̃dʁ lə tʁɛ̃/", "▭", "train 结尾是鼻化音 /ɛ̃/。"],
    ["marcher", "/maʁʃe/", "⇥", "marcher 是走路，/ʃ/ 像 sh。"],
    ["aller", "/ale/", "→", "aller 是去，常用于 futur proche。"],
    ["venir", "/vəniʁ/", "←", "venir 是来，结尾 /ʁ/ 不要读英语 r。"],
    ["rouler", "/ʁule/", "○", "rouler 是滚动/行驶，想象车轮。"],
    ["voler", "/vɔle/", "△", "voler 是飞，想象向上飞。"],
    ["monter dans le métro", "/mɔ̃te dɑ̃ lə metʁo/", "↥", "monter 是上车，dans 表示进入里面。"],
    ["descendre du métro", "/desɑ̃dʁ dy metʁo/", "↧", "descendre 是下车，du = de + le。"],
    ["changer de ligne", "/ʃɑ̃ʒe də liɲ/", "⇆", "changer 是换，ligne 是线路。"],
    ["sortir de la station", "/sɔʁtiʁ də la stasjɔ̃/", "↱", "sortir 是出来，station 是车站。"],
    ["une ligne de métro", "/yn liɲ də metʁo/", "═", "ligne 是线，想象地铁线路。"],
    ["une station", "/yn stasjɔ̃/", "□", "station 是站，结尾是鼻化 /jɔ̃/。"],
    ["une destination", "/yn dɛstinasjɔ̃/", "◎", "destination 是目的地。"],
    ["le prochain arrêt", "/lə pʁɔʃɛ̃n‿aʁɛ/", "■", "prochain arrêt 是下一站。"],
    ["voyager", "/vwajaʒe/", "✈", "voyager 是旅行，/wa/ 开头。"],
    ["s'amuser", "/samyze/", "☆", "s'amuser 是玩得开心。"],
    ["une activité", "/yn aktivite/", "▣", "activité 是活动。"],
    ["un voyage", "/œ̃ vwajaʒ/", "✈", "voyage 是旅行，注意 /vwajaʒ/。"],
    ["des vacances", "/de vakɑ̃s/", "☼", "vacances 是假期。"],
  ].map(([french, ipa, visual, hint]) => [french, { ipa, visual, hint }]),
);

function enrichVocabularyItem(item) {
  const enrichment = VOCAB_ENRICHMENT.get(item.french);
  if (enrichment) return { ...item, ...enrichment };
  return {
    ...item,
    ipa: "",
    visual: "◇",
    hint: `${item.french}：${item.chinese}`,
  };
}

function stripMd(text) {
  return text
    .replace(/!\[\[.+?\]\]/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function chapterId(title, index) {
  return `${index + 1}-${title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function splitTableRow(line) {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  return row.split("|").map((cell) => stripMd(cell));
}

function isSeparator(line) {
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function readTable(lines, start) {
  const rows = [];
  let i = start;
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    if (!isSeparator(lines[i])) rows.push(splitTableRow(lines[i]));
    i += 1;
  }
  return { rows, next: i };
}

function ensureChapter(data, rawTitle) {
  const match = rawTitle.match(/^#\s+\d+\.\s+(.+)$/);
  if (!match) return null;
  const title = stripMd(match[1]);
  const chapter = {
    id: chapterId(title, data.chapters.length),
    title,
    vocabulary: [],
    exercises: [],
    oralQuestions: [],
    memorization: [],
    notes: [],
  };
  data.chapters.push(chapter);
  return chapter;
}

function addReviewCard(cards, card, seen) {
  if (!card.front || !card.back) return;
  const key = `${card.type}:${card.front}`;
  if (seen.has(key)) return;
  seen.add(key);
  cards.push(card);
}

function parseTableIntoChapter(chapter, heading, rows) {
  if (!chapter || rows.length < 2) return;
  const header = rows[0].map((cell) => cell.toLowerCase());
  const body = rows.slice(1).filter((row) => row.some(Boolean));

  if (header.includes("français") && header.includes("中文")) {
    chapter.vocabulary.push(
      ...body.map((row) =>
        enrichVocabularyItem({
          french: row[0],
          chinese: row[1],
        }),
      ),
    );
    return;
  }

  if (header.includes("phrase") && header.includes("réponse")) {
    chapter.exercises.push(
      ...body.map((row) => ({
        prompt: row[1],
        answer: row[2],
        chinese: row[3],
        type: heading.includes("动词") ? "verb" : "fill",
      })),
    );
    return;
  }

  if (header.includes("question") && header.includes("exemple de réponse")) {
    chapter.oralQuestions.push(
      ...body.map((row) => ({
        question: row[0],
        chinese: row[1],
        example: row[2],
      })),
    );
    return;
  }

  if (header.includes("présent")) {
    chapter.exercises.push(
      ...body.map((row) => ({
        prompt: row[0],
        answer: row[1],
        chinese: row[2],
        type: heading.includes("passé") ? "past" : "future",
      })),
    );
    return;
  }

  body.forEach((row) => {
    const french = row.find((cell) => /[A-Za-zÀ-ÿ]/.test(cell));
    const chinese = [...row].reverse().find((cell) => /[\u4e00-\u9fff]/.test(cell));
    if (french && chinese) {
      chapter.memorization.push({ french, chinese });
    }
  });
}

export function parseCourseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const data = {
    title: "Conversation française - Révision finale",
    sourceTitle: "Cours-RevisionFinale",
    chapters: [],
    reviewCards: [],
  };
  let chapter = null;
  let heading = "";
  const seenCards = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (/^#\s+Conversation/.test(line)) {
      data.title = stripMd(line.replace(/^#\s+/, ""));
      continue;
    }

    if (/^#\s+\d+\.\s+/.test(line)) {
      chapter = ensureChapter(data, line);
      heading = "";
      continue;
    }

    if (/^##\s+/.test(line)) {
      heading = stripMd(line.replace(/^##\s+/, ""));
      continue;
    }

    if (line.trim().startsWith("|")) {
      const { rows, next } = readTable(lines, i);
      parseTableIntoChapter(chapter, heading, rows);
      i = next - 1;
      continue;
    }

    if (chapter && line.trim().startsWith("- ")) {
      const text = stripMd(line.replace(/^\s*-\s+/, ""));
      const parts = text.match(/^(.+?[.!?])\s+([\u4e00-\u9fff].*)$/);
      if (parts) {
        chapter.memorization.push({ french: parts[1], chinese: parts[2] });
      } else if (/[A-Za-zÀ-ÿ]/.test(text)) {
        chapter.notes.push(text);
      }
    }
  }

  for (const item of data.chapters.flatMap((c) => c.vocabulary)) {
    addReviewCard(
      data.reviewCards,
      {
        id: `vocab-${data.reviewCards.length + 1}`,
        type: "vocabulary",
        front: item.french,
        back: item.chinese,
        ipa: item.ipa,
        visual: item.visual,
        hint: item.hint,
      },
      seenCards,
    );
  }

  for (const chapterItem of data.chapters) {
    for (const item of chapterItem.oralQuestions) {
      addReviewCard(
        data.reviewCards,
        {
          id: `oral-${data.reviewCards.length + 1}`,
          type: "dialogue",
          front: item.example,
          back: item.chinese,
          prompt: item.question,
          teacher: item.question,
          student: item.example,
          chapter: chapterItem.title,
        },
        seenCards,
      );
    }
    for (const item of chapterItem.memorization) {
      addReviewCard(
        data.reviewCards,
        {
          id: `sentence-${data.reviewCards.length + 1}`,
          type: "sentence",
          front: item.french,
          back: item.chinese,
          chapter: chapterItem.title,
        },
        seenCards,
      );
    }
  }

  return data;
}

if (process.argv[1] === __filename) {
  const markdown = fs.readFileSync(SOURCE, "utf8");
  const data = parseCourseMarkdown(markdown);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `export const courseData = ${JSON.stringify(data, null, 2)};\n`, "utf8");
  console.log(`Wrote ${path.relative(ROOT, OUT)} with ${data.chapters.length} chapters and ${data.reviewCards.length} cards.`);
}
