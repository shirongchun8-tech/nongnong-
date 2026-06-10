import assert from "node:assert/strict";
import { selectFrenchVoice } from "../src/speech.js";

const voices = [
  { name: "Samantha", lang: "en-US" },
  { name: "Thomas", lang: "fr-FR" },
  { name: "Amelie", lang: "fr-CA" },
];

assert.equal(selectFrenchVoice(voices, "Thomas")?.name, "Thomas");
assert.equal(selectFrenchVoice(voices, "Missing")?.name, "Thomas");
assert.equal(selectFrenchVoice([{ name: "Daniel", lang: "en-GB" }], "") ?? null, null);
