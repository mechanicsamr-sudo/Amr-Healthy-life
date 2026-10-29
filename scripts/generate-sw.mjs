// يولّد Service Worker بعد البناء مع قائمة بكل ملفات التطبيق للتخزين المسبق (العمل دون اتصال).
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(OUT);

const hash = createHash("sha256");
const urls = [];
for (const f of files.sort()) {
  const rel = "/" + relative(OUT, f).split(sep).join("/");
  if (rel === "/sw.js" || rel.endsWith(".map")) continue;
  hash.update(rel);
  hash.update(readFileSync(f));
  // صفحات HTML تُخزن بعنوان المجلد (/library/) كما يطلبها المتصفح
  urls.push(rel.endsWith("/index.html") ? rel.slice(0, -"index.html".length) : rel);
}
const version = hash.digest("hex").slice(0, 12);
const template = readFileSync("scripts/sw-template.js", "utf8");
const sw = template.replace("__VERSION__", version).replace("__PRECACHE__", JSON.stringify(urls));
writeFileSync(join(OUT, "sw.js"), sw);
console.log(`sw.js generated: version ${version}, ${urls.length} files precached`);
