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
    cancel() {},
    speak() {},
  },
  confirm() {
    return true;
  },
};

global.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) {
  this.text = text;
};

global.FormData = class FormData {
  constructor(form) {
    this.values = form.values || {};
  }
  get(name) {
    return this.values[name] || "";
  }
};

const app = {
  innerHTML: "",
  listeners: {},
  addEventListener(type, handler) {
    this.listeners[type] = handler;
  },
  querySelector() {
    return { value: "" };
  },
};

global.document = {
  body: {
    className: "",
    classList: {
      add(name) {
        this.owner.className = name;
      },
      owner: null,
    },
  },
  querySelector(selector) {
    return selector === "#language-app" ? app : null;
  },
  createElement() {
    return {
      click() {},
      remove() {},
    };
  },
};
global.document.body.classList.owner = global.document.body;

global.URL = {
  createObjectURL() {
    return "blob:test";
  },
  revokeObjectURL() {},
};
global.Blob = function Blob() {};

await import(`../src/languages.js?test=${Date.now()}`);

function click(dataset) {
  const target = {
    dataset,
    closest() {
      return target;
    },
  };
  app.listeners.click({ target });
}

function input(value) {
  const target = {
    value,
    matches(selector) {
      return selector === "[data-language-search]";
    },
  };
  app.listeners.input({ target });
}

function submit(values) {
  const form = {
    values,
    matches(selector) {
      return selector === "[data-language-word-form]" || selector.includes("[data-language-word-form]");
    },
  };
  app.listeners.submit({ target: form, preventDefault() {} });
}

assert.match(app.innerHTML, /Language Word Studio/);
assert.match(app.innerHTML, /英语/);
assert.match(app.innerHTML, /韩语/);
assert.match(app.innerHTML, /法语/);
assert.match(app.innerHTML, /日语/);
assert.match(app.innerHTML, /外语 → 中文/);
assert.match(app.innerHTML, /搜索单词或中文/);

click({ language: "ko" });
assert.match(app.innerHTML, /안녕하세요/);
assert.match(app.innerHTML, /韩语/);

click({ mode: "zhToForeign" });
assert.match(app.innerHTML, /中文 → 外语/);

input("water");
assert.match(app.innerHTML, /water/);

submit({
  term: "moon",
  chinese: "月亮",
  pos: "名词",
  reading: "/muːn/",
  forms: "moon, moons",
  example: "The moon is bright.",
});

assert.match(app.innerHTML, /moon/);
assert.match(app.innerHTML, /月亮/);
assert.match(storage["multi-language-word-studio-custom"], /moon/);
