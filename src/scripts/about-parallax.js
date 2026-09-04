/* ABOUT PARALLAX — Figma 664:61547 (resting) to 666:61738 (arrived).
 *
 * Writes ONE custom property, --about-progress, from 0 to 1 as the section
 * scrolls through its pin. Everything visible is CSS reading that number: the
 * photo's dim, the six colour ramps and the summary's translate all live in
 * _about.css. This file decides *where* in the travel we are and nothing else.
 *
 * IT NEVER TOUCHES LAYOUT, and that is the whole design of it. One
 * getBoundingClientRect read per frame, one style write of a unitless number.
 * No element is measured against another, no width or height is set, nothing is
 * added to or removed from the document. A scroll handler that writes layout is
 * how a page starts dropping frames on a trackpad.
 *
 * NO SCROLL LIBRARY, deliberately — the same call the hero pin and the work
 * card-stack made. The pin is position:sticky and the runway is a real element;
 * this only reports progress through them.
 *
 * CSS scroll-timeline would replace this file outright and was the first choice,
 * but animation-timeline still has no Safari support at the versions this site
 * targets, and the whole effect would silently not run there. A twelve-line rAF
 * handler that works everywhere beats a declarative one that works in Chrome.
 *
 * Zero dependencies. Degrades to the resting comp if it never loads: --about-
 * progress is declared as 0 in _about.css, so the section renders as 664:61547.
 */
(function (window, document) {
  "use strict";

  var section = document.getElementById("about-me");
  if (!section) return; // not the homepage

  /* THE OPT-OUTS ARE THE STYLESHEET'S, READ BACK. _about.css pins progress to 1
     under reduced motion and at 900 or below — the arrived state, which is what
     666:61738 draws. If this file also wrote progress it would fight that rule
     every frame, so it checks the same two conditions and simply does not run.
     matchMedia rather than a width read: it is the same query the CSS uses, and
     it costs no layout. */
  var OPT_OUT = "(prefers-reduced-motion: reduce), (max-width: 900px)";

  /* Past this the header flips dark. The photo is at 0.35 * 0.6 = 21% black by
     then — the point where a light header stops having contrast against it
     rather than the point the dim finishes. Tuned by eye against the comp. */
  var THEME_FLIP = 0.35;

  var frame = 0;
  var theme = "";

  /* Cached, not read per frame: offsetHeight forces layout, and this only
     changes when the viewport does. */
  var runway = section.querySelector(".about__runway");
  var travel = 0;
  function measure() {
    travel = runway ? runway.offsetHeight : 0;
  }

  function apply() {
    frame = 0;

    var r = section.getBoundingClientRect();
    /* PROGRESS IS MEASURED OVER THE PIN, NOT OVER THE SECTION. This was
       `r.height - innerHeight`, which on a 950 window ran to about 1108px while
       the content finished settling after 679 — so the dim was still climbing
       long after the content had arrived, and kept climbing while it slid away.
       The runway's own height IS the settle travel (see --about-travel), so
       measuring against it makes the dim, the theme flip and the content all
       land on the same frame.
       -r.top is how far the section's top has passed the viewport top, which is
       exactly how far the stage has been pinned: the stage sits at top:60 inside
       60px of padding, so it sticks the moment that number goes positive. */
    var p = travel > 0 ? -r.top / travel : 0;
    if (p < 0) p = 0;
    else if (p > 1) p = 1;

    section.style.setProperty("--about-progress", p.toFixed(4));

    var want = p > THEME_FLIP ? "dark" : "light";
    if (want !== theme) {
      theme = want;
      section.setAttribute("data-header-theme", want);
    }
  }

  /* rAF-coalesced, the same shape work-motion.js and case-embed.js use: many
     scroll events collapse into one write per painted frame. passive because
     this never calls preventDefault and the browser should not have to wait to
     find that out. */
  function onScroll() {
    if (frame) return;
    frame = window.requestAnimationFrame(apply);
  }

  function onResize() {
    measure();
    onScroll();
  }

  function start() {
    if (window.matchMedia && window.matchMedia(OPT_OUT).matches) {
      /* Leave the attribute where the CSS wants it. The arrived state is dark,
         so the header must be told once even though nothing will animate. */
      section.setAttribute("data-header-theme", "dark");
      theme = "dark";
      return;
    }
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    apply(); // a restored scroll position may already be mid-travel
  }

  start();

  /* Crossing the breakpoint changes which of the two regimes applies, and a
     resize can cross it without a reload. Re-running start() is enough: the
     listeners are idempotent by name and the opt-out branch returns before
     adding any. */
  if (window.matchMedia) {
    var mq = window.matchMedia(OPT_OUT);
    var sync = function () {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      theme = "";
      section.style.removeProperty("--about-progress");
      start();
    };
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else if (mq.addListener) mq.addListener(sync);
  }
})(window, document);
