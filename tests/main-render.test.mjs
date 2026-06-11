import assert from "node:assert/strict";

const storage = {};
global.localStorage = {
  getItem(key) {
    return storage[key] || null;
  },
  setItem(key, value) {
    storage[key] = String(value);
  },
  removeItem(key) {
    delete storage[key];
  },
};

global.window = {
  addEventListener() {},
  speechSynthesis: {
    getVoices() {
      return [];
    },
    addEventListener() {},
    cancel() {},
    speak() {},
  },
  alert() {},
};

global.CustomEvent = function CustomEvent() {};

const app = {
  innerHTML: "",
  listeners: {},
  addEventListener(type, handler) {
    this.listeners[type] = handler;
  },
};

global.document = {
  body: {
    className: "",
    classList: {
      add(name) {
        this.owner.className = name;
      },
      remove() {},
      owner: null,
    },
  },
  querySelector(selector) {
    return selector === "#app" ? app : null;
  },
};
global.document.body.classList.owner = global.document.body;

await import(`../src/main.js?test=${Date.now()}`);

function click(dataset) {
  const target = {
    dataset,
    closest() {
      return target;
    },
  };
  app.listeners.click({ target });
}

assert.match(app.innerHTML, /单词库/);
assert.match(app.innerHTML, /音标/);
assert.match(app.innerHTML, /总词汇/);
assert.match(app.innerHTML, /单词 \/ 语法 \/ 句子/);
assert.match(app.innerHTML, /显示答案/);
assert.match(app.innerHTML, /下一张/);
assert.match(app.innerHTML, /上一张/);
assert.match(app.innerHTML, /深色/);
assert.match(global.document.body.className, /theme-light/);

click({ section: "grammar" });
assert.match(app.innerHTML, /语法/);
assert.match(app.innerHTML, /显示答案/);
assert.match(app.innerHTML, /下一条/);

click({ section: "sentences" });
assert.match(app.innerHTML, /句子/);
assert.match(app.innerHTML, /显示答案/);
assert.match(app.innerHTML, /下一句/);
