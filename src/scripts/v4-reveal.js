/* V4 homepage entrance — _reveal.css, layouts/v4.njk.
 *
 * Blocks arrive one after another as they come into view, all the way down
 * the page. Whatever comes into view together (the whole first screen at
 * load, or a project row scrolled to) is revealed in page order, STAGGER
 * apart, the clock right after the intro. A project's thumbnails follow its
 * name, one by one, even those still off to the right in the strip.
 *
 * It measures positions itself, straight away at load and on every scroll
 * and resize, rather than waiting on an observer, so the first screen starts
 * at once. The first screen takes about 1.5s in all.
 *
 * Runs only when the head script set html.js-reveal. It marks html
 * .is-reveal-ready as it starts; if it never does, the head script's timer
 * shows everything (html.is-revealed).
 */
(function () {
  "use strict";

  var root = document.documentElement;
  if (!root.classList.contains("js-reveal")) return;
  root.classList.add("is-reveal-ready");

  var STAGGER = 0.085; // s
  var TIME = 0.65;     // s, --v4-reveal-time
  var LINE = 0.92;     // a block counts as in view once its top passes 92% down

  // The same list as _reveal.css, less the project thumbnails, which follow
  // their project's name rather than being watched themselves.
  var pending = Array.prototype.slice.call(document.querySelectorAll([
    ".v4-rail",
    ".v4-intro__name",
    ".v4-intro__bio",
    ".v4-intro__meta",
    ".v4-status",
    ".v4-label",
    ".v4-project__head",
    ".v4-about__photos",
    ".v4-about__text > p",
    ".v4-about__card",
    ".v4-process__diagram",
    ".v4-experience__role",
    ".v4-footer__title",
    ".v4-footer__body",
    ".v4-footer__button",
    ".v4-footer__meta"
  ].join(", ")));

  // The clock comes earlier in the page source (its dock is a side column)
  // but should arrive with the intro, just after the location and email.
  var meta = document.querySelector(".v4-intro__meta");
  function anchor(el) {
    return meta && el.classList.contains("v4-status") ? meta : el;
  }
  function byPage(a, b) {
    var pa = anchor(a), pb = anchor(b);
    if (pa === pb) return a === pa ? -1 : 1;
    return pa.compareDocumentPosition(pb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  }

  function show(list) {
    list.forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", (i * STAGGER).toFixed(3) + "s");
      el.classList.add("is-in");
      // Entrance over: hand the element back its own transitions.
      setTimeout(function () { el.classList.add("is-done"); }, (i * STAGGER + TIME) * 1000 + 50);
    });
  }

  function check() {
    if (!pending.length) return;
    var line = window.innerHeight * LINE;
    var batch = [];
    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      var inView = r.top < line && r.bottom > 0 && (r.width > 0 || r.height > 0);
      if (inView) batch.push(el);
      return !inView;
    });
    if (!batch.length) return;
    batch.sort(byPage);
    var list = [];
    batch.forEach(function (el) {
      list.push(el);
      if (el.classList.contains("v4-project__head")) {
        var row = el.closest(".v4-project");
        if (row) list.push.apply(list, row.querySelectorAll(".v4-project__panel"));
      }
    });
    show(list);
  }

  check();
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
  window.addEventListener("load", check);
})();
