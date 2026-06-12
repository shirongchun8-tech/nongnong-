import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

function copyRecursive(from, to) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from)) {
      copyRecursive(path.join(from, entry), path.join(to, entry));
    }
    return;
  }
  fs.copyFileSync(from, to);
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const entry of fs.readdirSync(ROOT)) {
  if (entry.endsWith(".html")) copyRecursive(path.join(ROOT, entry), path.join(DIST, entry));
}
copyRecursive(path.join(ROOT, "src"), path.join(DIST, "src"));
fs.writeFileSync(path.join(DIST, ".nojekyll"), "", "utf8");
console.log(`Built ${path.relative(ROOT, DIST)}`);
