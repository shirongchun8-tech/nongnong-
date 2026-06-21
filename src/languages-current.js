import { getLanguage, getStarterWords, getVocabularyComparison, languageCatalog } from "./languageData-current.js?v=daily-plan-study";
import {
  calculateLanguageStats,
  completeDailyLanguageWord,
  deleteLanguageWord,
  ensureDailyLanguagePlan,
  exportLanguageContent,
  getLanguageCardStatus,
  getDailyLanguagePlanStats,
  importLanguageContent,
  isLanguageReviewDue,
  languageStatusLabel,
  loadLanguageContent,
  loadLanguageProgress,
  normalizeLanguageWord,
  rateLanguageWord,
  saveDailyLanguagePlan,
  saveLanguageProgress,
  upsertLanguageWord,
} from "./languageStorage.js?v=daily-plan-study";
import {
  getLanguageVoiceOptions,
  getSelectedLanguageVoiceName,
  setSelectedLanguageVoiceName,
  speakLanguage,
} from "./languageSpeech.js?v=daily-plan-study";

const app = document.querySelector("#language-app");
const THEME_KEY = "multi-language-word-studio-theme";

function registerOfflineApp() {
  if (typeof window === "undefined" || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

registerOfflineApp();

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  } catch {
    return "dark";
  }
}

const initialProgress = loadLanguageProgress();
const initialSession = initialProgress.sessions?.active || {};

const state = {
  languageId: initialSession.languageId || "en",
  queue: initialSession.queue || "smart",
  cardIndex: Number(initialSession.cardIndex) || 0,
  flipped: false,
  practiceCount: Number(initialSession.practiceCount) || 0,
  forceKnownReview: Boolean(initialSession.forceKnownReview),
  search: "",
  editingWordId: null,
  editorOpen: false,
  toolsOpen: false,
  tappedWord: null,
  speechSpeed: "normal",
  message: "",
  theme: loadTheme(),
  customContent: loadLanguageContent(),
  progress: initialProgress,
};

let lastAutoSpeakKey = "";

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

function queueLabel(queue = state.queue) {
  const labels = {
    smart: "智能练习",
    all: "全部词库",
    unlearned: "未学习",
    unknown: "不认识",
    vague: "模糊",
    known: "认识",
  };
  return labels[queue] || labels.smart;
}

function ratingLabel(rating) {
  const labels = { unknown: "不认识", vague: "模糊", fuzzy: "模糊", known: "认识" };
  return labels[rating] || "模糊";
}

function wordStatus(word) {
  return getLanguageCardStatus(state.progress.cards[word.id]);
}

function ensureTodayPlan(languageId = state.languageId) {
  const plan = ensureDailyLanguagePlan(state.progress, wordsForLanguage(languageId), { languageId });
  const existing = state.progress.dailyPlans?.[languageId];
  if (existing?.dateKey !== plan.dateKey) {
    state.progress = saveDailyLanguagePlan(state.progress, languageId, plan);
  }
  return state.progress.dailyPlans?.[languageId] || plan;
}

function currentDailyPlan() {
  return ensureTodayPlan();
}

function dailyPlanStats() {
  return getDailyLanguagePlanStats(currentDailyPlan());
}

