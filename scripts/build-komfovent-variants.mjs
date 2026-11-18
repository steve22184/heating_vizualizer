// Generates komfovent-card_sk.js and komfovent-card_en.js from komfovent-card.js
/* global process */
// with a fixed language. Run: npm run build:komfovent
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("komfovent-card.js", "utf8");
const marker = "const FORCE_LANG = null;";
if (!src.includes(marker)) throw new Error(`marker not found: ${marker}`);

for (const lang of ["sk", "en"]) {
  const out = src.replace(marker, `const FORCE_LANG = "${lang}";`);
  writeFileSync(`komfovent-card_${lang}.js`, `// GENERATED from komfovent-card.js – language "${lang}"\n${out}`);
  process.stdout.write(`komfovent-card_${lang}.js\n`);
}
