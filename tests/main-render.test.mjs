import assert from "node:assert/strict";

global.localStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
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
  addEventListener() {},
};

global.document = {
  querySelector(selector) {
    return selector === "#app" ? app : null;
  },
};

await import(`../src/main.js?test=${Date.now()}`);

assert.match(app.innerHTML, /单词库/);
assert.match(app.innerHTML, /音标/);
assert.match(app.innerHTML, /总词汇/);
assert.match(app.innerHTML, /单词 \/ 语法 \/ 句子/);
