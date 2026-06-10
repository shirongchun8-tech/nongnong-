import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.resolve(ROOT, "..", "0610", "Cours-RevisionFinale-Chinese-Review.md");
const OUT = path.resolve(ROOT, "src", "data", "courseData.js");

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
      ...body.map((row) => ({
        french: row[0],
        chinese: row[1],
      })),
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
      { id: `vocab-${data.reviewCards.length + 1}`, type: "vocabulary", front: item.french, back: item.chinese },
      seenCards,
    );
  }

  for (const chapterItem of data.chapters) {
    for (const item of chapterItem.oralQuestions) {
      addReviewCard(
        data.reviewCards,
        {
          id: `oral-${data.reviewCards.length + 1}`,
          type: "sentence",
          front: item.example,
          back: item.chinese,
          prompt: item.question,
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
