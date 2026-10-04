// Deterministic frame recorder for the hero animation (headless Chrome, CDP).
// The page runs on a fake clock: setTimeout / rAF / performance.now are
// driven by __advance(ms), and every CSS transition/animation is paused and
// seeked to the same clock, so a frame shows exactly the moment it is labelled.
// usage: node record.mjs <out-prefix> "<until js expr>" <frames> <every-ms> [lead-ms]
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [out, until, nFrames = "12", everyMs = "60", leadMs = "0"] = process.argv.slice(2);
const URL = process.env.PAGE || "http://localhost:8089/Assets/embeds/onton/hero-animation.html";
const PORT = 9333;
mkdirSync(dirname(out), { recursive: true });

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--hide-scrollbars",
  `--user-data-dir=${dirname(out)}/prof`, "--window-size=620,407", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let tab;
for (let i = 0; i < 50 && !tab; i++) {
  try { tab = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page"); }
  catch { await sleep(200); }
}
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 620, height: 407, deviceScaleFactor: 1.5, mobile: false });
await send("Page.addScriptToEvaluateOnNewDocument", { source: `
  (() => { let now = 0, id = 0; const timers = []; let rafs = [];
    window.setTimeout = (f, ms = 0, ...a) => { timers.push({ f: () => f(...a), at: now + ms, id: ++id }); return id; };
    window.clearTimeout = (i) => { const k = timers.findIndex((t) => t.id === i); if (k >= 0) timers.splice(k, 1); };
    window.requestAnimationFrame = (f) => { rafs.push(f); return ++id; };
    performance.now = () => now;
    const flush = async () => { for (let i = 0; i < 20; i++) await null; };
    const syncCss = () => { for (const a of document.getAnimations()) {
      if (a.__t0 === undefined) { a.__t0 = now; a.pause(); } a.currentTime = now - a.__t0; } };
    window.__advance = async (ms) => { const end = now + ms;
      while (now < end) { now = Math.min(end, now + 8);
        timers.sort((a, b) => a.at - b.at);
        while (timers.length && timers[0].at <= now) { timers.shift().f(); await flush(); }
        const r = rafs; rafs = []; r.forEach((f) => f(now)); await flush(); syncCss(); }
      return now; };
    window.__until = async (cond, max = 60000) => { const s = now; while (!cond() && now - s < max) await window.__advance(8); return now; };
  })();` });
await send("Page.navigate", { url: URL });
await sleep(1500);   // let the page and its fetches load; the fake clock hasn't moved

const evalJs = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const tStart = await evalJs(`window.__until(() => { try { return !!(${until}); } catch (e) { return false; } })`);
await evalJs(`window.__advance(${+leadMs})`);
for (let f = 0; f < +nFrames; f++) {
  const t = await evalJs("performance.now()");
  await sleep(60);   // let the compositor paint the seeked state
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${out}-${String(f).padStart(2, "0")}-${String(Math.round(t - tStart)).padStart(5, "0")}ms.png`, Buffer.from(shot.result.data, "base64"));
  await evalJs(`window.__advance(${+everyMs})`);
}
console.log("trigger at", tStart, "ms");
ws.close(); chrome.kill();
