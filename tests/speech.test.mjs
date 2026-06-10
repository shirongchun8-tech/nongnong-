import assert from "node:assert/strict";
import { getSpeechRate, selectFrenchVoice } from "../src/speech.js";

const voices = [
  { name: "Samantha", lang: "en-US" },
  { name: "Thomas", lang: "fr-FR" },
  { name: "Amelie", lang: "fr-CA" },
];

assert.equal(selectFrenchVoice(voices, "Thomas")?.name, "Thomas");
assert.equal(selectFrenchVoice(voices, "Missing")?.name, "Thomas");
assert.equal(selectFrenchVoice([{ name: "Daniel", lang: "en-GB" }], "") ?? null, null);
assert.equal(getSpeechRate({ slow: true }), 0.65);
assert.equal(getSpeechRate({ extraSlow: true }), 0.45);
assert.equal(getSpeechRate({}), 0.92);
