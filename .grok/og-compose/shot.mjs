import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const html = pathToFileURL(join(dir, "card.html")).href;
const out = join(dir, "card-raw.png");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1792, height: 1008 },
  deviceScaleFactor: 1,
});
await page.goto(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(200);
await page.locator(".card").screenshot({ path: out, type: "png" });
await browser.close();
console.log("wrote", out);
