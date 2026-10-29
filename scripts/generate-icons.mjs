// يولّد أيقونات PNG من icon.svg باستخدام Chromium (Playwright).
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const svg = readFileSync("public/icons/icon.svg", "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();
async function render(size, file, pad = 0) {
  await page.setViewportSize({ width: size, height: size });
  const inner = size - pad * 2;
  const bg = pad ? "#059674" : "transparent";
  await page.setContent(`<html><body style="margin:0;background:${bg}"><div style="padding:${pad}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  await page.screenshot({ path: `public/icons/${file}`, omitBackground: !pad });
}
await render(192, "icon-192.png");
await render(512, "icon-512.png");
await render(180, "apple-touch-icon.png");
await render(512, "maskable-512.png", 64);
await browser.close();
console.log("icons generated");
