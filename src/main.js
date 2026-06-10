import { courseData } from "./data/courseData.js?v=ui-polish";
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
  view: "chapter",
  chapterId: courseData.chapters[0]?.id,
  studyMode: "words",
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

function currentChapter() {
  return courseData.chapters.find((item) => item.id === state.chapterId) || courseData.chapters[0];
}

function normalizeVocabItem(item) {
  const lemma = item.lemma || item.french || item.front || item.word || "";
  const key = item.key || lemma.toLowerCase();
  return {
    ...item,
    key,
    lemma,
    pos: item.pos || "词汇",
    chinese: item.chinese || item.back || "课程词汇",
    forms: Array.isArray(item.forms) && item.forms.length ? item.forms : [lemma].filter(Boolean),
    frequency: item.frequency || 1,
    example: item.example || "",
  };
}

function findWord(chapter, rawWord) {
  const normalized = normalizeWord(rawWord);
  const key = chapter.wordIndex?.[normalized] || chapter.wordIndex?.[normalized.replace(/s$/, "")] || normalized;
  const found = chapter.vocabulary.find((word) => {
    const item = normalizeVocabItem(word);
    return item.key === key || item.lemma.toLowerCase() === key;
  });
  return found ? normalizeVocabItem(found) : null;
}

function wordStatus(word) {
  return getWordStatus(state.wordProgress, normalizeVocabItem(word).key);
}

