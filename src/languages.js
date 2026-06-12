import { getLanguage, getStarterWords, languageCatalog } from "./languageData.js";
import {
  calculateLanguageStats,
  deleteLanguageWord,
  exportLanguageContent,
  importLanguageContent,
  isLanguageReviewDue,
  loadLanguageContent,
  loadLanguageProgress,
  normalizeLanguageWord,
  rateLanguageWord,
  saveLanguageProgress,
  upsertLanguageWord,
} from "./languageStorage.js";
import {
  getLanguageVoiceOptions,
  getSelectedLanguageVoiceName,
  setSelectedLanguageVoiceName,
  speakLanguage,
} from "./languageSpeech.js";

const app = document.querySelector("#language-app");
const THEME_KEY = "multi-language-word-studio-theme";

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

const initialProgress = loadLanguageProgress();
const initialSession = initialProgress.sessions?.active || {};

const state = {
  languageId: initialSession.languageId || "en",
  mode: initialSession.mode || "foreignToZh",
  queue: initialSession.queue || "due",
  cardIndex: Number(initialSession.cardIndex) || 0,
  flipped: false,
  search: "",
  editingWordId: null,
  message: "",
  theme: loadTheme(),
  customContent: loadLanguageContent(),
  progress: initialProgress,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyTheme() {
  if (!document.body) return;
  document.body.className = document.body.className.replace(/\btheme-(light|dark)\b/g, "").trim();
  document.body.classList.add("language-studio");
  document.body.classList.add(`theme-${state.theme}`);
}

function starterWords(languageId) {
  return getStarterWords(languageId).map((word, index) =>
    normalizeLanguageWord({
      ...word,
      id: `starter-${languageId}-${index}`,
      languageId,
      source: "基础词库",
    }),
  );
}

function customWords(languageId = state.languageId) {
  return state.customContent.words.filter((word) => word.languageId === languageId);
}

function wordsForLanguage(languageId = state.languageId) {
  return [...starterWords(languageId), ...customWords(languageId)];
}

function allWords() {
  return languageCatalog.flatMap((language) => wordsForLanguage(language.id));
}

function currentLanguage() {
  return getLanguage(state.languageId);
}

function modeLabel(mode = state.mode) {
  const labels = {
    foreignToZh: "外语 → 中文",
    zhToForeign: "中文 → 外语",
    mixed: "随机互译",
  };
  return labels[mode] || labels.foreignToZh;
}

function queueLabel(queue = state.queue) {
  const labels = {
    due: "今日复习",
    new: "学新词",
    difficult: "只看错词",
    all: "全部词库",
  };
  return labels[queue] || labels.due;
}

function ratingLabel(rating) {
  const labels = { unknown: "不认识", fuzzy: "模糊", known: "认识" };
  return labels[rating] || "模糊";
}

function persistSession() {
  state.progress = saveLanguageProgress({
    ...state.progress,
    sessions: {
      ...(state.progress.sessions || {}),
      active: {
        languageId: state.languageId,
        mode: state.mode,
        queue: state.queue,
        cardIndex: state.cardIndex,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

function activeDirection() {
  if (state.mode === "mixed") return state.cardIndex % 2 === 0 ? "foreignToZh" : "zhToForeign";
  return state.mode;
}

function matchesQuery(word, query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return true;
  const language = getLanguage(word.languageId);
  const haystack = [
    word.term,
    word.chinese,
    word.pos,
    word.reading,
    word.example,
    language.label,
    language.nativeLabel,
    ...(word.forms || []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalized);
}

function searchResults() {
  const query = state.search.trim();
  if (!query) return [];
  return allWords().filter((word) => matchesQuery(word, query)).slice(0, 40);
}

function isNewWord(word) {
  return !state.progress.cards[word.id];
}

function isDifficultWord(word) {
  const record = state.progress.cards[word.id];
  if (!record) return false;
  return record.lastRating === "unknown" || record.lastRating === "fuzzy" || (record.fuzzy || 0) + (record.unknown || 0) > (record.known || 0);
}

function dueWords(words) {
  return words.filter((word) => isLanguageReviewDue(state.progress.cards[word.id]));
}

function wordsForQueue() {
  const words = wordsForLanguage();
  if (state.queue === "new") return words.filter(isNewWord);
  if (state.queue === "difficult") return words.filter(isDifficultWord);
  if (state.queue === "all") return words;
  const due = dueWords(words);
  if (due.length) return due;
  const fresh = words.filter(isNewWord);
  return fresh.length ? fresh : words;
}

function studyWords() {
  const words = wordsForQueue();
  const filtered = state.search.trim() ? words.filter((word) => matchesQuery(word, state.search)) : words;
  return filtered.length ? filtered : wordsForLanguage();
}

function currentWord() {
  const words = studyWords();
  return words[state.cardIndex % Math.max(words.length, 1)] || null;
}

function listenActions(word) {
  return `
    <div class="listen-actions">
      <button class="icon-button" data-speak="${escapeHtml(word.term)}" data-speak-language="${escapeHtml(word.languageId)}" aria-label="播放">▶</button>
      <button class="icon-button muted" data-slow="${escapeHtml(word.term)}" data-speak-language="${escapeHtml(word.languageId)}" aria-label="慢速">慢</button>
      <button class="icon-button extra-slow" data-extra-slow="${escapeHtml(word.term)}" data-speak-language="${escapeHtml(word.languageId)}" aria-label="超慢">超慢</button>
    </div>
  `;
}

function renderHeader() {
  return `
    <header class="topbar language-topbar">
      <div class="brand-block">
        <p class="eyebrow">Language Word Studio</p>
        <h1>多语言单词学习</h1>
        <p>用翻译卡片背英语、韩语、法语、日语。查词、发音和自己加词都在一个页面里。</p>
      </div>
      <div class="top-actions language-tabs">
        ${languageCatalog
          .map(
            (language) =>
              `<button class="${state.languageId === language.id ? "active" : ""}" data-language="${language.id}">${language.label}</button>`,
          )
          .join("")}
        <button data-toggle-theme>${state.theme === "dark" ? "浅色" : "深色"}</button>
      </div>
    </header>
  `;
}

function renderVoicePanel() {
  const language = currentLanguage();
  const voices = getLanguageVoiceOptions(state.languageId);
  const selected = getSelectedLanguageVoiceName(state.languageId);
  return `
    <section class="language-voice-panel" aria-label="语音引擎">
      <label for="language-voice-select">语音引擎</label>
      <div class="language-voice-row">
        <select id="language-voice-select" data-language-voice-select>
          <option value="">自动选择 ${escapeHtml(language.nativeLabel)}</option>
          ${voices
            .map(
              (voice) => `
                <option value="${escapeHtml(voice.name)}" ${voice.name === selected ? "selected" : ""}>
                  ${escapeHtml(voice.name)} · ${escapeHtml(voice.lang)}
                </option>
              `,
            )
            .join("")}
        </select>
        <button type="button" data-test-voice>试听</button>
      </div>
      <p>${voices.length ? "如果发音不自然，可以在这里换手机或电脑里的语音引擎。" : "当前浏览器没有检测到这个语言的语音包。"}</p>
    </section>
  `;
}

function renderIntroPanel() {
  return `
    <section class="chapter-header language-hero">
      <div>
        <p class="eyebrow">Words Only</p>
        <h2>${escapeHtml(currentLanguage().label)}单词</h2>
        <p>每天先复习到期词，再学新词。学习记录会自动保存在这个浏览器里。</p>
      </div>
      ${renderVoicePanel()}
    </section>
  `;
}

function renderSearchPanel() {
  const results = searchResults();
  return `
    <section class="panel language-search-panel">
      <div class="section-title">
        <h2>查单词</h2>
        <span>${state.search ? `${results.length} 个结果` : "全部语言"}</span>
      </div>
      <input data-language-search value="${escapeHtml(state.search)}" placeholder="搜索单词或中文" />
      <div class="language-search-results">
        ${
          state.search
            ? results.length
              ? results.map(renderSearchResult).join("")
              : `<p class="empty">没有找到，可以在下面添加到我的词库。</p>`
            : `<p class="empty">可以输入外语、中文、读音或词形，例如 water、水、bonjour。</p>`
        }
      </div>
    </section>
  `;
}

function renderSearchResult(word) {
  const language = getLanguage(word.languageId);
  return `
    <article class="language-result">
      <div>
        <span>${escapeHtml(language.label)}</span>
        <strong lang="${escapeHtml(language.speechLang)}">${escapeHtml(word.term)}</strong>
        <p>${escapeHtml(word.chinese)} · ${escapeHtml(word.pos)}</p>
        ${word.reading ? `<small>${escapeHtml(word.reading)}</small>` : ""}
      </div>
      ${listenActions(word)}
    </article>
  `;
}

function renderProgressPanel() {
  const stats = calculateLanguageStats(wordsForLanguage(), state.progress);
  return `
    <section class="panel language-progress-panel">
      <div class="section-title">
        <h2>今日任务</h2>
        <span>${queueLabel()}</span>
      </div>
      <div class="language-stats-grid">
        <div class="language-stat"><strong>${stats.total}</strong><span>总词数</span></div>
        <div class="language-stat"><strong>${stats.due}</strong><span>今日待复习</span></div>
        <div class="language-stat"><strong>${stats.newCount}</strong><span>新词</span></div>
        <div class="language-stat"><strong>${stats.mastered}</strong><span>已掌握</span></div>
      </div>
      <div class="mode-tabs language-queue-tabs">
        ${["due", "new", "difficult", "all"]
          .map((queue) => `<button class="${state.queue === queue ? "active" : ""}" data-queue="${queue}">${queueLabel(queue)}</button>`)
          .join("")}
      </div>
      <p class="review-note">不认识：10 分钟后再来；模糊：6 小时后再来；连续认识会进入 1 天、3 天、7 天、15 天、30 天的长期复习。</p>
    </section>
  `;
}

function renderStudyCard() {
  const words = studyWords();
  const word = currentWord();
  if (!word) {
    return `<section class="panel"><p class="empty">这个语言还没有单词。</p></section>`;
  }
  const direction = activeDirection();
  const prompt = direction === "zhToForeign" ? word.chinese : word.term;
  const answerMain = direction === "zhToForeign" ? word.term : word.chinese;
  const language = currentLanguage();
  return `
    <section class="panel word-study-panel language-study-panel">
      <div class="section-title">
        <h2>${escapeHtml(language.label)} · ${queueLabel()}</h2>
        <span>${(state.cardIndex % words.length) + 1} / ${words.length}</span>
      </div>
      <div class="mode-tabs language-mode-tabs">
        ${["foreignToZh", "zhToForeign", "mixed"]
          .map((mode) => `<button class="${state.mode === mode ? "active" : ""}" data-mode="${mode}">${modeLabel(mode)}</button>`)
          .join("")}
      </div>
      <article class="study-card language-card">
        <div class="card-progress">
          <span>${direction === "zhToForeign" ? "看中文，说外语" : "看外语，想中文"}</span>
          <span>${escapeHtml(word.source || "基础词库")}</span>
        </div>
        <div class="study-card-face">
          <h3 lang="${escapeHtml(language.speechLang)}">${escapeHtml(prompt)}</h3>
          ${direction === "foreignToZh" && word.reading ? `<p class="ipa big">读音 ${escapeHtml(word.reading)}</p>` : ""}
          ${listenActions(word)}
        </div>
        <div class="study-card-back ${state.flipped ? "visible" : ""}">
          <p class="answer-main" lang="${escapeHtml(language.speechLang)}">${escapeHtml(answerMain)}</p>
          <p class="meta">${escapeHtml(word.pos)} · 词形：${escapeHtml(word.forms.join(", "))}</p>
          ${word.reading ? `<p class="ipa">读音 ${escapeHtml(word.reading)}</p>` : ""}
          ${word.example ? `<p class="lookup-example">${escapeHtml(word.example)}</p>` : ""}
        </div>
      </article>
      <div class="word-deck-actions">
        <button data-prev-word>上一张</button>
        <button class="primary-action" data-flip-word>${state.flipped ? "隐藏答案" : "显示答案"}</button>
        <button data-next-word>下一张</button>
      </div>
      <div class="word-actions language-rate-actions">
        <button data-rate-language="${escapeHtml(word.id)}:unknown">不认识</button>
        <button data-rate-language="${escapeHtml(word.id)}:fuzzy">模糊</button>
        <button data-rate-language="${escapeHtml(word.id)}:known">认识</button>
      </div>
    </section>
  `;
}

function csvForms(forms) {
  return (forms || []).join(", ");
}

function renderWordForm() {
  const editing = state.customContent.words.find((word) => word.id === state.editingWordId) || {};
  const language = currentLanguage();
  return `
    <form class="panel custom-form language-word-form" data-language-word-form>
      <div class="section-title">
        <h2>${editing.id ? "编辑单词" : `添加${language.label}单词`}</h2>
        ${editing.id ? `<button type="button" class="text-button" data-cancel-edit>取消编辑</button>` : ""}
      </div>
      <input type="hidden" name="id" value="${escapeHtml(editing.id || "")}">
      <label>单词<input name="term" required value="${escapeHtml(editing.term || "")}" placeholder="ex. hello"></label>
      <label>中文翻译<input name="chinese" required value="${escapeHtml(editing.chinese || "")}" placeholder="ex. 你好"></label>
      <label>词性<input name="pos" value="${escapeHtml(editing.pos || "")}" placeholder="名词 / 动词 / 形容词"></label>
      <label>读音/音标<input name="reading" value="${escapeHtml(editing.reading || "")}" placeholder="ex. /həˈloʊ/ 或 annyeonghaseyo"></label>
      <label>词形<textarea name="forms" rows="2" placeholder="复数、变位、假名、罗马音，用逗号分开">${escapeHtml(csvForms(editing.forms))}</textarea></label>
      <label>例句<textarea name="example" rows="3" placeholder="ex. Hello, nice to meet you.">${escapeHtml(editing.example || "")}</textarea></label>
      <button class="primary-action" type="submit">${editing.id ? "保存单词" : "添加单词"}</button>
    </form>
  `;
}

function renderCustomList() {
  const words = customWords();
  return `
    <section class="panel custom-list-panel">
      <div class="section-title">
        <h2>我的${currentLanguage().label}词库</h2>
        <span>${words.length} 个</span>
      </div>
      ${
        words.length
          ? words
              .map(
                (word) => `
                  <article class="custom-item">
                    <div>
                      <strong lang="${escapeHtml(currentLanguage().speechLang)}">${escapeHtml(word.term)}</strong>
                      <p>${escapeHtml(word.chinese)} · ${escapeHtml(word.pos)}</p>
                      ${word.reading ? `<small>${escapeHtml(word.reading)}</small>` : ""}
                    </div>
                    <div class="custom-actions">
                      ${listenActions(word)}
                      <button data-edit-word="${escapeHtml(word.id)}">编辑</button>
                      <button class="danger-button" data-delete-word="${escapeHtml(word.id)}">删除</button>
                    </div>
                  </article>
                `,
              )
              .join("")
          : `<p class="empty">还没有自己添加的${currentLanguage().label}单词。</p>`
      }
    </section>
  `;
}

function renderBackupPanel() {
  return `
    <section class="panel custom-backup-panel">
      <div>
        <h2>备份我的词库</h2>
        <p>导出 JSON 后可以发给我，我帮你合并进 GitHub。换电脑或手机时，也可以粘贴 JSON 导入回来。</p>
      </div>
      <div class="backup-actions">
        <button data-export-language>导出我的词库</button>
        <button data-import-language>导入粘贴内容</button>
      </div>
      <textarea data-language-import-text rows="5" placeholder="把导出的 JSON 内容粘贴到这里"></textarea>
    </section>
  `;
}

function render() {
  applyTheme();
  app.innerHTML = `
    ${renderHeader()}
    <main class="layout language-layout">
      ${state.message ? `<p class="custom-message">${escapeHtml(state.message)}</p>` : ""}
      <div class="language-grid">
        ${renderStudyCard()}
        <aside class="language-side-flow">
          ${renderIntroPanel()}
          ${renderProgressPanel()}
          ${renderSearchPanel()}
        </aside>
      </div>
      <div class="custom-grid">
        ${renderWordForm()}
        ${renderCustomList()}
      </div>
      ${renderBackupPanel()}
    </main>
  `;
}

function parseFormsText(value, term) {
  const forms = String(value || "")
    .split(/[,，;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (term && !forms.includes(term)) forms.unshift(term);
  return [...new Set(forms)];
}

function formValue(form, name) {
  return String(new FormData(form).get(name) || "").trim();
}

function downloadContent() {
  const json = exportLanguageContent(state.customContent, state.progress);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `my-language-words-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild?.(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.speak) speakLanguage(target.dataset.speak, target.dataset.speakLanguage || state.languageId);
  if (target.dataset.slow) speakLanguage(target.dataset.slow, target.dataset.speakLanguage || state.languageId, { slow: true });
  if (target.dataset.extraSlow) speakLanguage(target.dataset.extraSlow, target.dataset.speakLanguage || state.languageId, { extraSlow: true });

  if (target.dataset.language) {
    state.languageId = target.dataset.language;
    state.cardIndex = 0;
    state.flipped = false;
    state.editingWordId = null;
    state.message = "";
    persistSession();
    render();
  }
  if (target.dataset.mode) {
    state.mode = target.dataset.mode;
    state.flipped = false;
    persistSession();
    render();
  }
  if (target.dataset.queue) {
    state.queue = target.dataset.queue;
    state.cardIndex = 0;
    state.flipped = false;
    state.search = "";
    persistSession();
    render();
  }
  if (target.dataset.toggleTheme !== undefined) {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, state.theme);
    render();
  }
  if (target.dataset.prevWord !== undefined) {
    const words = studyWords();
    state.cardIndex = (state.cardIndex - 1 + words.length) % Math.max(words.length, 1);
    state.flipped = false;
    persistSession();
    render();
  }
  if (target.dataset.nextWord !== undefined) {
    const words = studyWords();
    state.cardIndex = (state.cardIndex + 1) % Math.max(words.length, 1);
    state.flipped = false;
    persistSession();
    render();
  }
  if (target.dataset.flipWord !== undefined) {
    state.flipped = !state.flipped;
    render();
  }
  if (target.dataset.rateLanguage) {
    const [wordId, rating] = target.dataset.rateLanguage.split(":");
    state.progress = rateLanguageWord(state.progress, wordId, rating);
    state.message = `已记录：${ratingLabel(rating)}。`;
    const words = studyWords();
    state.cardIndex = words.length ? state.cardIndex % words.length : 0;
    state.flipped = false;
    persistSession();
    render();
  }
  if (target.dataset.editWord) {
    state.editingWordId = target.dataset.editWord;
    state.message = "";
    render();
  }
  if (target.dataset.cancelEdit !== undefined) {
    state.editingWordId = null;
    render();
  }
  if (target.dataset.deleteWord) {
    if (typeof window.confirm !== "function" || window.confirm("删除这个单词吗？")) {
      state.customContent = deleteLanguageWord(state.customContent, target.dataset.deleteWord);
      state.editingWordId = null;
      state.message = "已删除单词。";
      render();
    }
  }
  if (target.dataset.exportLanguage !== undefined) {
    downloadContent();
    state.message = "已导出 JSON 备份。";
    render();
  }
  if (target.dataset.importLanguage !== undefined) {
    const textarea = app.querySelector("[data-language-import-text]");
    try {
      state.customContent = importLanguageContent(textarea?.value || "", state.customContent);
      state.progress = loadLanguageProgress();
      state.message = "导入成功，词库已合并。";
    } catch {
      state.message = "导入失败：请粘贴完整的 JSON 内容。";
    }
    render();
  }
  if (target.dataset.testVoice !== undefined) {
    speakLanguage(currentWord()?.term || "hello", state.languageId);
  }
});

app.addEventListener("change", (event) => {
  if (!event.target.matches("[data-language-voice-select]")) return;
  setSelectedLanguageVoiceName(state.languageId, event.target.value);
  speakLanguage(currentWord()?.term || "hello", state.languageId);
  render();
});

window.addEventListener?.("languageVoicesChanged", render);

app.addEventListener("input", (event) => {
  if (!event.target.matches("[data-language-search]")) return;
  state.search = event.target.value;
  state.cardIndex = 0;
  state.flipped = false;
  render();
});

app.addEventListener("submit", (event) => {
  const form = event.target;
  if (!form?.matches?.("[data-language-word-form]")) return;
  event.preventDefault();
  const term = formValue(form, "term");
  state.customContent = upsertLanguageWord(state.customContent, {
    id: formValue(form, "id") || undefined,
    languageId: state.languageId,
    term,
    chinese: formValue(form, "chinese"),
    pos: formValue(form, "pos"),
    reading: formValue(form, "reading"),
    forms: parseFormsText(formValue(form, "forms"), term),
    example: formValue(form, "example"),
  });
  state.editingWordId = null;
  state.search = "";
  state.message = "单词已保存，会出现在当前语言的单词卡片里。";
  render();
});

render();
