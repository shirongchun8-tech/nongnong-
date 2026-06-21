import assert from "node:assert/strict";

const storage = {};
const spoken = [];
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
      return [
        { name: "Alex", lang: "en-US" },
        { name: "Yuna", lang: "ko-KR" },
        { name: "Thomas", lang: "fr-FR" },
        { name: "Kyoko", lang: "ja-JP" },
      ];
    },
    addEventListener() {},
    cancel() {},
    speak(utterance) {
      spoken.push({ text: utterance.text, lang: utterance.lang, rate: utterance.rate });
    },
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

assert.match(app.innerHTML, /英语/);
assert.match(app.innerHTML, /智能练习/);
assert.match(app.innerHTML, /今日计划/);
assert.match(app.innerHTML, /新词 0 \/ 20/);
assert.match(app.innerHTML, /复习 0 \/ 0/);
assert.match(app.innerHTML, /总进度 0 \/ 20/);
assert.match(app.innerHTML, /状态：未学习/);
assert.doesNotMatch(app.innerHTML, /四语对照/);
assert.doesNotMatch(app.innerHTML, /韩语/);
assert.doesNotMatch(app.innerHTML, /法语/);
assert.doesNotMatch(app.innerHTML, /日语/);
assert.doesNotMatch(app.innerHTML, /外语 → 中文/);
assert.doesNotMatch(app.innerHTML, /中文 → 外语/);
assert.doesNotMatch(app.innerHTML, /随机互译/);
assert.doesNotMatch(app.innerHTML, /句子点读/);
assert.doesNotMatch(app.innerHTML, /WORDS ONLY/i);
assert.doesNotMatch(app.innerHTML, /英语单词/);
assert.doesNotMatch(app.innerHTML, /看外语，想中文/);
assert.doesNotMatch(app.innerHTML, /出现即发音/);
assert.match(app.innerHTML, /tap-sentence-scroll/);
assert.match(app.innerHTML, /工具与设置/);
assert.doesNotMatch(app.innerHTML, /搜索单词或中文/);
assert.doesNotMatch(app.innerHTML, /语音引擎/);
assert.match(app.innerHTML, /未学习/);
assert.match(app.innerHTML, /不认识/);
assert.match(app.innerHTML, /模糊/);
assert.match(app.innerHTML, /认识/);
assert.match(app.innerHTML, /data-tap-word="hello"/);
assert.match(app.innerHTML, /显示答案/);
assert.doesNotMatch(app.innerHTML, /data-speech-speed="normal"/);
assert.doesNotMatch(app.innerHTML, /data-speak-full="hello"/);
assert.match(app.innerHTML, /管理我的词库/);
assert.doesNotMatch(app.innerHTML, /name="term"/);
assert.equal(spoken[0]?.text, "hello");

click({ rateLanguage: "starter-en-0:known" });
assert.match(storage["multi-language-word-studio-progress"], /starter-en-0/);
assert.match(app.innerHTML, /已记录：认识/);
assert.equal(spoken.at(-1)?.text, "thank you");
assert.match(storage["multi-language-word-studio-progress"], /"status":"known"/);
assert.match(storage["multi-language-word-studio-progress"], /"completedNewIds":\["starter-en-0"\]/);
assert.match(app.innerHTML, /新词 1 \/ 20/);
assert.match(app.innerHTML, /总进度 1 \/ 20/);

click({ language: "ko" });
assert.match(app.innerHTML, /안녕하세요/);
assert.match(app.innerHTML, /韩语/);
assert.equal(spoken.at(-1)?.text, "안녕하세요");

click({ flipWord: "" });
assert.match(app.innerHTML, /四语对照/);
assert.match(app.innerHTML, /隐藏答案/);
assert.equal(spoken.at(-1)?.text, "안녕하세요");

click({ tapWord: "안녕하세요", tapWordLanguage: "ko" });
assert.match(app.innerHTML, /当前点读/);
assert.equal(spoken.at(-1)?.text, "안녕하세요");

click({ toggleTools: "open" });
assert.match(app.innerHTML, /韩语/);
assert.match(app.innerHTML, /法语/);
assert.match(app.innerHTML, /日语/);
assert.match(app.innerHTML, /浅色/);
assert.match(app.innerHTML, /搜索单词或中文/);
assert.match(app.innerHTML, /语音引擎/);
assert.match(app.innerHTML, /Yuna · ko-KR/);
assert.match(app.innerHTML, /试听/);
assert.match(app.innerHTML, /未学习/);
assert.match(app.innerHTML, /不认识/);
assert.match(app.innerHTML, /总词数/);

input("water");
assert.match(app.innerHTML, /water/);

click({ toggleEditor: "open" });
assert.match(app.innerHTML, /name="term"/);
assert.match(app.innerHTML, /我的韩语词库/);

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
