/* V5 hero particles — v4/hero.njk, _hero.css.
 *
 * A live loop, drawn on a canvas:
 *   0–3s  SCATTERED  black dots float around their own spots, each
 *                    morphing like a lava lamp (a soft, wobbling blob).
 *   3–4s  TIDYING    they travel into the radial system (Figma 1677:9917):
 *                    each on a thin line to the centre, in its own colour
 *                    (orange, gold, olive or black).
 *   4–7s  TIDY       the system revolves around its centre.
 *   7–8s  LOOSENING  back out to their scattered spots, black again.
 * and round again. All the while, in both states, the whole cloud turns
 * slowly about its centre in 3D (round z, rocking on x and y, nearer dots
 * larger). Each dot is a ball in one even colour, turning about its own x, y and z (its
 * lava-lamp lobes roll round it), and in the system each slides in and out
 * along its line, so the lines grow and shrink. The dots are drawn here, not
 * images. Only while on screen; reduced motion shows the tidy system, still.
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
  var T_FLOAT = 3.0, T_GATHER = 1.0, T_TURN = 3.0, T_RELEASE = 1.0;
  var FOCAL = 520;                                              // perspective, in box units
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
      sz: (rand() - 0.5) * 160,                                 // depth when scattered
      tz: (rand() - 0.5) * 120,                                 // and in the system: a burst in depth too
      dd: 0.25 + rand() * 0.35, dp: rand() * 6.28,              // sliding in and out along its line, slowly
      // its own tumble: a pace about each of x, y and z
      rx: 0.6 + rand() * 1.2, ry: 0.6 + rand() * 1.2, rz: (rand() - 0.5) * 2, r0: rand() * 6.28,
      colour: COLOURS[Math.floor(rand() * COLOURS.length)],
      // the float and the lava-lamp wobble, each its own pace
      fx: 4 + rand() * 6, fy: 4 + rand() * 6, fp: rand() * 6.28, fs: 0.6 + rand() * 0.8,
      wp: rand() * 6.28, ws: 1.2 + rand() * 1.6, wk: 2 + Math.floor(rand() * 2)
    });
  }

  function ease(x) { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }

  // A soft blob: a ring of points pushed in and out by slow waves, joined
  // with smooth curves. wob 0 is a plain circle.
  // A ball in one even colour. Its turn about z rolls the lobes of the wobble
  // round it; the turns about x and y swell them in and out, as a turning
  // lumpy ball does.
  function shade(rgb, k) {   // k > 0 towards white, < 0 towards black
    var to = k > 0 ? 255 : 0, a = Math.abs(k);
    return "rgb(" + rgb.map(function (c) { return Math.round(c + (to - c) * a); }).join(",") + ")";
  }
  function blob(x, y, r, t, dot, wob, rgb) {
    var n = 24, pts = [];
    var rz = dot.r0 + t * dot.rz;
    var fx = 0.92 + 0.08 * Math.cos(dot.r0 + t * dot.ry);
    var fy = 0.92 + 0.08 * Math.cos(dot.r0 * 1.7 + t * dot.rx);
    var cz = Math.cos(rz), sz = Math.sin(rz);
    for (var k = 0; k < n; k++) {
      var th = (k / n) * Math.PI * 2;
      var push = wob * (0.14 * Math.sin(dot.wk * th + dot.wp + t * dot.ws) + 0.06 * Math.sin((dot.wk + 1) * th - t * dot.ws * 0.7));
      var px = Math.cos(th) * r * (1 + push) * fx, py = Math.sin(th) * r * (1 + push) * fy;
      pts.push([x + px * cz - py * sz, y + px * sz + py * cz]);
    }
    ctx.beginPath();
    var m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    ctx.moveTo(m0[0], m0[1]);
    for (k = 0; k < n; k++) {
      var p = pts[k], q = pts[(k + 1) % n];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.closePath();
    ctx.fillStyle = shade(rgb, 0);   // flat, one even colour
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

  // The cloud's own turn about its centre: round z all the time, rocking
  // gently on x and y.
  function spin(t) {
    return { x: 0.38 * Math.sin(t * 0.45), y: 0.5 * Math.sin(t * 0.33 + 1), z: t * 0.12 };
  }
  function turn3(x, y, z, a) {
    var c = Math.cos(a.z), s = Math.sin(a.z), X = x * c - y * s, Y = x * s + y * c;
    c = Math.cos(a.x); s = Math.sin(a.x); var Y2 = Y * c - z * s, Z = Y * s + z * c;
    c = Math.cos(a.y); s = Math.sin(a.y); var X2 = X * c + Z * s, Z2 = -X * s + Z * c;
    return [X2, Y2, Z2];
  }

  function draw(t) {
    var p = reduced ? { k: 1, turn: 0 } : phase(t);
    var a = reduced ? { x: 0, y: 0, z: 0 } : spin(t);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, BW, BH);
    var pos = dots.map(function (d, i) {
      var ang = d.a + p.turn;
      var dd = d.d * (1 + 0.22 * Math.sin(t * d.dd + d.dp));             // in and out along its line
      var tx = Math.cos(ang) * dd, ty = Math.sin(ang) * dd;
      var fx = d.sx - CX + Math.sin(t * d.fs + d.fp) * d.fx, fy = d.sy - CY + Math.cos(t * d.fs * 0.8 + d.fp) * d.fy;
      var q = turn3(mix(fx, tx, p.k), mix(fy, ty, p.k), mix(d.sz, d.tz, p.k), a);
      var f = FOCAL / (FOCAL + q[2]);                                     // nearer, larger
      return { x: CX + q[0] * f, y: CY + q[1] * f, f: f, z: q[2], i: i };
    });
    // the lines to the centre, only as the system forms
    if (p.k > 0.01) {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = p.k;
      ctx.beginPath();
      pos.forEach(function (q) { ctx.moveTo(CX, CY); ctx.lineTo(q.x, q.y); });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    pos.slice().sort(function (m, n) { return n.z - m.z; }).forEach(function (q) {   // far ones first
      var d = dots[q.i];
      var ink = hex(INK), c = hex(d.colour);
      var rgb = [0, 1, 2].map(function (j) { return mix(ink[j], c[j], p.k); });
      blob(q.x, q.y, d.r * q.f, t, d, 1 - p.k, rgb);
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
