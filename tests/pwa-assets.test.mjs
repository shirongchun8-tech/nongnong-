import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
const languagesHtml = fs.readFileSync("languages.html", "utf8");
const indexHtml = fs.readFileSync("index.html", "utf8");
const resetHtml = fs.readFileSync("reset.html", "utf8");
const languageScript = fs.readFileSync("src/languages.js", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");
const buildScript = fs.readFileSync("scripts/build.mjs", "utf8");

assert.equal(manifest.start_url, "./languages-new.html?v=daily-plan-study");
assert.equal(manifest.display, "standalone");
assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192" && icon.purpose.includes("maskable")));
assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512" && icon.purpose.includes("maskable")));

for (const html of [indexHtml, languagesHtml]) {
  assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /theme-color/);
}

assert.match(languageScript, /serviceWorker\.register\("\.\/service-worker\.js"\)/);
assert.match(resetHtml, /caches\.keys/);
assert.match(resetHtml, /registration\.unregister/);
assert.match(resetHtml, /languages-new\.html\?v=daily-plan-study/);
assert.match(serviceWorker, /event\.request\.mode === "navigate"/);
assert.match(serviceWorker, /fetch\(event\.request\)/);

for (const asset of [
  "./languages.html?v=daily-plan-study",
  "./languages-new.html?v=daily-plan-study",
  "./src/languageData.js?v=daily-plan-study",
  "./src/data/word1368Data.js?v=daily-plan-study",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
]) {
  assert.match(serviceWorker, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(buildScript, /manifest\.webmanifest/);
assert.match(buildScript, /service-worker\.js/);
assert.match(buildScript, /icons/);
