/* V5 hero particles — v4/hero.njk, _hero.css.
 *
 * A live loop, drawn on a canvas:
 *   0.0–1.5s  SCATTERED  black dots float around their own spots, each
 *                        morphing like a lava lamp (a soft, wobbling blob).
 *   1.5–2.5s  TIDYING    they travel into the radial system (Figma
 *                        1677:9917): each on a thin line to the centre, in its
 *                        own colour (orange, gold, olive or black).
 *   2.5–4.0s  TURNING    the system revolves around its centre.
 *   4.0–5.0s  LOOSENING  back out to their scattered spots, black again.
 * and round again. The dots are drawn here, not images. Only while on
 * screen; reduced motion shows the tidy system, still.
 */
(function () {
  "use strict";

  var canvas = document.querySelector("[data-dots]");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The comp's box is 411 x 322; everything below is in those units.
  var BW = 411, BH = 322, CX = BW / 2, CY = BH / 2;
  var COLOURS = ["#F88050", "#D8A818", "#A89828", "#1A1A1A"];   // sampled from 1677:9917 on white
  var INK = "#111111";                                          // the scattered dots
  var LINE = "rgba(34, 34, 34, 0.32)";
  var T_FLOAT = 1.5, T_GATHER = 1.0, T_TURN = 1.5, T_RELEASE = 1.0;
  var LOOP = T_FLOAT + T_GATHER + T_TURN + T_RELEASE;
  var TURN = Math.PI / 3;                                       // one sixth of a turn per loop

  // A seeded random, so the system looks the same on every visit.
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // ~96 dots: mostly small, some medium, a few large, as in the comp.
  var dots = [];
  for (var i = 0; i < 96; i++) {
    var u = rand();
    var r = u < 0.6 ? 0.9 + rand() * 1.6 : u < 0.9 ? 2.6 + rand() * 2 : 5 + rand() * 5.5;   // radii as 1677:9917: mostly tiny, a few large
    // tidy: on a ray from the centre, filling a disc of radius ~118
    var a = rand() * Math.PI * 2, d = 18 + Math.sqrt(rand()) * 100;
    // scattered: a loose crowd, denser up and to the right (as 1669:9884)
    var cluster = rand() < 0.62;
    var sx = cluster ? 255 + (rand() - 0.5) * 190 : 40 + rand() * 330;
    var sy = cluster ? 130 + (rand() - 0.5) * 170 : 20 + rand() * 280;
    dots.push({
      r: r, a: a, d: d,
      sx: sx, sy: sy,
      colour: COLOURS[Math.floor(rand() * COLOURS.length)],
      // the float and the lava-lamp wobble, each its own pace
      fx: 4 + rand() * 6, fy: 4 + rand() * 6, fp: rand() * 6.28, fs: 0.6 + rand() * 0.8,
      wp: rand() * 6.28, ws: 1.2 + rand() * 1.6, wk: 2 + Math.floor(rand() * 2)
    });
  }

  function ease(x) { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mixColour(a, b, k) {
    var x = hex(a), y = hex(b);
    return "rgb(" + Math.round(mix(x[0], y[0], k)) + "," + Math.round(mix(x[1], y[1], k)) + "," + Math.round(mix(x[2], y[2], k)) + ")";
  }

  // A soft blob: a ring of points pushed in and out by slow waves, joined
  // with smooth curves. wob 0 is a plain circle.
  function blob(x, y, r, t, dot, wob) {
    var n = 24, pts = [];
    for (var k = 0; k < n; k++) {
      var th = (k / n) * Math.PI * 2;
      var push = wob * (0.14 * Math.sin(dot.wk * th + dot.wp + t * dot.ws) + 0.06 * Math.sin((dot.wk + 1) * th - t * dot.ws * 0.7));
      pts.push([x + Math.cos(th) * r * (1 + push), y + Math.sin(th) * r * (1 + push)]);
    }
    ctx.beginPath();
    var m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    ctx.moveTo(m0[0], m0[1]);
    for (k = 0; k < n; k++) {
      var p = pts[k], q = pts[(k + 1) % n];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.closePath();
    ctx.fill();
  }

  var scale = 1, dpr = 1;
  function size() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    scale = w / BW;
  }

  // Where the loop is: k 0 scattered .. 1 tidy, and the turn so far.
  function phase(t) {
    var s = t % LOOP, k, turn = 0;
    if (s < T_FLOAT) k = 0;
    else if (s < T_FLOAT + T_GATHER) k = ease((s - T_FLOAT) / T_GATHER);
    else if (s < T_FLOAT + T_GATHER + T_TURN) { k = 1; turn = ease((s - T_FLOAT - T_GATHER) / T_TURN) * TURN; }
    else { k = 1 - ease((s - T_FLOAT - T_GATHER - T_TURN) / T_RELEASE); turn = TURN; }
    return { k: k, turn: turn + Math.floor(t / LOOP) * TURN };
  }

  function draw(t) {
    var p = reduced ? { k: 1, turn: 0 } : phase(t);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, BW, BH);
    var pos = dots.map(function (d) {
      var ang = d.a + p.turn;
      var tx = CX + Math.cos(ang) * d.d, ty = CY + Math.sin(ang) * d.d;
      var fx = d.sx + Math.sin(t * d.fs + d.fp) * d.fx, fy = d.sy + Math.cos(t * d.fs * 0.8 + d.fp) * d.fy;
      return [mix(fx, tx, p.k), mix(fy, ty, p.k)];
    });
    // the lines to the centre, only as the system forms
    if (p.k > 0.01) {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = p.k;
      ctx.beginPath();
      pos.forEach(function (q) { ctx.moveTo(CX, CY); ctx.lineTo(q[0], q[1]); });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    dots.forEach(function (d, i) {
      ctx.fillStyle = p.k > 0 ? mixColour(INK, d.colour, p.k) : INK;
      blob(pos[i][0], pos[i][1], d.r, t, d, 1 - p.k);
    });
  }

  var running = false, start = 0, raf = 0, visible = true;
  function frame(now) {
    if (!running) return;
    draw((now - start) / 1000);
    raf = requestAnimationFrame(frame);
  }
  function play() {
    if (running || reduced || !visible || document.hidden) return;
    running = true;
    start = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  window.v5Dots = { draw: function (t) { draw(t); }, stop: function () { stop(); } };   // for checking a moment
  size();
  draw(0);
  window.addEventListener("resize", function () { size(); draw(0); });
  if (reduced) return;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? play() : stop(); }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
  play();
})();
