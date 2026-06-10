import assert from "node:assert/strict";
import { getWordStatus, isReviewDue, nextReviewDelay, updateWordProgress } from "../src/storage.js";

assert.equal(nextReviewDelay("known", 1), 24 * 60 * 60 * 1000);
assert.equal(nextReviewDelay("unknown", 4), 10 * 60 * 1000);

let progress = {};
progress = updateWordProgress(progress, "vais", "unknown", new Date("2026-06-10T00:00:00Z"));
assert.equal(getWordStatus(progress, "vais"), "unknown");
assert.equal(isReviewDue(progress.words.vais, new Date("2026-06-10T00:11:00Z")), true);

progress = updateWordProgress(progress, "vais", "known", new Date("2026-06-10T00:12:00Z"));
assert.equal(getWordStatus(progress, "vais"), "fuzzy");