function chapterStats(chapter) {
  const total = chapter.vocabulary.length;
  const known = chapter.vocabulary.map(normalizeVocabItem).filter((word) => wordStatus(word) === "known").length;
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

function renderShell(content) {
  const voices = getVoiceOptions();
  const selectedVoice = getSelectedVoiceName();
  const chapter = currentChapter();
  const stats = chapterStats(chapter);
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">20课完整学习版</p>
        <h1>${escapeHtml(courseData.title)}</h1>
      </div>
      <div class="top-actions">
        <button class="${state.view === "chapter" ? "active" : ""}" data-view="chapter">课程</button>
        <button class="${state.view === "review" ? "active" : ""}" data-view="review">复习</button>
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
          <span>本课总词汇</span>
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
          <strong>${courseData.reviewCards.length}</strong>
          <span>总卡片</span>
        </div>
        <nav>
          ${courseData.chapters
            .map(
              (item) => `
                <button class="chapter-link ${item.id === state.chapterId ? "active" : ""}" data-chapter="${item.id}">
                  ${escapeHtml(item.title)}
                </button>
              `,
            )
            .join("")}
        </nav>
      </aside>
      <section class="content">${content}</section>
    </main>
    ${renderLookup()}
  `;
}

function renderStudyControls(chapter) {
  const modes = [
    ["words", "单词"],
    ["phrases", "短语"],
    ["sentences", "句子"],
    ["dialogues", "对话/课文"],
  ];
  return `
    <div class="study-controls">
      <div class="mode-tabs">
        ${modes.map(([key, label]) => `<button class="${state.studyMode === key ? "active" : ""}" data-mode="${key}">${label}</button>`).join("")}
      </div>
      <div class="toggles">
        <button class="${state.onlyWeak ? "active" : ""}" data-toggle-weak>仅复习生词</button>
        <button class="${state.beginnerMode ? "active" : ""}" data-toggle-beginner>初级模式</button>
      </div>
      <p>学习顺序：${chapter.learningPath.join(" -> ")}。句子里的高亮词表示还没掌握，点击可查词。</p>
    </div>
  `;
}

function filteredWords(chapter) {
  const words = chapter.vocabulary.map(normalizeVocabItem);
  if (!state.onlyWeak) return words;
  return words.filter((word) => isWeakWord(state.wordProgress.words[word.key]));
}

function renderWords(chapter) {
  const words = filteredWords(chapter);
  return `
    <section class="panel">
      <div class="section-title">
        <h2>单词库</h2>
        <span>${words.length} / ${chapter.vocabulary.length} 个</span>
      </div>
      <div class="vocab-grid dense">
        ${words
          .map((word) => {
            const normalizedWord = normalizeVocabItem(word);
            const status = wordStatus(normalizedWord);
            return `
              <article class="vocab-item word-card status-${status}">
                <div class="vocab-copy">
                  <button class="word-title" data-lookup="${normalizedWord.key}" lang="fr">${escapeHtml(normalizedWord.lemma)}</button>
                  <span class="meta">${escapeHtml(normalizedWord.pos)} · ${escapeHtml(normalizedWord.forms.join(", "))}</span>
                  <p>${escapeHtml(normalizedWord.chinese)}</p>
                  ${normalizedWord.example ? `<small>${renderClickableSentence(normalizedWord.example, chapter)}</small>` : ""}
                </div>
                ${listenActions(normalizedWord.lemma)}
                <div class="word-actions">
                  <button data-word-rate="${normalizedWord.key}:known">认识</button>
                  <button data-word-rate="${normalizedWord.key}:fuzzy">模糊</button>
                  <button data-word-rate="${normalizedWord.key}:unknown">不认识</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderPhrases(chapter) {
  return `
    <section class="panel">
      <div class="section-title">
        <h2>短语/词块</h2>
        <span>${chapter.phrases.length} 条</span>
      </div>
      <div class="sentence-list">
        ${chapter.phrases
          .map(
            (phrase) => `
              <article class="sentence-item">
                <div class="sentence-main">
                  <p lang="fr">${renderClickableSentence(phrase, chapter)}</p>
                  ${listenActions(phrase, "播放短语")}
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function sentenceUnknownCount(sentence, chapter) {
  return tokenizeFrenchText(sentence).filter((token) => {
    const word = findWord(chapter, token);
    return word && wordStatus(word) !== "known";
  }).length;
}

function renderSentences(chapter) {
  const sentences = [...chapter.sentences].sort((a, b) => {
    if (!state.beginnerMode) return 0;
    return sentenceUnknownCount(a, chapter) - sentenceUnknownCount(b, chapter);
  });
  return `
    <section class="panel">
      <div class="section-title">
        <h2>句子</h2>
        <span>${sentences.length} 条</span>
      </div>
      <div class="sentence-list">
        ${sentences
          .map((sentence) => {
            const unknown = sentenceUnknownCount(sentence, chapter);
            return `
              <article class="sentence-item ${unknown ? "has-unknown" : ""}">
                <div class="sentence-main">
                  <p lang="fr">${renderClickableSentence(sentence, chapter)}</p>
                  ${listenActions(sentence, "播放句子")}
                </div>
                ${unknown ? `<p class="translation">未掌握词：${unknown} 个。点击高亮词查看释义。</p>` : `<p class="translation">初级友好：当前词汇基本已掌握。</p>`}
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderDialogues(chapter) {
  return `
    <section class="panel">
      <div class="section-title">
        <h2>对话/课文</h2>
        <span>${chapter.dialogues.length} 组</span>
      </div>
      <div class="sentence-list">
        ${
          chapter.dialogues.length
            ? chapter.dialogues
                .map(
                  (dialogue) => `
                    <article class="sentence-item dialogue-block">
                      ${dialogue
                        .split("\n")
                        .map((line) => `<p lang="fr">${renderClickableSentence(line, chapter)}</p>`)
                        .join("")}
                      ${listenActions(dialogue.replace(/\n/g, " "), "播放对话")}
                    </article>
                  `,
                )
                .join("")
            : `<p class="empty">这一课没有识别到完整 A/B 对话，先练句子。</p>`
        }
      </div>
    </section>
  `;
}

function renderGrammar(chapter) {
  if (!chapter.grammar?.length) return "";
  return `
    <section class="panel">
      <div class="section-title">
        <h2>语法线索</h2>
        <span>${chapter.grammar.length} 条</span>
      </div>
      <ul class="grammar-list">
        ${chapter.grammar.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderChapterView() {
  const chapter = currentChapter();
  const body =
    state.studyMode === "words"
      ? renderWords(chapter)
      : state.studyMode === "phrases"
        ? renderPhrases(chapter)
        : state.studyMode === "sentences"
          ? renderSentences(chapter)
          : renderDialogues(chapter);
  return renderShell(`
    <div class="chapter-header">
      <p class="eyebrow">Cours ${String(chapter.course).padStart(2, "0")}</p>
      <h2>${escapeHtml(chapter.topic)}</h2>
      <p>先把本课单词过一遍，再进入短语、句子和对话。Cours12 是复习课，已并入前后课程。</p>
    </div>
    ${renderStudyControls(chapter)}
    ${body}
    ${renderGrammar(chapter)}
  `);
}

function renderClickableSentence(text, chapter) {
  let output = "";
  let lastIndex = 0;
  for (const match of String(text || "").matchAll(WORD_RE)) {
    const raw = match[0];
    output += escapeHtml(String(text).slice(lastIndex, match.index));
    const word = findWord(chapter, raw);
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
  const chapter = currentChapter();
  let cards = courseData.reviewCards.filter((card) => card.chapterId === chapter.id || state.view === "review");
  if (state.onlyWeak) {
    cards = cards.filter((card) => {
      if (!card.wordKey) return false;
      return isWeakWord(state.wordProgress.words[card.wordKey]);
    });
  }
  return cards.length ? cards : courseData.reviewCards;
}

function renderReviewView() {
  const cards = getReviewCards();
  const card = cards[state.cardIndex % cards.length];
  const progress = state.progress[card.id];
  return renderShell(`
    <div class="review-stage">
      <div class="review-meta">
        <span>${state.cardIndex + 1} / ${cards.length}</span>
        <button class="${state.onlyWeak ? "active" : ""}" data-toggle-weak>仅复习生词</button>
        <button class="text-button" data-reset-progress>重置进度</button>
      </div>
      <article class="flashcard ${state.cardFlipped ? "flipped" : ""}" data-flip-card>
        <p class="eyebrow">${cardLabel(card)} ${card.chapter ? `· ${escapeHtml(card.chapter)}` : ""}</p>
        ${renderCardFront(card)}
        <div class="card-back">
          <p>${escapeHtml(card.back)}</p>
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
  `);
}

function cardLabel(card) {
  if (card.type === "vocabulary") return "单词";
  if (card.type === "phrase") return "短语";
  if (card.type === "dialogue") return "对话";
  return "句子";
}

function renderCardFront(card) {
  if (card.type === "dialogue") {
    return `
      <div class="dialogue-card">
        ${(card.dialogue || card.front)
          .split("\n")
          .map((line) => `<div class="dialogue-line"><p lang="fr">${escapeHtml(line)}</p>${listenActions(line)}</div>`)
          .join("")}
      </div>
    `;
  }
  return `
    <h2 lang="fr">${escapeHtml(card.front)}</h2>
    ${card.pos ? `<p class="ipa big">${escapeHtml(card.pos)}</p>` : ""}
    <div class="listen-row">${playButton(card.front, "播放卡片")}${slowButton(card.front)}${extraSlowButton(card.front)}</div>
  `;
}

function renderLookup() {
  if (!state.lookupWordKey) return "";
  const chapter = currentChapter();
  const word = chapter.vocabulary.find((item) => item.key === state.lookupWordKey);
  const normalizedWord = word ? normalizeVocabItem(word) : null;
  if (!normalizedWord) return "";
  const status = wordStatus(normalizedWord);
  return `
    <div class="lookup-backdrop" data-close-lookup>
      <aside class="lookup-popover" role="dialog" aria-modal="true">
        <button class="text-button close" data-close-lookup>关闭</button>
        <p class="eyebrow">点击查词</p>
        <h2 lang="fr">${escapeHtml(normalizedWord.lemma)}</h2>
        <p>${escapeHtml(normalizedWord.chinese)}</p>
        <p><strong>词性：</strong>${escapeHtml(normalizedWord.pos)}</p>
        <p><strong>出现形式：</strong>${escapeHtml(normalizedWord.forms.join(", "))}</p>
        <p><strong>状态：</strong>${status === "known" ? "已掌握" : status === "fuzzy" ? "模糊" : "未掌握"}</p>
        ${normalizedWord.example ? `<p class="lookup-example">${escapeHtml(normalizedWord.example)}</p>` : ""}
        ${listenActions(normalizedWord.lemma)}
        <div class="word-actions large">
          <button data-word-rate="${normalizedWord.key}:known">认识</button>
          <button data-word-rate="${normalizedWord.key}:fuzzy">模糊</button>
          <button data-word-rate="${normalizedWord.key}:unknown">不认识</button>
        </div>
      </aside>
    </div>
  `;
}

function render() {
  app.innerHTML = state.view === "review" ? renderReviewView() : renderChapterView();
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("button, [data-flip-card], [data-close-lookup]");
  if (!target) return;

  if (target.dataset.speak) speakFrench(target.dataset.speak);
  if (target.dataset.slow) speakFrench(target.dataset.slow, { slow: true });
  if (target.dataset.extraSlow) speakFrench(target.dataset.extraSlow, { extraSlow: true });
  if (target.dataset.view) {
    state.view = target.dataset.view;
    render();
  }
  if (target.dataset.chapter) {
    state.view = "chapter";
    state.chapterId = target.dataset.chapter;
    state.cardIndex = 0;
    render();
  }
  if (target.dataset.mode) {
    state.studyMode = target.dataset.mode;
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
