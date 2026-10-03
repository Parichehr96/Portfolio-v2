/* V4 homepage entrance, below the first screen — _reveal.css.
 *
 * The first screen rises in by CSS alone. This handles everything after it:
 * section headings, project rows, the photo wheel, each About paragraph and
 * folder, the process diagram, each Experience role and the footer's lines.
 * As it starts, it hides (.is-pending)
 * only those still below the screen, so nothing visible ever blinks out and,
 * if it never runs, nothing is ever hidden. Each is brought in (.is-in) as
 * it is scrolled to; a project's thumbnails follow its name, one by one.
 * Positions are measured on every scroll, not left to an observer. Once a
 * block has risen in, its reveal classes are removed, so it is left with
 * only its own styles (hover effects and all).
 */
(function () {
  "use strict";

  var root = document.documentElement;
  if (!root.classList.contains("js-reveal")) return;

  var STAGGER = 0.085; // s, --v4-reveal-stagger
  var TIME = parseFloat(getComputedStyle(root).getPropertyValue("--v4-reveal-time")) || 1.3; // s
  var LINE = 0.92;     // in view once its top passes 92% down the screen

  var firstRow = document.querySelector(".v4-work > .v4-project");
  var firstLabel = document.querySelector(".v4-work > .v4-label");
  var watched = Array.prototype.slice.call(document.querySelectorAll([
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
    ".v4-footer__meta",
    // case studies: the hook, then each section's heading, text and blocks
    ".v4-case__hook",
    ".v4-case__section > *"
  ].join(", ")))
    .filter(function (el) {
      return el !== firstLabel && !(firstRow && firstRow.contains(el));
    });

  function panelsOf(head) {
    var row = head.closest(".v4-project");
    return row ? Array.prototype.slice.call(row.querySelectorAll(".v4-project__panel")) : [];
  }

  // Hide only what is still below the screen.
  var pending = watched.filter(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) return false;
    el.classList.add("is-pending");
    if (el.classList.contains("v4-project__head")) {
      panelsOf(el).forEach(function (p) { p.classList.add("is-pending"); });
    }
    return true;
  });

  function check() {
    if (!pending.length) return;
    var line = window.innerHeight * LINE;
    var list = [];
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top >= line) return true;
      list.push(el);
      if (el.classList.contains("v4-project__head")) list.push.apply(list, panelsOf(el));
      return false;
    });
    list.forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", (i * STAGGER).toFixed(3) + "s");
      el.classList.add("is-in");
      setTimeout(function () {
        el.classList.remove("is-pending", "is-in");
        el.style.removeProperty("--reveal-delay");
      }, (i * STAGGER + TIME) * 1000 + 50);
    });
  }

  check();
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
})();
