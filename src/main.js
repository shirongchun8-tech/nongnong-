import { courseData } from "./data/courseData.js";
import { speakFrench } from "./speech.js";
import { loadProgress, resetProgress, saveReview } from "./storage.js";

const app = document.querySelector("#app");
let state = {
  view: "chapter",
  chapterId: courseData.chapters[0]?.id,
  cardIndex: 0,
  cardFlipped: false,
  progress: loadProgress(),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function playButton(text, label = "播放") {
  return `<button class="icon-button" data-speak="${escapeHtml(text)}" title="${label}" aria-label="${label}">▶</button>`;
}

function slowButton(text) {
  return `<button class="icon-button muted" data-slow="${escapeHtml(text)}" title="慢速播放" aria-label="慢速播放">慢</button>`;
}

function renderShell(content) {
  const totalSeen = Object.values(state.progress).reduce((sum, item) => sum + item.seen, 0);
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">法语会话期末复习</p>
        <h1>${escapeHtml(courseData.title)}</h1>
      </div>
      <div class="top-actions">
        <button class="${state.view === "chapter" ? "active" : ""}" data-view="chapter">章节</button>
        <button class="${state.view === "review" ? "active" : ""}" data-view="review">卡片</button>
      </div>
    </header>
    <main class="layout">
      <aside class="sidebar">
        <div class="stat">
          <strong>${courseData.reviewCards.length}</strong>
          <span>可复习卡片</span>
        </div>
        <div class="stat">
          <strong>${totalSeen}</strong>
          <span>已练次数</span>
        </div>
        <nav>
          ${courseData.chapters
            .map(
              (chapter) => `
                <button class="chapter-link ${chapter.id === state.chapterId ? "active" : ""}" data-chapter="${chapter.id}">
                  ${escapeHtml(chapter.title)}
                </button>
              `,
            )
            .join("")}
        </nav>
      </aside>
      <section class="content">${content}</section>
    </main>
  `;
}

function renderVocab(chapter) {
  if (!chapter.vocabulary.length) return "";
  return `
    <section class="panel">
      <div class="section-title">
        <h2>核心词汇</h2>
        <span>${chapter.vocabulary.length} 个</span>
      </div>
      <div class="vocab-grid">
        ${chapter.vocabulary
          .map(
            (item) => `
              <article class="vocab-item">
                <div>
                  <strong lang="fr">${escapeHtml(item.french)}</strong>
                  <p>${escapeHtml(item.chinese)}</p>
                </div>
                <div class="listen-actions">${playButton(item.french)}${slowButton(item.french)}</div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderExercises(chapter) {
  if (!chapter.exercises.length) return "";
  return `
    <section class="panel">
      <div class="section-title">
        <h2>语法练习</h2>
        <span>答案可直接背</span>
      </div>
      <div class="exercise-list">
        ${chapter.exercises
          .slice(0, 12)
          .map(
            (item) => `
              <article class="exercise-item">
                <p lang="fr">${escapeHtml(item.prompt || item.answer)}</p>
                <div class="answer-row">
                  <strong>${escapeHtml(item.answer)}</strong>
                  <span>${escapeHtml(item.chinese)}</span>
                  ${playButton(item.answer || item.prompt, "播放答案")}
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderOral(chapter) {
  const items = [...chapter.oralQuestions, ...chapter.memorization.map((item) => ({ question: "", chinese: item.chinese, example: item.french }))];
  if (!items.length) return "";
  return `
    <section class="panel">
      <div class="section-title">
        <h2>口语例句</h2>
        <span>点句子反复听</span>
      </div>
      <div class="sentence-list">
        ${items
          .slice(0, 16)
          .map(
            (item) => `
              <article class="sentence-item">
                ${item.question ? `<p class="prompt" lang="fr">${escapeHtml(item.question)}</p>` : ""}
                <div class="sentence-main">
                  <p lang="fr">${escapeHtml(item.example)}</p>
                  <div class="listen-actions">${playButton(item.example, "播放例句")}${slowButton(item.example)}</div>
                </div>
                <p class="translation">${escapeHtml(item.chinese)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderChapterView() {
  const chapter = courseData.chapters.find((item) => item.id === state.chapterId) || courseData.chapters[0];
  return renderShell(`
    <div class="chapter-header">
      <p class="eyebrow">Chapter</p>
      <h2>${escapeHtml(chapter.title)}</h2>
      <p>先听核心词，再听可直接背的句子。慢速按钮适合跟读。</p>
    </div>
    ${renderVocab(chapter)}
    ${renderOral(chapter)}
    ${renderExercises(chapter)}
  `);
}

function cardPriority(card) {
  const progress = state.progress[card.id];
  if (!progress) return 0;
  return progress.score - progress.seen * 0.15;
}

function getReviewCards() {
  return [...courseData.reviewCards].sort((a, b) => cardPriority(a) - cardPriority(b));
}

function renderReviewView() {
  const cards = getReviewCards();
  const card = cards[state.cardIndex % cards.length];
  const progress = state.progress[card.id];
  return renderShell(`
    <div class="review-stage">
      <div class="review-meta">
        <span>${state.cardIndex + 1} / ${cards.length}</span>
        <button class="text-button" data-reset-progress>重置进度</button>
      </div>
      <article class="flashcard ${state.cardFlipped ? "flipped" : ""}" data-flip-card>
        <p class="eyebrow">${card.type === "vocabulary" ? "词汇" : "句子"} ${card.chapter ? `· ${escapeHtml(card.chapter)}` : ""}</p>
        <h2 lang="fr">${escapeHtml(card.front)}</h2>
        <div class="listen-row">
          ${playButton(card.front, "播放卡片")}
          ${slowButton(card.front)}
        </div>
        <div class="card-back">
          <p>${escapeHtml(card.back)}</p>
          ${card.prompt ? `<small lang="fr">Q: ${escapeHtml(card.prompt)}</small>` : ""}
        </div>
      </article>
      <div class="review-actions">
        <button data-flip-card>${state.cardFlipped ? "隐藏中文" : "显示中文"}</button>
        <button data-rate="forgot">不熟</button>
        <button data-rate="hard">还行</button>
        <button data-rate="good">熟悉</button>
      </div>
      <p class="review-note">这张卡已练 ${progress?.seen || 0} 次。数据只保存在当前浏览器。</p>
    </div>
  `);
}

function render() {
  app.innerHTML = state.view === "review" ? renderReviewView() : renderChapterView();
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("button, [data-flip-card]");
  if (!target) return;

  if (target.dataset.speak) speakFrench(target.dataset.speak);
  if (target.dataset.slow) speakFrench(target.dataset.slow, { slow: true });
  if (target.dataset.view) {
    state.view = target.dataset.view;
    render();
  }
  if (target.dataset.chapter) {
    state.view = "chapter";
    state.chapterId = target.dataset.chapter;
    render();
  }
  if (target.dataset.flipCard !== undefined) {
    state.cardFlipped = !state.cardFlipped;
    render();
  }
  if (target.dataset.rate) {
    const cards = getReviewCards();
    const card = cards[state.cardIndex % cards.length];
    state.progress = saveReview(card.id, target.dataset.rate);
    state.cardIndex = (state.cardIndex + 1) % cards.length;
    state.cardFlipped = false;
    render();
  }
  if (target.dataset.resetProgress !== undefined) {
    resetProgress();
    state.progress = {};
    state.cardIndex = 0;
    state.cardFlipped = false;
    render();
  }
});

render();
