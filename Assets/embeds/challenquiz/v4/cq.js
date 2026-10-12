/* Challenquiz case-study visuals — shared behaviour.
 *
 * fit: every visual is drawn at 600px inside .canvas and scaled to its frame.
 * whenSeen: motion starts once half the frame is on screen (the ONTON rule).
 * phone(state, w): the real prototype, deep-linked to one moment
 *   (tools/challenquiz-app ?state=…&bare), framed as a phone w px wide.
 * old(n, w): a still of the old app (img/old-1…6.png, from the walkthrough video).
 * ?play starts motion at once; ?end jumps to the final state. Both for checking.
 */
(function () {
  function fit() {
    document.querySelectorAll(".frame").forEach(function (f) {
      var c = f.querySelector(":scope > .canvas"); if (!c) return;
      var s = f.clientWidth / 600;
      c.style.transform = "scale(" + s + ")";
      f.style.height = c.offsetHeight * s + "px";
    });
  }
  window.addEventListener("resize", fit);
  document.addEventListener("DOMContentLoaded", fit);
  window.addEventListener("load", fit);
  window.fit = fit;

  window.END = /[?&]end/.test(location.search);
  window.reduced = window.END || matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.END) document.documentElement.insertAdjacentHTML("beforeend", "<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>");
  window.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, window.END ? 10 : ms); }); };
  window.whenSeen = function (el, cb) {
    if (/[?&](play|end)/.test(location.search) || !("IntersectionObserver" in window)) { el.classList.add("is-in"); cb && cb(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("is-in"); cb && cb(); } });
    }, { threshold: 0.5 });
    io.observe(el);
  };

  /* Where the prototype lives: next to the visuals on the site, in tools/ while proposing. */
  var APP = window.CQ_APP || (/\/Assets\/embeds\//.test(location.pathname) ? "../v2/index.html" : "../../challenquiz-app/index.html");
  window.appSrc = function (state, live) { return APP + "?state=" + state + "&bare" + (live ? "&live" : ""); };
  var IMG = /\/Assets\/embeds\//.test(location.pathname) ? "img/" : "img/";

  window.phone = function (state, w, o) {
    o = o || {};
    var h = Math.round(w * 852 / 393), s = w / 393;
    return '<div class="phone' + (o.flat ? " flat" : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + (o.style ? ' style="' + o.style + '"' : "") +
      '><div class="scr" style="width:' + w + "px;height:" + h + 'px"><iframe loading="lazy" tabindex="-1" aria-hidden="true" src="' +
      appSrc(state, o.live) + '" style="transform:scale(' + s + ')"></iframe></div></div>';
  };
  /* swap a phone's moment with a short crossfade */
  window.setPhone = function (el, state, live) {
    var scr = el.querySelector(".scr"), old = scr.querySelector("iframe"), s = old.style.transform;
    var f = document.createElement("iframe"); f.tabIndex = -1; f.setAttribute("aria-hidden", "true");
    f.style.transform = s; f.style.opacity = 0; f.style.transition = "opacity .35s";
    f.onload = function () { setTimeout(function () { f.style.opacity = 1; setTimeout(function () { old.remove(); }, 380); }, 120); };
    f.src = appSrc(state, live); scr.appendChild(f);
  };
  window.old = function (n, w, o) {
    o = o || {};
    var h = Math.round(w * 852 / 393);
    return '<div class="phone' + (o.flat ? " flat" : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + (o.style ? ' style="' + o.style + '"' : "") +
      '><div class="scr" style="width:' + w + "px;height:" + h + 'px"><img class="old" src="' + IMG + "old-" + n + '.png" alt=""></div></div>';
  };

  /* the four verbs, used across visuals */
  window.VERBS = [
    { k: "open", t: "Open", d: "into a game, fast" },
    { k: "play", t: "Play", d: "against someone" },
    { k: "learn", t: "Learn", d: "something new" },
    { k: "enjoy", t: "Enjoy", d: "how it ended" },
  ];
  /* the old flow, as the walkthrough video narrates it */
  window.OLD = [
    { t: "Find a match", d: "in a stack of identical “2 Player quiz” cards", f: true },
    { t: "Filter", d: "from a topic dropdown, if you noticed it", f: false },
    { t: "Join", d: "and wait for the room, with no sign it's working", f: true },
    { t: "Read", d: "a six-bullet “Attention needed” rulebook", f: true },
    { t: "Answer", d: "ten questions, with no opponent in sight", f: false },
    { t: "Finish", d: "on “Well done… please wait for other players”", f: true },
  ];
})();

/* product icons + one answer row as HTML (states: '', ok, no, right, other, removed) */
window.IC = {
  check: function (c) { return '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; },
  cross: function (c) { return '<svg viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round"/></svg>'; },
  bulb: function (c) { return '<svg viewBox="0 0 16 16" fill="none"><path d="M5.6 11.2C4.4 10.3 3.6 8.9 3.6 7.4a4.4 4.4 0 1 1 8.8 0c0 1.5-.8 2.9-2 3.8v1.1H5.6v-1.1Z" stroke="' + c + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M6.4 14.2h3.2" stroke="' + c + '" stroke-width="1.6" stroke-linecap="round"/></svg>'; },
};
window.row = function (label, st, o) {
  o = o || {};
  var ic = { ok: IC.check("#02571A"), no: IC.cross("#8D001E"), right: IC.check("#027B24"), removed: IC.bulb("#B8ABDA") }[st] || "";
  var chip = { ok: "Your answer", no: "Your answer", right: "Correct" }[st];
  var pc = st === "removed" ? "Removed" : (o.pct != null ? o.pct + "%" : "");
  return '<div class="ar ' + (st || "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + ">" + (!st && o.n ? '<span class="ix">' + o.n + ".</span>" : "") + ic +
    '<span class="lb">' + label + "</span>" + (chip ? '<span class="chip">' + chip + "</span>" : "") + (pc ? '<span class="pc">' + pc + "</span>" : "") +
    (o.pct != null && st !== "removed" && st ? '<span class="bar" style="width:' + o.pct + '%"></span>' : "") + "</div>";
};
