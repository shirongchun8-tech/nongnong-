import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const EPUB =
  process.argv[2] ||
  "/Users/sralstly/Downloads/1368个单词就够了：实用篇 (王乐平) (z-library.sk, 1lib.sk, z-lib.sk).epub";
const OUTFILE = path.join(ROOT, "src", "data", "word1368Data.js");
const CACHE = path.join(ROOT, "scripts", ".translation-cache-1368.json");
const JAPANESE_OVERRIDES = {
  hold: { term: "つかむ", reading: "tsukamu" },
};

function unzipText(file) {
  return execFileSync("unzip", ["-p", EPUB, file], {
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });
}

function htmlFiles() {
  return execFileSync("unzip", ["-Z1", EPUB], { encoding: "utf8" })
    .split(/\n/)
    .filter((file) => /^OEBPS\/text\d+\.html$/.test(file));
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTerm(value) {
  return String(value || "")
    .replace(/[’]/g, "'")
    .replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function addCandidate(map, term, score) {
  const normalized = normalizeTerm(term);
  if (!normalized || normalized.length < 2) return;
  if (!/^[a-z][a-z' -]*$/.test(normalized)) return;
  if (normalized.includes("  ")) return;
  if (["isbn", "tip", "html", "xhtml", "css", "http", "www"].includes(normalized)) return;
  map.set(normalized, (map.get(normalized) || 0) + score);
}

function extractTerms() {
  const candidates = new Map();
  const frequency = new Map();

  for (const file of htmlFiles()) {
    const html = unzipText(file);

    for (const match of html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)) {
      const text = stripHtml(match[1]);
      if (/^[A-Za-z][A-Za-z ]+$/.test(text) && text.split(/\s+/).length <= 4) {
        addCandidate(candidates, text, 120);
      }
    }

    for (const match of html.matchAll(/<i>([\s\S]*?)<\/i>/gi)) {
      const text = stripHtml(match[1]).replace(/[.!?,;:]+$/g, "");
      if (/^[A-Za-z][A-Za-z' -]+$/.test(text) && text.split(/\s+/).length <= 3 && text.length <= 36) {
        addCandidate(candidates, text, 30);
      }
    }

    const text = stripHtml(html);
    for (const match of text.matchAll(/[A-Za-z][A-Za-z'’-]*/g)) {
      const word = normalizeTerm(match[0]);
      if (!word || word.length < 2) continue;
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
  }

  for (const [word, count] of frequency) {
    addCandidate(candidates, word, Math.min(count, 20));
  }

  const fragments = new Set([
    "agains",
    "apar",
    "brough",
    "cutt",
    "fel",
    "ge",
    "kep",
    "of",
    "ou",
    "ove",
    "pu",
    "t",
    "youre",
  ]);

  return [...candidates.entries()]
    .filter(([term]) => !fragments.has(term))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([term]) => term)
    .slice(0, 1368);
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

async function fetchWithTimeout(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function translate(term, target, cache) {
  const key = `${target}:${term}`;
  if (cache[key]) return cache[key];

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", term);

  let translated = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      translated = (data?.[0] || []).map((part) => part?.[0] || "").join("").trim();
      break;
    } catch (error) {
      if (attempt === 3) {
        console.warn(`Using fallback for ${term} -> ${target}: ${error.message}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }
  cache[key] = translated || term;
  return cache[key];
}

async function romanizeJapanese(japaneseTerm, cache) {
  const key = `ja-rm:${japaneseTerm}`;
  if (cache[key]) return cache[key];

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "ja");
  url.searchParams.set("tl", "en");
  url.searchParams.append("dt", "t");
  url.searchParams.append("dt", "rm");
  url.searchParams.set("q", japaneseTerm);

  let reading = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const romanized = (data?.[0] || []).find((part) => part?.[3])?.[3] || "";
      reading = String(romanized).trim().toLowerCase();
      break;
    } catch (error) {
      if (attempt === 3) {
        console.warn(`Using empty romanization for ${japaneseTerm}: ${error.message}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }

  cache[key] = reading || japaneseTerm;
  return cache[key];
}

async function translateAll(terms) {
  const cache = loadCache();
  const rows = [];
  const targets = [
    ["zh-CN", "chinese"],
    ["fr", "fr"],
    ["ja", "ja"],
    ["ko", "ko"],
  ];

  for (let index = 0; index < terms.length; index += 1) {
    const term = terms[index];
    const row = { term };
    for (const [target, key] of targets) {
      row[key] = await translate(term, target, cache);
    }
    if (JAPANESE_OVERRIDES[term]) {
      row.ja = JAPANESE_OVERRIDES[term].term;
      row.jaReading = JAPANESE_OVERRIDES[term].reading;
    } else {
      row.jaReading = await romanizeJapanese(row.ja, cache);
    }
    rows.push(row);
    if ((index + 1) % 50 === 0) {
      saveCache(cache);
      console.log(`Translated ${index + 1}/${terms.length}`);
    }
  }

  saveCache(cache);
  return rows;
}

function jsString(value) {
  return JSON.stringify(value);
}

function card(row, languageId, termKey, seenTerms) {
  const translated = row[termKey];
  const term = seenTerms.has(translated) ? `${translated} (${row.term})` : translated;
  seenTerms.add(term);
  return {
    term,
    baseTerm: row.term,
    chinese: row.chinese,
    pos: "1368词库",
    ...(languageId === "ja" ? { reading: row.jaReading } : {}),
    forms: languageId === "en" ? [row.term] : [term, row.term],
    example: languageId === "en" ? row.term : `${row.term} → ${term}`,
    source: "1368词库",
  };
}

function emit(rows) {
  const groups = [
    ["word1368English", "en", "term"],
    ["word1368French", "fr", "fr"],
    ["word1368Japanese", "ja", "ja"],
    ["word1368Korean", "ko", "ko"],
  ];
  const reservedTerms = {
    en: ["hello", "thank you", "water", "food", "book", "school", "home", "friend", "today", "tomorrow", "go", "eat", "good", "big", "small"],
    ko: ["안녕하세요", "감사합니다", "물", "음식", "책", "학교", "집", "친구", "오늘", "내일", "가다", "먹다", "좋다", "크다", "작다"],
    fr: [
      "bonjour",
      "merci",
      "eau",
      "nourriture",
      "livre",
      "école",
      "maison",
      "ami",
      "aujourd'hui",
      "demain",
      "aller",
      "manger",
      "bon",
      "grand",
      "petit",
      "au-dessus de",
      "sous",
      "se déplacer",
      "marcher",
      "jouer",
    ],
    ja: ["こんにちは", "ありがとう", "水", "食べ物", "本", "学校", "家", "友達", "今日", "明日", "行く", "食べる", "いい", "大きい", "小さい"],
  };

  const body = groups
    .map(([name, languageId, termKey]) => {
      const seenTerms = new Set(reservedTerms[languageId] || []);
      const cards = rows.map((row) => card(row, languageId, termKey, seenTerms));
      return `export const ${name} = ${JSON.stringify(cards, null, 2)};`;
    })
    .join("\n\n");

  fs.mkdirSync(path.dirname(OUTFILE), { recursive: true });
  fs.writeFileSync(
    OUTFILE,
    `// Generated by scripts/generate-1368-vocabulary.mjs from the supplied EPUB.\n${body}\n`,
    "utf8",
  );
}

const terms = extractTerms();
if (terms.length !== 1368) {
  throw new Error(`Expected 1368 terms, found ${terms.length}`);
}

console.log(`Extracted ${terms.length} terms from ${EPUB}`);
const rows = await translateAll(terms);
emit(rows);
console.log(`Wrote ${path.relative(ROOT, OUTFILE)}`);
