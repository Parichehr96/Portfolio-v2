#!/usr/bin/env node
/* Record a Challenquiz thumbnail from stage.html, stepping the embed's own
 * clock 1/60 s a frame (stage.html stands in for its timers), so its timers
 * and transitions play out evenly; then hold its last frame and crossfade back
 * to the first, so the loop has no seam.
 *
 *   node tools/cq-showcase/record.mjs <name> <canvas height> <run s> <hold s>
 *     [src] [width] [out dir] [prefix]
 *     → Assets/v4/work/challenquiz/cq-<name>.{webm,mp4,jpg} by default; any
 *       embed with src (e.g. ONTON's hero animation, out dir and prefix set).
 *
 * (Separate names from the cq thumbnails the Challenquiz chat is making.)
 */
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Optional: a full embed path (src), its width, and where the files go.
const [name, h, run, hold, src = "", w = "600", outDir = "Assets/v4/work/challenquiz", prefix = "cq-"] = process.argv.slice(2);
if (!name || !h) { console.error("usage: record.mjs <name> <h> <run s> <hold s>"); process.exit(1); }
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, outDir);
// Size and quality, overridable: DPR (capture scale, 2), OUTH (encoded
// height, 780) and CRF_VP9 / CRF_H264 (38 / 27). The thumbnails that show
// screens are recorded at DPR=2.4 OUTH=1248 CRF_VP9=30 CRF_H264=22, sharp
// at the homepage's 1.7x grown strip on a 2x display.
const DPR = +process.env.DPR || 2, OUTH = +process.env.OUTH || 780;
const CRF_VP9 = process.env.CRF_VP9 || "38", CRF_H264 = process.env.CRF_H264 || "27";
const FPS = 60, HTTP = 8770, CDP = 9337, FADE = 0.6;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = spawn("/usr/bin/python3", ["-m", "http.server", String(HTTP), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: "ignore" });
const profile = mkdtempSync(join(tmpdir(), "cq-chrome-"));
const chrome = spawn("/bin/sh", ["-c", `exec "${CHROME}" --headless=new --disable-gpu --hide-scrollbars --remote-debugging-port=${CDP} --user-data-dir="${profile}" about:blank`], { stdio: "ignore" });
const frames = mkdtempSync(join(tmpdir(), "cq-frames-"));
function cleanup() { try { chrome.kill(); } catch {} try { server.kill(); } catch {} try { rmSync(profile, { recursive: true, force: true }); } catch {} }

try {
  let target;
  for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json()).find(t => t.type === "page"); } catch {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r, { once: true }));
  let id = 0; const wait = new Map(), events = [];
  ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } else if (m.method) events.push(m.method); });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const until = async ev => { while (!events.includes(ev)) await sleep(5); events.splice(events.indexOf(ev), 1); };
  const advance = async ms => { await send("Emulation.setVirtualTimePolicy", { policy: "pauseIfNetworkFetchesPending", budget: ms }); await until("Emulation.virtualTimeBudgetExpired"); };

  const evaluate = async expr => { const m = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (m.result?.exceptionDetails) throw new Error(JSON.stringify(m.result.exceptionDetails)); return m.result?.result?.value; };
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 812, height: 520, deviceScaleFactor: DPR, mobile: false });
  await send("Page.navigate", { url: `http://127.0.0.1:${HTTP}/tools/cq-showcase/stage.html?f=${name}&h=${h}&w=${w}${src ? "&src=" + encodeURIComponent(src) : ""}` });
  for (let i = 0; i < 100 && (await evaluate("document.title")) !== "ready"; i++) await sleep(200);
  await sleep(400);
  if (process.env.PROBE) {                                 // report the embed's loop length, record nothing
    for (let k = 0; k < 600; k++) {
      await evaluate(`window.setT(${k / 10})`);
      const c = await evaluate(`document.querySelector("iframe").contentWindow.__cycle`);
      if (c != null) { console.log("cycle ms", c); break; }
    }
    process.exit(0);
  }
  const n = Math.round(+run * FPS);
  for (let k = 0; k < n; k++) {
    await evaluate(`window.setT(${k / FPS})`);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(frames, String(k).padStart(4, "0") + ".png"), Buffer.from(shot.result.data, "base64"));
  }
  ws.close();
  // Hold the end, then crossfade back to the start.
  const last = join(frames, String(n - 1).padStart(4, "0") + ".png"), first = join(frames, "0000.png");
  let k = n;
  for (let i = 0; i < Math.round(+hold * FPS); i++, k++) copyFileSync(last, join(frames, String(k).padStart(4, "0") + ".png"));
  const fadeN = Math.round(FADE * FPS);
  execFileSync("/Library/Frameworks/Python.framework/Versions/3.12/bin/python3", ["-c", `
from PIL import Image
a=Image.open(${JSON.stringify(last)}).convert("RGB"); b=Image.open(${JSON.stringify(first)}).convert("RGB")
for i in range(${fadeN}):
    u=(i+1)/${fadeN}; u=u*u*(3-2*u)
    Image.blend(a,b,u).save(${JSON.stringify(frames)}+"/%04d.png" % (${k}+i))
`]);
  const input = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(frames, "%04d.png"), "-vf", `scale=-2:${OUTH}:flags=lanczos`];
  const base = join(OUT, prefix + name);
  execFileSync("ffmpeg", [...input, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", CRF_VP9, "-row-mt", "1", "-pix_fmt", "yuv420p", "-an", base + ".webm"]);
  execFileSync("ffmpeg", [...input, "-c:v", "libx264", "-crf", CRF_H264, "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", base + ".mp4"]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", first, "-vf", `scale=-2:${OUTH}:flags=lanczos`, "-q:v", "3", base + ".jpg"]);
  console.log(`${name}: ${k + fadeN} frames → cq-${name}.webm / .mp4 / .jpg (frames in ${frames})`);
} finally { cleanup(); }
