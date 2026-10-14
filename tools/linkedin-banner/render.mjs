#!/usr/bin/env node
/* Render the LinkedIn banner from stage.html: 1580 x 400 JPEG (790 x 200 at 2x).
 *
 *   node tools/og-image/render.mjs [out]   (default tools/linkedin-banner/banner.jpg)
 *
 * SCALE=2 renders at twice the size (3160 x 800); an out path ending .png
 * gives a lossless PNG.
 *
 * Serves the repo root, opens the stage in headless Chrome at 1x, waits for
 * the fonts and drawings, and captures it. Needs Google Chrome.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, process.argv[2] || "tools/linkedin-banner/banner.jpg");
const HTTP = 8768, CDP = 9336;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = spawn("/usr/bin/python3", ["-m", "http.server", String(HTTP), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: "ignore" });
const profile = mkdtempSync(join(tmpdir(), "lib-chrome-"));
// Through the shell: spawning Chrome directly from Node can fail under Rosetta (-86).
const chrome = spawn("/bin/sh", ["-c", `exec "${CHROME}" --headless=new --disable-gpu --hide-scrollbars ` +
  `--remote-debugging-port=${CDP} --user-data-dir="${profile}" about:blank`], { stdio: "ignore" });

try {
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(200);
    try { target = (await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json()).find(t => t.type === "page"); } catch {}
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r, { once: true }));
  let id = 0; const wait = new Map();
  ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const title = async () => (await send("Runtime.evaluate", { expression: "document.title", returnByValue: true })).result?.result?.value;

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1580, height: 400, deviceScaleFactor: +(process.env.SCALE || 1), mobile: false });
  await send("Page.navigate", { url: `http://127.0.0.1:${HTTP}/tools/linkedin-banner/stage.html?v=${process.env.V || 1}` });
  for (let i = 0; i < 100 && (await title()) !== "ready"; i++) await sleep(200);
  await sleep(300);
  const png = OUT.endsWith(".png");
  const shot = await send("Page.captureScreenshot", png ? { format: "png" } : { format: "jpeg", quality: 92 });
  writeFileSync(OUT, Buffer.from(shot.result.data, "base64"));
  console.log("→ " + OUT);
  ws.close();
} finally {
  try { chrome.kill(); } catch {} try { server.kill(); } catch {} try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