function persistSession() {
  state.progress = saveLanguageProgress({
    ...state.progress,
    sessions: {
      ...(state.progress.sessions || {}),
      active: {
        languageId: state.languageId,
        queue: state.queue,
        cardIndex: state.cardIndex,
        practiceCount: state.practiceCount,
        forceKnownReview: state.forceKnownReview,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

function speechOptions() {
  return {
    slow: state.speechSpeed === "slow",
    extraSlow: state.speechSpeed === "extraSlow",
  };
}

function tokenKey(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase()
    .replace(/[.,!?;:()[\]{}"“”]/g, "");
}

function splitFrenchApostrophe(token) {
  const match = String(token).match(/^([A-Za-zÀ-ÿ]{1,2}['’])(.+)$/);
  return match ? [match[1], match[2]] : [token];
}

function tokenizeText(text) {
  const matches = String(text || "").match(/[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)?|[^\s\p{L}\p{M}\p{N}]/gu) || [];
  return matches.flatMap((token) => (/[\p{L}\p{M}\p{N}]/u.test(token) ? splitFrenchApostrophe(token) : [token]));
}

function findWordByToken(token, languageId = state.languageId) {
  const key = tokenKey(token);
  if (!key) return null;
  return wordsForLanguage(languageId).find((word) => {
    const values = [word.term, ...(word.forms || [])].map(tokenKey);
    return values.includes(key);
  });
}

function renderTapTokens(text, languageId = state.languageId) {
  return tokenizeText(text)
    .map((token) => {
      const isWord = /[\p{L}\p{M}\p{N}]/u.test(token);
      if (!isWord) return `<span class="tap-punct">${escapeHtml(token)}</span>`;
      const active = tokenKey(state.tappedWord?.text) === tokenKey(token) ? " active" : "";
      return `<button type="button" class="tap-word${active}" data-tap-word="${escapeHtml(token)}" data-tap-word-language="${escapeHtml(languageId)}">${escapeHtml(token)}</button>`;
    })
    .join("");
}

function renderTappedLookup() {
  if (!state.tappedWord?.text) return "";
  const match = findWordByToken(state.tappedWord.text, state.tappedWord.languageId);
  return `
    <section class="tap-lookup">
      <p class="eyebrow">当前点读</p>
      <h3 lang="${escapeHtml(getLanguage(state.tappedWord.languageId).speechLang)}">${escapeHtml(state.tappedWord.text)}</h3>
      ${
        match
          ? `
            <p>原形：${escapeHtml(match.term)}</p>
            <p>词性：${escapeHtml(match.pos)}</p>
            <p>释义：${escapeHtml(match.chinese)}</p>
          `
          : `<p>这个词还不在词库里，可以在“管理我的词库”里添加释义。</p>`
      }
    </section>
  `;
}

function speedControl() {
  const labels = [
    ["normal", "正常"],
    ["slow", "慢速"],
    ["extraSlow", "超慢"],
  ];
  return `
    <div class="speed-tabs" aria-label="语速">
      ${labels.map(([speed, label]) => `<button type="button" class="${state.speechSpeed === speed ? "active" : ""}" data-speech-speed="${speed}">${label}</button>`).join("")}
    </div>
  `;
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
  return wordStatus(word) === "unlearned";
}

function isDifficultWord(word) {
  return ["unknown", "vague"].includes(wordStatus(word));
}

function dueWords(words) {
  return words.filter((word) => isLanguageReviewDue(state.progress.cards[word.id]));
}

function wordsForQueue() {
  const words = wordsForLanguage();
  if (state.queue === "all") return words;
  if (["unlearned", "unknown", "vague", "known"].includes(state.queue)) return words.filter((word) => wordStatus(word) === state.queue);
  const plan = currentDailyPlan();
  const completed = new Set([...plan.completedNewIds, ...plan.completedReviewIds]);
  const plannedIds = [...plan.reviewWordIds, ...plan.newWordIds].filter((id) => !completed.has(id));
  const planned = plannedIds.map((id) => words.find((word) => word.id === id)).filter(Boolean);
  if (planned.length) return planned;
  const known = words.filter((word) => wordStatus(word) === "known");
  if (state.forceKnownReview && known.length) return known;
  const unknown = words.filter((word) => wordStatus(word) === "unknown");
  const vague = words.filter((word) => wordStatus(word) === "vague");
  const unlearned = words.filter((word) => wordStatus(word) === "unlearned");
  const dueKnown = dueWords(known);
  return [...unknown, ...vague, ...unlearned, ...dueKnown, ...known];
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
    </div>
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

function renderLanguageTools() {
  return `
    <section class="language-switch-panel" aria-label="语言和主题">
      <div class="language-switch-row">
        ${languageCatalog
          .map(
            (language) =>
              `<button class="${state.languageId === language.id ? "active" : ""}" data-language="${language.id}">${language.label}</button>`,
          )
          .join("")}
      </div>
      <button class="language-theme-toggle" type="button" data-toggle-theme>${state.theme === "dark" ? "浅色" : "深色"}</button>
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

function renderVocabularyComparison(word) {
  const comparison = getVocabularyComparison(word);
  if (!comparison) return "";
  return `
    <section class="vocabulary-comparison" aria-label="四语对照">
      <div class="comparison-title">
        <span>四语对照</span>
        <strong>${escapeHtml(comparison.baseTerm)}</strong>
      </div>
      <div class="comparison-grid">
        ${comparison.items
          .map((item) => {
            if (!item.word) return "";
            return `
              <div class="comparison-item">
                <span>${escapeHtml(item.label)}</span>
                <strong lang="${escapeHtml(getLanguage(item.languageId).speechLang)}">${escapeHtml(item.word.term)}</strong>
                ${item.word.reading ? `<small>${escapeHtml(item.word.reading)}</small>` : ""}
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderProgressPanel() {
  const stats = calculateLanguageStats(wordsForLanguage(), state.progress);
  return `
    <section class="panel language-progress-panel">
      <div class="section-title">
        <h2>状态统计</h2>
        <span>${queueLabel()}</span>
      </div>
      <div class="language-stats-grid">
        <div class="language-stat"><strong>${stats.total}</strong><span>总词数</span></div>
        <div class="language-stat status-unlearned"><strong>${stats.unlearned}</strong><span>未学习</span></div>
        <div class="language-stat status-unknown"><strong>${stats.unknown}</strong><span>不认识</span></div>
        <div class="language-stat status-vague"><strong>${stats.vague}</strong><span>模糊</span></div>
        <div class="language-stat status-known"><strong>${stats.known}</strong><span>认识</span></div>
      </div>
      <div class="mode-tabs language-queue-tabs">
        ${["smart", "all", "unlearned", "unknown", "vague", "known"]
          .map((queue) => `<button class="${state.queue === queue ? "active" : ""}" data-queue="${queue}">${queueLabel(queue)}</button>`)
          .join("")}
      </div>
      <p class="review-note">智能练习优先出现不认识、模糊和未学习的词；每练 20 个词会插入已认识词抽查。</p>
    </section>
  `;
}

function renderDailyPlanPanel() {
  const stats = dailyPlanStats();
  return `
    <section class="daily-plan-strip" aria-label="今日计划">
      <strong>今日计划</strong>
      <span>新词 ${stats.newDone} / ${stats.newTotal}</span>
      <span>复习 ${stats.reviewDone} / ${stats.reviewTotal}</span>
      <span>总进度 ${stats.totalDone} / ${stats.total}</span>
    </section>
  `;
}

function renderStudyCard() {
  const words = studyWords();
  const word = currentWord();
  if (!word) {
    return `<section class="panel"><p class="empty">这个语言还没有单词。</p></section>`;
  }
  const language = currentLanguage();
  const progress = `${(state.cardIndex % words.length) + 1} / ${words.length}`;
  const status = wordStatus(word);
  const flipLabel = state.flipped ? "隐藏答案" : "显示答案";
  return `
    <section class="panel word-study-panel language-study-panel unified-study-panel">
      <div class="unified-topline">
        <span>${escapeHtml(language.label)} · ${queueLabel()}</span>
        <span>${escapeHtml(progress)}</span>
      </div>
      <div class="word-status-row">
        <span class="word-status status-${escapeHtml(status)}">状态：${escapeHtml(languageStatusLabel(status))}</span>
      </div>
      <article class="study-card language-card unified-card">
        <div class="study-card-face unified-main">
          <div class="tap-sentence-scroll">
            <h3 class="tap-sentence" lang="${escapeHtml(language.speechLang)}">
              ${renderTapTokens(word.term, word.languageId)}
            </h3>
          </div>
          ${
            state.flipped
              ? `<div class="unified-answer visible">
                  <small>中文</small>
                  <p>${escapeHtml(word.chinese)}</p>
                  ${word.reading ? `<small>读音</small><p>${escapeHtml(word.reading)}</p>` : ""}
                  ${word.example ? `<small>例句</small><p lang="${escapeHtml(language.speechLang)}">${escapeHtml(word.example)}</p>` : ""}
                  ${renderVocabularyComparison(word)}
                </div>`
              : ""
          }
          ${renderTappedLookup()}
        </div>
        <div class="unified-controls">
          <div class="unified-play-row">
            <button type="button" data-flip-word>${escapeHtml(flipLabel)}</button>
          </div>
        </div>
      </article>
      ${renderDailyPlanPanel()}
      <div class="word-actions language-rate-actions">
        <button data-rate-language="${escapeHtml(word.id)}:unknown">不认识</button>
        <button data-rate-language="${escapeHtml(word.id)}:vague">模糊</button>
        <button data-rate-language="${escapeHtml(word.id)}:known">认识</button>
      </div>
    </section>
  `;
}

function renderToolsManager() {
  if (!state.toolsOpen) {
    return `
      <section class="panel language-tools-entry">
        <button type="button" data-toggle-tools="open">工具与设置</button>
      </section>
    `;
  }
  return `
    <section class="language-tools-drawer">
      <div class="section-title">
        <h2>工具与设置</h2>
        <button type="button" data-toggle-tools="close">收起</button>
      </div>
      ${renderLanguageTools()}
      ${renderVoicePanel()}
      ${renderProgressPanel()}
      ${renderSearchPanel()}
    </section>
  `;
}

function renderEditorManager() {
  if (!state.editorOpen) {
    return `
      <section class="panel language-editor-entry">
        <div>
          <h2>管理我的词库</h2>
          <p>添加、编辑、导入和导出都收在这里，手机背词时不用一直往下拖。</p>
        </div>
        <button class="primary-action" type="button" data-toggle-editor="open">打开管理</button>
      </section>
    `;
  }
  return `
    <section class="language-editor-drawer">
      <div class="section-title">
        <h2>管理我的词库</h2>
        <button type="button" data-toggle-editor="close">收起</button>
      </div>
      <div class="custom-grid">
        ${renderWordForm()}
        ${renderCustomList()}
      </div>
      ${renderBackupPanel()}
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
    <main class="layout language-layout">
      ${state.message ? `<p class="custom-message">${escapeHtml(state.message)}</p>` : ""}
      ${renderStudyCard()}
      ${renderToolsManager()}
      ${renderEditorManager()}
    </main>
  `;
  autoSpeakCurrentWord();
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

  if (target.dataset.speak) speakLanguage(target.dataset.speak, target.dataset.speakLanguage || state.languageId, speechOptions());
  if (target.dataset.speakFull) speakLanguage(target.dataset.speakFull, target.dataset.speakLanguage || state.languageId, speechOptions());
  if (target.dataset.tapWord) {
    state.tappedWord = { text: target.dataset.tapWord, languageId: target.dataset.tapWordLanguage || state.languageId };
    speakLanguage(state.tappedWord.text, state.tappedWord.languageId, speechOptions());
    render();
  }

  if (target.dataset.language) {
    state.languageId = target.dataset.language;
    state.cardIndex = 0;
    state.flipped = false;
    state.forceKnownReview = false;
    state.editingWordId = null;
    state.tappedWord = null;
    state.message = "";
    persistSession();
    render();
  }
  if (target.dataset.queue) {
    state.queue = target.dataset.queue;
    state.cardIndex = 0;
    state.flipped = false;
    state.forceKnownReview = false;
    state.search = "";
    state.tappedWord = null;
    persistSession();
    render();
  }
  if (target.dataset.speechSpeed) {
    state.speechSpeed = target.dataset.speechSpeed;
    render();
  }
  if (target.dataset.toggleTheme !== undefined) {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, state.theme);
    render();
  }
  if (target.dataset.flipWord !== undefined) {
    state.flipped = !state.flipped;
    render();
  }
  if (target.dataset.rateLanguage) {
    const [wordId, rating] = target.dataset.rateLanguage.split(":");
    ensureTodayPlan();
    state.progress = rateLanguageWord(state.progress, wordId, rating);
    state.progress = completeDailyLanguageWord(state.progress, state.languageId, wordId);
    state.message = `已记录：${ratingLabel(rating)}。`;
    state.practiceCount += 1;
    state.forceKnownReview = state.queue === "smart" && state.practiceCount > 0 && state.practiceCount % 20 === 0;
    const words = studyWords();
    const stillOnRatedWord = words[state.cardIndex % Math.max(words.length, 1)]?.id === wordId;
    state.cardIndex = words.length ? (stillOnRatedWord ? (state.cardIndex + 1) % words.length : state.cardIndex % words.length) : 0;
    state.flipped = false;
    state.tappedWord = null;
    persistSession();
    render();
  }
  if (target.dataset.toggleTools) {
    state.toolsOpen = target.dataset.toggleTools === "open";
    render();
  }
  if (target.dataset.editWord) {
    state.editingWordId = target.dataset.editWord;
    state.editorOpen = true;
    state.message = "";
    render();
  }
  if (target.dataset.toggleEditor) {
    state.editorOpen = target.dataset.toggleEditor === "open";
    if (!state.editorOpen) state.editingWordId = null;
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
    speakLanguage(currentWord()?.term || "hello", state.languageId, speechOptions());
  }
});

app.addEventListener("change", (event) => {
  if (!event.target.matches("[data-language-voice-select]")) return;
  setSelectedLanguageVoiceName(state.languageId, event.target.value);
  speakLanguage(currentWord()?.term || "hello", state.languageId, speechOptions());
  render();
});

window.addEventListener?.("languageVoicesChanged", render);

app.addEventListener("input", (event) => {
  if (!event.target.matches("[data-language-search]")) return;
  state.search = event.target.value;
  state.cardIndex = 0;
  state.flipped = false;
  state.tappedWord = null;
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
  state.editorOpen = true;
  state.search = "";
  state.message = "单词已保存，会出现在当前语言的单词卡片里。";
  render();
});

render();

function autoSpeakCurrentWord() {
  const word = currentWord();
  if (!word) return;
  const key = `${word.id}:${state.languageId}:${state.cardIndex}:${state.queue}`;
  if (key === lastAutoSpeakKey) return;
  lastAutoSpeakKey = key;
  speakLanguage(word.term, word.languageId, speechOptions());
}
