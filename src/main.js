import { courseData } from "./data/courseData.js?v=three-sections";
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

let state = {
  section: "words",
  onlyWeak: false,
  beginnerMode: true,
  cardIndex: 0,
  cardFlipped: false,
  lookupWordKey: null,
  progress: loadProgress(),
  wordProgress: loadWordProgress(),
};

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
    chinese: item?.chinese || item?.back || "课程词汇",
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
      <div>
        <p class="eyebrow">全局学习顺序：单词 → 语法 → 句子</p>
        <h1>${escapeHtml(courseData.title)}</h1>
      </div>
      <div class="top-actions">
        ${["words", "grammar", "sentences", "review"]
          .map(
            (section) =>
              `<button class="${state.section === section ? "active" : ""}" data-section="${section}">${sectionLabel(section)}</button>`,
          )
          .join("")}
      </div>
    </header>
    <main class="layout">
      <aside class="sidebar">
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
        <section class="voice-panel">
          <strong>现在分类</strong>
          <p>不再按课时分散。课时只作为来源标签保留，方便你知道单词和句子来自哪里。</p>
          <div class="side-actions">
            <button class="${state.onlyWeak ? "active" : ""}" data-toggle-weak>仅复习生词</button>
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

function renderWords() {
  const words = filteredWords();
  return `
    <div class="chapter-header">
      <p class="eyebrow">Words</p>
      <h2>单词库</h2>
      <p>这里是 20 课内容合并后的去重词库。每个单词保留原形、出现词形、音标、词性、中文释义和例句。</p>
    </div>
    <section class="panel">
      <div class="section-title">
        <h2>${state.onlyWeak ? "仅复习生词" : "全部单词"}</h2>
        <span>${words.length} / ${allWords.length} 个</span>
      </div>
      <div class="vocab-grid dense">
        ${words
          .map((word) => {
            const status = wordStatus(word);
            return `
              <article class="vocab-item word-card status-${status}">
                <div class="vocab-copy">
                  <button class="word-title" data-lookup="${word.key}" lang="fr">${escapeHtml(word.lemma)}</button>
                  ${word.ipa ? `<span class="ipa">音标 ${escapeHtml(word.ipa)}</span>` : ""}
                  <span class="meta">${escapeHtml(word.pos)} · 词形：${escapeHtml(word.forms.join(", "))}</span>
                  <p>${escapeHtml(word.chinese)}</p>
                  ${word.example ? `<small>${renderClickableSentence(word.example)}</small>` : ""}
                  ${word.sources?.length ? `<small>来源：${escapeHtml(word.sources.slice(0, 3).join(" / "))}</small>` : ""}
                </div>
                ${listenActions(word.lemma)}
                <div class="word-actions">
                  <button data-word-rate="${word.key}:known">认识</button>
                  <button data-word-rate="${word.key}:fuzzy">模糊</button>
                  <button data-word-rate="${word.key}:unknown">不认识</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderGrammar() {
  const grammar = courseData.sections?.grammar || [];
  return `
    <div class="chapter-header">
      <p class="eyebrow">Grammar</p>
      <h2>语法</h2>
      <p>语法点按全课程合并去重，下面保留来源。先看语法名，再到句子区用真实句子练口语。</p>
    </div>
    <section class="panel">
      <div class="section-title">
        <h2>全部语法点</h2>
        <span>${grammar.length} 条</span>
      </div>
      <div class="grammar-cards">
        ${grammar
          .map(
            (item) => `
              <article class="sentence-item grammar-card">
                <p class="eyebrow">${escapeHtml(item.source || "课程语法")}</p>
                <h3>${escapeHtml(item.title)}</h3>
                <p class="translation">${escapeHtml(item.chinese || "课程语法点，请结合例句学习。")}</p>
              </article>
            `,
          )
          .join("")}
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
  return `
    <div class="chapter-header">
      <p class="eyebrow">Sentences</p>
      <h2>句子</h2>
      <p>句子按难度排序。红色是未掌握词，黄色是模糊词；点击任意高亮单词可以看到原形、词性、中文释义和发音。</p>
    </div>
    <section class="panel">
      <div class="section-title">
        <h2>${state.onlyWeak ? "含生词的句子" : "全部句子"}</h2>
        <span>${sentences.length} / ${total} 条</span>
      </div>
      <div class="sentence-list">
        ${sentences
          .map((sentence) => {
            const unknown = sentenceUnknownCount(sentence.french);
            return `
              <article class="sentence-item ${unknown ? "has-unknown" : ""}">
                <div class="sentence-main">
                  <p lang="fr">${renderClickableSentence(sentence.french)}</p>
                  ${listenActions(sentence.french, "播放句子")}
                </div>
                <p class="translation"><strong>中文：</strong>${escapeHtml(sentence.chinese || "暂无中文提示")}</p>
                <p class="translation">待掌握词：${unknown} 个 · 来源：${escapeHtml(sentence.source || "课程句子")}</p>
              </article>
            `;
          })
          .join("")}
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
  const content =
    state.section === "review"
      ? renderReviewView()
      : state.section === "grammar"
        ? renderGrammar()
        : state.section === "sentences"
          ? renderSentences()
          : renderWords();
  app.innerHTML = renderShell(content);
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
    render();
  }
  if (target.dataset.toggleWeak !== undefined) {
    state.onlyWeak = !state.onlyWeak;
    state.cardIndex = 0;
    render();
  }
  if (target.dataset.toggleBeginner !== undefined) {
    state.beginnerMode = !state.beginnerMode;
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
  if (target.dataset.wordRate) {
    const [wordKey, rating] = target.dataset.wordRate.split(":");
    state.wordProgress = saveWordProgress(wordKey, rating);
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
