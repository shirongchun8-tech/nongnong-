import { courseData } from "./data/courseData.js?v=auto-pronounce";
import { getSelectedVoiceName, getVoiceOptions, setSelectedVoiceName, speakFrench } from "./speech.js";
import {
  getWordStatus,
  isWeakWord,
  loadProgress,
  loadWordProgress,
  resetProgress,
  saveReview,
  saveWordProgress,
} from "./storage.js";

const app = document.querySelector("#app");
const WORD_RE = /[A-Za-zÀ-ÿ]+(?:[-'][A-Za-zÀ-ÿ]+)*'?/g;
const THEME_KEY = "french-study-tool-theme";
const AUTO_SPEAK_KEY = "french-study-tool-auto-speak";
let lastAutoSpokenWordKey = "";
let autoSpeakTimer = null;

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function loadAutoSpeak() {
  try {
    return localStorage.getItem(AUTO_SPEAK_KEY) !== "off";
  } catch {
    return true;
  }
}

let state = {
  section: "words",
  onlyWeak: false,
  beginnerMode: true,
  wordIndex: 0,
  wordFlipped: false,
  grammarIndex: 0,
  grammarFlipped: false,
  sentenceIndex: 0,
  sentenceFlipped: false,
  theme: loadTheme(),
  autoSpeak: loadAutoSpeak(),
  cardIndex: 0,
  cardFlipped: false,
  lookupWordKey: null,
  progress: loadProgress(),
  wordProgress: loadWordProgress(),
};

function applyTheme() {
  if (!document.body) return;
  document.body.className = document.body.className.replace(/\btheme-(light|dark)\b/g, "").trim();
  document.body.classList.add(`theme-${state.theme}`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeWord(word) {
  return String(word || "")
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/^[^a-zà-ÿ]+|[^a-zà-ÿ'-]+$/gi, "");
}

function tokenizeFrenchText(text) {
  const tokens = [];
  for (const raw of String(text || "").match(WORD_RE) || []) {
    const normalized = normalizeWord(raw);
    if (!normalized) continue;
    const elision = normalized.match(/^([cdjlmnstqu])'(.+)$/);
    if (elision) {
      tokens.push(`${elision[1]}'`, elision[2]);
    } else if (normalized.includes("-")) {
      tokens.push(...normalized.split("-").filter(Boolean));
    } else {
      tokens.push(normalized);
    }
  }
  return tokens;
}

function normalizeVocabItem(item) {
  const lemma = item?.lemma || item?.french || item?.front || item?.word || "";
  const key = item?.key || lemma.toLowerCase();
  return {
    ...item,
    key,
    lemma,
    ipa: item?.ipa || "",
    pos: item?.pos || "词汇",
    chinese: item?.chinese || item?.back || "词汇",
    forms: Array.isArray(item?.forms) && item.forms.length ? item.forms : [lemma].filter(Boolean),
    frequency: item?.frequency || 1,
    example: item?.example || "",
    sources: Array.isArray(item?.sources) ? item.sources : item?.source ? [item.source] : [],
  };
}

const allWords = (courseData.sections?.words || []).map(normalizeVocabItem);
const wordByKey = new Map(allWords.map((word) => [word.key, word]));
const wordByForm = new Map();
for (const word of allWords) {
  wordByForm.set(normalizeWord(word.lemma), word);
  for (const form of word.forms) wordByForm.set(normalizeWord(form), word);
}

function findWord(rawWord) {
  const normalized = normalizeWord(rawWord);
  if (!normalized) return null;
  return wordByForm.get(normalized) || wordByForm.get(normalized.replace(/s$/, "")) || null;
}

function wordStatus(word) {
  return getWordStatus(state.wordProgress, normalizeVocabItem(word).key);
}

function globalStats() {
  const total = allWords.length;
  const known = allWords.filter((word) => wordStatus(word) === "known").length;
  return { total, known, weak: total - known };
}

function playButton(text, label = "播放") {
  return `<button class="icon-button" data-speak="${escapeHtml(text)}" title="${label}" aria-label="${label}">▶</button>`;
}

function slowButton(text) {
  return `<button class="icon-button muted" data-slow="${escapeHtml(text)}" title="慢速播放" aria-label="慢速播放">慢</button>`;
}

function extraSlowButton(text) {
  return `<button class="icon-button extra-slow" data-extra-slow="${escapeHtml(text)}" title="超慢播放" aria-label="超慢播放">超慢</button>`;
}

function listenActions(text, label = "播放") {
  return `<div class="listen-actions">${playButton(text, label)}${slowButton(text)}${extraSlowButton(text)}</div>`;
}

function sectionLabel(section = state.section) {
  const labels = { words: "单词", grammar: "语法", sentences: "句子", review: "复习" };
  return labels[section] || "单词";
}

function renderShell(content) {
  const voices = getVoiceOptions();
  const selectedVoice = getSelectedVoiceName();
  const stats = globalStats();
  return `
    <header class="topbar">
      <div class="brand-block">
        <p class="eyebrow">French Review Studio</p>
        <h1>${escapeHtml(courseData.title)}</h1>
        <p>先打牢词汇，再看语法，最后进入句子口语训练。</p>
      </div>
      <div class="top-actions">
        ${["words", "grammar", "sentences", "review"]
          .map(
            (section) =>
              `<button class="${state.section === section ? "active" : ""}" data-section="${section}">${sectionLabel(section)}</button>`,
          )
          .join("")}
        <button data-toggle-theme>${state.theme === "dark" ? "浅色" : "深色"}</button>
      </div>
    </header>
    <main class="layout global-layout">
      <aside class="overview-strip">
        <section class="voice-panel">
          <label for="voice-select">法语声音</label>
          <select id="voice-select" data-voice-select>
            ${
              voices.length
                ? voices
                    .map(
                      (voice) => `
                        <option value="${escapeHtml(voice.name)}" ${voice.name === selectedVoice ? "selected" : ""}>
                          ${escapeHtml(voice.name)} · ${escapeHtml(voice.lang)}
                        </option>
                      `,
                    )
                    .join("")
                : `<option value="">没有检测到法语语音</option>`
            }
          </select>
          <p>${voices.length ? "读音奇怪时，换 French/Français voice。" : "请在系统设置里安装 French voice。"}</p>
        </section>
        <section class="stats-panel">
          <div class="stat">
            <strong>${stats.total}</strong>
            <span>总词汇</span>
          </div>
          <div class="stat">
            <strong>${stats.known}</strong>
            <span>已掌握</span>
          </div>
          <div class="stat">
            <strong>${stats.weak}</strong>
            <span>待学习</span>
          </div>
          <div class="stat">
            <strong>${courseData.sections?.sentences?.length || 0}</strong>
            <span>句子</span>
          </div>
        </section>
        <section class="control-panel">
          <div>
            <strong>当前：${sectionLabel()}</strong>
            <p>课时只作为来源标签保留，不再分散学习入口。</p>
          </div>
          <div class="side-actions">
            <button class="${state.onlyWeak ? "active" : ""}" data-toggle-weak>仅复习生词</button>
            <button class="${state.autoSpeak ? "active" : ""}" data-toggle-auto-speak>自动发音</button>
            <button class="${state.beginnerMode ? "active" : ""}" data-toggle-beginner>初级模式</button>
          </div>
        </section>
      </aside>
      <section class="content">${content}</section>
    </main>
    ${renderLookup()}
  `;
}

function filteredWords() {
  if (!state.onlyWeak) return allWords;
  return allWords.filter((word) => isWeakWord(state.wordProgress.words[word.key]));
}

function currentWord() {
  const words = filteredWords();
  return words[state.wordIndex % Math.max(words.length, 1)] || null;
}

function scheduleAutoSpeakWord() {
  if (autoSpeakTimer) {
    clearTimeout(autoSpeakTimer);
    autoSpeakTimer = null;
  }
  if (!state.autoSpeak || state.section !== "words" || state.lookupWordKey) return;
  const word = currentWord();
  if (!word || word.key === lastAutoSpokenWordKey) return;
  lastAutoSpokenWordKey = word.key;
  autoSpeakTimer = setTimeout(() => {
    if (typeof SpeechSynthesisUtterance === "undefined") return;
    speakFrench(word.lemma);
  }, 220);
}

function renderWords() {
  const words = filteredWords();
  const word = currentWord();
  if (!word) {
    return `
      <div class="chapter-header">
        <p class="eyebrow">Words</p>
        <h2>单词库</h2>
        <p>当前筛选下没有单词。关闭“仅复习生词”可以回到完整词库。</p>
      </div>
    `;
  }
  const status = wordStatus(word);
  return `
    <div class="chapter-header">
      <p class="eyebrow">Words</p>
      <h2>单词库</h2>
      <p>翻页背词模式：先听和读单词，再点“显示答案”看中文、词性、词形和例句。</p>
    </div>
    <section class="panel word-study-panel">
      <div class="section-title">
        <h2>${state.onlyWeak ? "仅复习生词" : "翻页背词"}</h2>
        <span>${(state.wordIndex % words.length) + 1} / ${words.length} 个</span>
      </div>
      <article class="study-card status-${status}">
        <div class="card-progress">
          <span>${sectionLabel()} · ${status === "known" ? "已掌握" : status === "fuzzy" ? "模糊" : "未掌握"}</span>
          <button class="text-button" data-lookup="${word.key}">查词详情</button>
        </div>
        <div class="study-card-face">
          <h3 lang="fr">${escapeHtml(word.lemma)}</h3>
          ${word.ipa ? `<p class="ipa big">音标 ${escapeHtml(word.ipa)}</p>` : ""}
          ${listenActions(word.lemma, "播放单词")}
        </div>
        <div class="study-card-back ${state.wordFlipped ? "visible" : ""}">
          <p class="answer-main">${escapeHtml(word.chinese)}</p>
          <p class="meta">${escapeHtml(word.pos)} · 词形：${escapeHtml(word.forms.join(", "))}</p>
          ${word.example ? `<p class="lookup-example">${renderClickableSentence(word.example)}</p>` : ""}
          ${word.sources?.length ? `<p class="translation">来源：${escapeHtml(word.sources.slice(0, 3).join(" / "))}</p>` : ""}
        </div>
      </article>
      <div class="word-deck-actions">
        <button data-word-prev>上一张</button>
        <button class="primary-action" data-flip-word>${state.wordFlipped ? "隐藏答案" : "显示答案"}</button>
        <button data-word-next>下一张</button>
      </div>
      <div class="word-actions deck-rate">
        <button data-word-rate="${word.key}:unknown">不认识</button>
        <button data-word-rate="${word.key}:fuzzy">模糊</button>
        <button data-word-rate="${word.key}:known">认识</button>
      </div>
    </section>
  `;
}

function renderGrammar() {
  const grammar = courseData.sections?.grammar || [];
  const item = grammar[state.grammarIndex % Math.max(grammar.length, 1)];
  if (!item) {
    return `
      <div class="chapter-header">
        <p class="eyebrow">Grammar</p>
        <h2>语法</h2>
        <p>还没有语法卡片。</p>
      </div>
    `;
  }
  return `
    <div class="chapter-header">
      <p class="eyebrow">Grammar</p>
      <h2>语法</h2>
      <p>翻页背语法：先看法语语法点，再显示中文解释和用法。</p>
    </div>
    <section class="panel word-study-panel">
      <div class="section-title">
        <h2>语法卡片</h2>
        <span>${(state.grammarIndex % grammar.length) + 1} / ${grammar.length} 条</span>
      </div>
      <article class="study-card grammar-deck-card">
        <div class="card-progress">
          <span>语法 · ${escapeHtml(item.source || "课件")}</span>
        </div>
        <div class="study-card-face">
          <h3 lang="fr">${escapeHtml(item.title)}</h3>
        </div>
        <div class="study-card-back ${state.grammarFlipped ? "visible" : ""}">
          <p class="answer-main">${escapeHtml(item.chinese || "请结合例句理解这个语法点。")}</p>
        </div>
      </article>
      <div class="word-deck-actions">
        <button data-grammar-prev>上一条</button>
        <button class="primary-action" data-flip-grammar>${state.grammarFlipped ? "隐藏答案" : "显示答案"}</button>
        <button data-grammar-next>下一条</button>
      </div>
    </section>
  `;
}

function sentenceUnknownCount(sentence) {
  return tokenizeFrenchText(sentence).filter((token) => {
    const word = findWord(token);
    return word && wordStatus(word) !== "known";
  }).length;
}

function filteredSentences() {
  let sentences = [...(courseData.sections?.sentences || [])];
  if (state.beginnerMode) {
    sentences = sentences.sort((a, b) => sentenceUnknownCount(a.french) - sentenceUnknownCount(b.french));
  }
  if (state.onlyWeak) {
    sentences = sentences.filter((sentence) => sentenceUnknownCount(sentence.french) > 0);
  }
  return sentences;
}

function renderSentences() {
  const sentences = filteredSentences();
  const total = courseData.sections?.sentences?.length || 0;
  const sentence = sentences[state.sentenceIndex % Math.max(sentences.length, 1)];
  if (!sentence) {
    return `
      <div class="chapter-header">
        <p class="eyebrow">Sentences</p>
        <h2>句子</h2>
        <p>当前筛选下没有句子。关闭“仅复习生词”可以回到完整句子库。</p>
      </div>
    `;
  }
  const unknown = sentenceUnknownCount(sentence.french);
  return `
    <div class="chapter-header">
      <p class="eyebrow">Sentences</p>
      <h2>句子</h2>
      <p>翻页练句子：先听法语并尝试理解，再显示中文翻译。高亮词可以点击查词。</p>
    </div>
    <section class="panel word-study-panel">
      <div class="section-title">
        <h2>${state.onlyWeak ? "含生词的句子" : "句子卡片"}</h2>
        <span>${(state.sentenceIndex % sentences.length) + 1} / ${sentences.length} 条</span>
      </div>
      <article class="study-card sentence-deck-card ${unknown ? "has-unknown" : ""}">
        <div class="card-progress">
          <span>句子 · 待掌握词 ${unknown} 个 · ${escapeHtml(sentence.source || "课件")}</span>
        </div>
        <div class="study-card-face sentence-face">
          <p lang="fr">${renderClickableSentence(sentence.french)}</p>
          ${listenActions(sentence.french, "播放句子")}
        </div>
        <div class="study-card-back ${state.sentenceFlipped ? "visible" : ""}">
          <p class="answer-main">${escapeHtml(sentence.chinese || "请根据上下文理解。")}</p>
        </div>
      </article>
      <div class="word-deck-actions">
        <button data-sentence-prev>上一句</button>
        <button class="primary-action" data-flip-sentence>${state.sentenceFlipped ? "隐藏答案" : "显示答案"}</button>
        <button data-sentence-next>下一句</button>
      </div>
    </section>
  `;
}

function renderClickableSentence(text) {
  let output = "";
  let lastIndex = 0;
  for (const match of String(text || "").matchAll(WORD_RE)) {
    const raw = match[0];
    output += escapeHtml(String(text).slice(lastIndex, match.index));
    const word = findWord(raw);
    if (word) {
      const status = wordStatus(word);
      output += `<button class="inline-word status-${status}" data-lookup="${word.key}" lang="fr">${escapeHtml(raw)}</button>`;
    } else {
      output += escapeHtml(raw);
    }
    lastIndex = match.index + raw.length;
  }
  output += escapeHtml(String(text || "").slice(lastIndex));
  return output;
}

function getReviewCards() {
  let cards = courseData.reviewCards || [];
  if (state.onlyWeak) {
    cards = cards.filter((card) => card.wordKey && isWeakWord(state.wordProgress.words[card.wordKey]));
  }
  return cards.length ? cards : courseData.reviewCards || [];
}

function renderReviewView() {
  const cards = getReviewCards();
  const card = cards[state.cardIndex % Math.max(cards.length, 1)];
  if (!card) {
    return renderShell(`<section class="panel"><p class="empty">还没有可复习的卡片。</p></section>`);
  }
  const progress = state.progress[card.id];
  return `
    <div class="review-stage">
      <div class="review-meta">
        <span>${state.cardIndex + 1} / ${cards.length}</span>
        <button class="${state.onlyWeak ? "active" : ""}" data-toggle-weak>仅复习生词</button>
        <button class="text-button" data-reset-progress>重置进度</button>
      </div>
      <article class="flashcard ${state.cardFlipped ? "flipped" : ""}" data-flip-card>
        <p class="eyebrow">${cardLabel(card)} ${card.source ? `· ${escapeHtml(card.source)}` : ""}</p>
        ${renderCardFront(card)}
        <div class="card-back">
          <p>${escapeHtml(card.back)}</p>
          ${card.ipa ? `<small class="ipa">音标 ${escapeHtml(card.ipa)}</small>` : ""}
          ${card.pos ? `<small>${escapeHtml(card.pos)}</small>` : ""}
          ${card.forms?.length ? `<small>词形：${escapeHtml(card.forms.join(", "))}</small>` : ""}
          ${card.example ? `<small>${escapeHtml(card.example)}</small>` : ""}
        </div>
      </article>
      <div class="review-actions">
        <button data-flip-card>${state.cardFlipped ? "隐藏答案" : "显示答案"}</button>
        <button data-rate="forgot">不认识</button>
        <button data-rate="hard">模糊</button>
        <button data-rate="good">认识</button>
      </div>
      <p class="review-note">这张卡已练 ${progress?.seen || 0} 次。词汇状态会按间隔复习。</p>
    </div>
  `;
}

function cardLabel(card) {
  if (card.type === "vocabulary") return "单词";
  if (card.type === "grammar") return "语法";
  return "句子";
}

function renderCardFront(card) {
  return `
    <h2 lang="fr">${escapeHtml(card.front)}</h2>
    ${card.ipa ? `<p class="ipa big">音标 ${escapeHtml(card.ipa)}</p>` : ""}
    ${card.pos ? `<p class="meta">${escapeHtml(card.pos)}</p>` : ""}
    <div class="listen-row">${playButton(card.front, "播放卡片")}${slowButton(card.front)}${extraSlowButton(card.front)}</div>
  `;
}

function renderLookup() {
  if (!state.lookupWordKey) return "";
  const word = wordByKey.get(state.lookupWordKey);
  if (!word) return "";
  const status = wordStatus(word);
  return `
    <div class="lookup-backdrop" data-close-lookup>
      <aside class="lookup-popover" role="dialog" aria-modal="true">
        <button class="text-button close" data-close-lookup>关闭</button>
        <p class="eyebrow">点击查词</p>
        <h2 lang="fr">${escapeHtml(word.lemma)}</h2>
        ${word.ipa ? `<p class="ipa big">音标 ${escapeHtml(word.ipa)}</p>` : ""}
        <p>${escapeHtml(word.chinese)}</p>
        <p><strong>词性：</strong>${escapeHtml(word.pos)}</p>
        <p><strong>原形：</strong>${escapeHtml(word.lemma)}</p>
        <p><strong>出现形式：</strong>${escapeHtml(word.forms.join(", "))}</p>
        <p><strong>状态：</strong>${status === "known" ? "已掌握" : status === "fuzzy" ? "模糊" : "未掌握"}</p>
        ${word.example ? `<p class="lookup-example">${escapeHtml(word.example)}</p>` : ""}
        ${listenActions(word.lemma)}
        <div class="word-actions large">
          <button data-word-rate="${word.key}:known">认识</button>
          <button data-word-rate="${word.key}:fuzzy">模糊</button>
          <button data-word-rate="${word.key}:unknown">不认识</button>
        </div>
      </aside>
    </div>
  `;
}

function render() {
  applyTheme();
  const content =
    state.section === "review"
      ? renderReviewView()
      : state.section === "grammar"
        ? renderGrammar()
        : state.section === "sentences"
          ? renderSentences()
          : renderWords();
  app.innerHTML = renderShell(content);
  scheduleAutoSpeakWord();
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("button, [data-flip-card], [data-close-lookup]");
  if (!target) return;

  if (target.dataset.speak) speakFrench(target.dataset.speak);
  if (target.dataset.slow) speakFrench(target.dataset.slow, { slow: true });
  if (target.dataset.extraSlow) speakFrench(target.dataset.extraSlow, { extraSlow: true });
  if (target.dataset.section) {
    state.section = target.dataset.section;
    state.cardIndex = 0;
    state.cardFlipped = false;
    state.wordFlipped = false;
    state.grammarFlipped = false;
    state.sentenceFlipped = false;
    render();
  }
  if (target.dataset.toggleTheme !== undefined) {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, state.theme);
    render();
  }
  if (target.dataset.toggleAutoSpeak !== undefined) {
    state.autoSpeak = !state.autoSpeak;
    localStorage.setItem(AUTO_SPEAK_KEY, state.autoSpeak ? "on" : "off");
    if (state.autoSpeak) lastAutoSpokenWordKey = "";
    render();
  }
  if (target.dataset.toggleWeak !== undefined) {
    state.onlyWeak = !state.onlyWeak;
    state.cardIndex = 0;
    state.wordIndex = 0;
    state.sentenceIndex = 0;
    render();
  }
  if (target.dataset.toggleBeginner !== undefined) {
    state.beginnerMode = !state.beginnerMode;
    state.sentenceIndex = 0;
    render();
  }
  if (target.dataset.lookup) {
    state.lookupWordKey = target.dataset.lookup;
    render();
  }
  if (target.dataset.closeLookup !== undefined) {
    state.lookupWordKey = null;
    render();
  }
  if (target.dataset.flipCard !== undefined) {
    state.cardFlipped = !state.cardFlipped;
    render();
  }
  if (target.dataset.flipWord !== undefined) {
    state.wordFlipped = !state.wordFlipped;
    render();
  }
  if (target.dataset.wordPrev !== undefined) {
    const words = filteredWords();
    state.wordIndex = (state.wordIndex - 1 + words.length) % words.length;
    state.wordFlipped = false;
    render();
  }
  if (target.dataset.wordNext !== undefined) {
    const words = filteredWords();
    state.wordIndex = (state.wordIndex + 1) % words.length;
    state.wordFlipped = false;
    render();
  }
  if (target.dataset.wordRate) {
    const [wordKey, rating] = target.dataset.wordRate.split(":");
    state.wordProgress = saveWordProgress(wordKey, rating);
    if (state.section === "words") {
      const words = filteredWords();
      state.wordIndex = (state.wordIndex + 1) % Math.max(words.length, 1);
      state.wordFlipped = false;
    }
    render();
  }
  if (target.dataset.flipGrammar !== undefined) {
    state.grammarFlipped = !state.grammarFlipped;
    render();
  }
  if (target.dataset.grammarPrev !== undefined) {
    const items = courseData.sections?.grammar || [];
    state.grammarIndex = (state.grammarIndex - 1 + items.length) % Math.max(items.length, 1);
    state.grammarFlipped = false;
    render();
  }
  if (target.dataset.grammarNext !== undefined) {
    const items = courseData.sections?.grammar || [];
    state.grammarIndex = (state.grammarIndex + 1) % Math.max(items.length, 1);
    state.grammarFlipped = false;
    render();
  }
  if (target.dataset.flipSentence !== undefined) {
    state.sentenceFlipped = !state.sentenceFlipped;
    render();
  }
  if (target.dataset.sentencePrev !== undefined) {
    const items = filteredSentences();
    state.sentenceIndex = (state.sentenceIndex - 1 + items.length) % Math.max(items.length, 1);
    state.sentenceFlipped = false;
    render();
  }
  if (target.dataset.sentenceNext !== undefined) {
    const items = filteredSentences();
    state.sentenceIndex = (state.sentenceIndex + 1) % Math.max(items.length, 1);
    state.sentenceFlipped = false;
    render();
  }
  if (target.dataset.rate) {
    const cards = getReviewCards();
    const card = cards[state.cardIndex % cards.length];
    state.progress = saveReview(card.id, target.dataset.rate);
    if (card.wordKey) {
      const wordRating = target.dataset.rate === "good" ? "known" : target.dataset.rate === "hard" ? "fuzzy" : "unknown";
      state.wordProgress = saveWordProgress(card.wordKey, wordRating);
    }
    state.cardIndex = (state.cardIndex + 1) % cards.length;
    state.cardFlipped = false;
    render();
  }
  if (target.dataset.resetProgress !== undefined) {
    resetProgress();
    state.progress = {};
    state.wordProgress = { words: {} };
    state.cardIndex = 0;
    state.cardFlipped = false;
    render();
  }
});

app.addEventListener("change", (event) => {
  if (event.target.matches("[data-voice-select]")) {
    setSelectedVoiceName(event.target.value);
    speakFrench("Bonjour, je m'appelle Thomas.");
    render();
  }
});

window.addEventListener("frenchVoicesChanged", render);

render();
