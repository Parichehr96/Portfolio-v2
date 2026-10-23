/* ONTON case study (V4) — shared behaviour for the visuals.
 *
 * fitCanvas  every visual is drawn at 600 px in .canvas and scaled to its frame.
 * whenSeen   motion starts once half the visual is on screen (the ONTON rule);
 *            ?play starts at once, ?end jumps to the final state (for checks).
 * count      tweens a number in an element, eased, formatted by fmt.
 * stagger    adds .on to each element in turn across ms.
 * Only facts already in the case study are drawn; nothing here is new data.
 */
(function () {
  function fitCanvas() {
    document.querySelectorAll(".frame").forEach(function (f) {
      var c = f.querySelector(":scope > .canvas"); if (!c) return;
      var s = f.clientWidth / 600; c.style.transform = "scale(" + s + ")"; f.style.height = c.offsetHeight * s + "px";
    });
  }
  addEventListener("resize", fitCanvas);
  addEventListener("load", fitCanvas);
  document.addEventListener("DOMContentLoaded", fitCanvas);
  window.fitCanvas = fitCanvas;

  window.END = /[?&]end/.test(location.search);
  window.reduced = window.END || matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.END) document.documentElement.insertAdjacentHTML("beforeend", "<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>");
  window.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, window.END ? Math.min(ms, 10) : ms); }); };
  window.whenSeen = function (el, cb) {
    if (/[?&](play|end)/.test(location.search) || !("IntersectionObserver" in window)) { el.classList.add("is-in"); cb && cb(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("is-in"); cb && cb(); } }); }, { threshold: 0.5 });
    io.observe(el);
  };

  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  window.count = function (el, from, to, ms, fmt) {
    fmt = fmt || function (v) { return Math.round(v); };
    if (window.reduced || !ms) { el.textContent = fmt(to); return Promise.resolve(); }
    return new Promise(function (r) {
      var t0 = performance.now();
      (function f(now) { var t = Math.max(0, Math.min(1, (now - t0) / ms)); /* never before the start */ el.textContent = fmt(from + (to - from) * ease(t)); t < 1 ? requestAnimationFrame(f) : r(); })(t0);
    });
  };
  window.stagger = function (els, ms, cls) {
    els = Array.prototype.slice.call(els); var step = els.length > 1 ? ms / (els.length - 1) : 0;
    els.forEach(function (x, i) { setTimeout(function () { x.classList.add(cls || "on"); }, window.reduced ? 0 : i * step); });
  };

  /* mm:ss for a running clock */
  window.clock = function (s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); };
})();
