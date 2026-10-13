#!/usr/bin/env node
/* Record a WOW design system thumbnail loop from stage.html, frame by frame.
 * (The Connect2WOW recorder, tools/connect2wow-thumbs/record.mjs, pointed here.)
 *
 *   node tools/wow-ds-thumbs/record.mjs <themes|layers>
 *     → Assets/v4/work/wow-design-system/<name>.{webm,mp4,jpg}
 *
 * Serves the repo root on a spare port, opens the stage in headless Chrome
 * at 2x, and for every 1/60 s of the loop sets that moment (window.setT) and
 * captures it, so motion is exactly even however long a frame takes to draw.
 * Then encodes VP9 WebM + H.264 MP4 at 1.5x the 487 px slot (the
 * encode-work-motion.sh rule) and a JPEG poster from frame 0, which the loop
 * also ends on. Needs Google Chrome and ffmpeg.
 */
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const name = process.argv[2];
if (!["themes", "layers"].includes(name)) { console.error("usage: record.mjs <themes|layers>"); process.exit(1); }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "Assets/v4/work/wow-design-system");
const FPS = 60, HTTP = 8768, CDP = 9336;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = spawn("/usr/bin/python3", ["-m", "http.server", String(HTTP), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: "ignore" });
const profile = mkdtempSync(join(tmpdir(), "c2w-chrome-"));
// Through the shell: spawning Chrome directly from Node can fail with
// "bad CPU type" (-86) when Node runs under Rosetta.
const chrome = spawn("/bin/sh", ["-c", `exec "${CHROME}" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 ` +
  `--window-size=812,520 --remote-debugging-port=${CDP} --user-data-dir="${profile}" about:blank`], { stdio: "ignore" });
const frames = mkdtempSync(join(tmpdir(), "c2w-frames-"));

function cleanup() { try { chrome.kill(); } catch {} try { server.kill(); } catch {} try { rmSync(profile, { recursive: true, force: true }); } catch {} }

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
  const evaluate = async expr => {
    const m = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (m.result?.exceptionDetails) throw new Error(JSON.stringify(m.result.exceptionDetails));
    return m.result?.result?.value;
  };

  await send("Page.enable");
  // The exact frame: --window-size includes the window's own chrome, so the
  // page would be shorter than 520 without this.
  await send("Emulation.setDeviceMetricsOverride", { width: 812, height: 520, deviceScaleFactor: 2, mobile: false });
  await send("Page.navigate", { url: `http://127.0.0.1:${HTTP}/tools/wow-ds-thumbs/stage.html?e=${name}` });
  for (let i = 0; i < 100 && (await evaluate("document.title")) !== "ready"; i++) await sleep(200);
  await sleep(500);                                       // fonts and images settled

  if (process.env.PROBE) {                                 // PROBE=<seconds>: print the stage's measurements then, record nothing
    for (let k = 0; k <= Math.round(+process.env.PROBE * FPS); k++) await evaluate(`window.setT(${k / FPS})`);
    console.log(await evaluate(`(() => { const d = document.querySelector("iframe").contentDocument, p = d.querySelector("#pop");
      if (!p) return "no menu"; const sc = p.classList.contains("menu") ? p : p.querySelector("div[style*=max-height]") || p, r = p.getBoundingClientRect();
      return JSON.stringify({ top: r.top, h: r.height, w: r.width, mh: p.style.maxHeight, sh: sc.scrollHeight, ch: sc.clientHeight, st: sc.scrollTop,
        kids: [...p.children].map(c => c.className + ":" + Math.round(c.getBoundingClientRect().top) + "+" + Math.round(c.getBoundingClientRect().height)),
        cam: document.getElementById("cam").style.transform }); })()`));
    process.exit(0);
  }
  const loop = await evaluate("window.LOOP");
  const n = Math.round(loop * FPS);
  for (let k = 0; k < n; k++) {
    await evaluate(`window.setT(${k / FPS})`);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(frames, String(k).padStart(4, "0") + ".png"), Buffer.from(shot.result.data, "base64"));
    if (k % 60 === 0) console.log(`frame ${k}/${n}`);
  }
  ws.close();

  const input = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(frames, "%04d.png"), "-vf", "scale=-2:780:flags=lanczos"];
  execFileSync("ffmpeg", [...input, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1", "-pix_fmt", "yuv420p", "-an", join(OUT, name + ".webm")]);
  execFileSync("ffmpeg", [...input, "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", join(OUT, name + ".mp4")]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(frames, "0000.png"), "-vf", "scale=-2:780:flags=lanczos", "-q:v", "3", join(OUT, name + ".jpg")]);
  console.log(`${n} frames, ${loop}s → ${name}.webm / .mp4 / .jpg (frames kept in ${frames})`);
} finally {
  cleanup();
}
