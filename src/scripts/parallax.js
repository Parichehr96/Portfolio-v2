/* SECTION PARALLAX — the pin-and-settle mechanic, shared.
 *
 * Was about-parallax.js, which did this for one section by id. The
 * section-specific parts are attributes now:
 *
 *   data-parallax="--story-progress"   the custom property to write, 0 to 1
 *   data-parallax-runway               on the empty sibling that buys the pin
 *                                      its scroll distance; its height IS the
 *                                      travel
 *   data-parallax-flip="0.16"          optional. Past this fraction the section
 *                                      flips data-header-theme to dark. OMIT IT
 *                                      and the attribute is never touched.
 *   data-parallax-media="(max-width: 900px)"
 *                                      optional. When present it REPLACES the
 *                                      shared opt-out below for that item: the
 *                                      item runs only while this query matches.
 *                                      An item that declares one has stated its
 *                                      own condition, so the default no longer
 *                                      applies to it.
 *
 * TWO ITEMS USE IT TODAY, AND THEY NEST.
 *   .story                the About -> Testimonials supersection, which derives
 *                         four sub-beats from the single number written here.
 *   .story__panel--about  the About band alone, mobile only — down there
 *                         testimonials is a separate static block and only the
 *                         About half is pinned, so the pin cannot be the stage.
 * Neither knows about the other. The panel carries a data-parallax-media so it
 * is skipped entirely above 900, where it is display:contents and would report a
 * zero rect; .story carries none, so it keeps the shared opt-out and behaves
 * exactly as it did when it was the only item.
 *
 * Everything visible is CSS reading that number: the photo's dim, the colour
 * ramps and the content's translate all live in the section's own stylesheet.
 * This file decides *where* in the travel we are and nothing else.
 *
 * IT NEVER TOUCHES LAYOUT, and that is the whole design of it. One
 * getBoundingClientRect read per section per frame, one style write of a
 * unitless number. No element is measured against another, no width or height is
 * set, nothing is added to or removed from the document. A scroll handler that
 * writes layout is how a page starts dropping frames on a trackpad.
 *
 * ONE HANDLER FOR ALL SECTIONS, not one per section: a single rAF and a single
 * scroll listener walk the list, so adding a second pinned section costs one
 * attribute and no extra listener.
 *
 * NO SCROLL LIBRARY, deliberately — the same call the hero pin and the work
 * card-stack made. The pin is position:sticky and the runway is a real element;
 * this only reports progress through them.
 *
 * CSS scroll-timeline would replace this file outright and was the first choice,
 * but animation-timeline still has no Safari support at the versions this site
 * targets, and the whole effect would silently not run there. A short rAF
 * handler that works everywhere beats a declarative one that works in Chrome.
 *
 * Zero dependencies. Degrades to each section's resting comp if it never loads:
 * every progress property is declared as 0 in the section's own stylesheet.
 */
(function (window, document) {
  "use strict";

  var sections = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax]")
  );
  if (!sections.length) return; // not the homepage

  /* THE OPT-OUTS ARE THE STYLESHEETS', READ BACK. Each section's CSS pins its
     progress to 1 under reduced motion and at 900 or below — the arrived state,
     which is what the mobile nodes draw. If this file also wrote progress it
     would fight that rule every frame, so it checks the same two conditions and
     simply does not run. matchMedia rather than a width read: it is the same
     query the CSS uses, and it costs no layout. */
  var OPT_OUT = "(prefers-reduced-motion: reduce), (max-width: 900px)";

  function matches(q) {
    return !!(window.matchMedia && window.matchMedia(q).matches);
  }

  /* An item with its own query answers to that and nothing else; an item without
     one answers to the shared opt-out, exactly as before. */
  function active(item) {
    return item.media ? matches(item.media) : !matches(OPT_OUT);
  }

  var frame = 0;

  var items = sections.map(function (el) {
    var flip = parseFloat(el.getAttribute("data-parallax-flip"));
    return {
      el: el,
      prop: el.getAttribute("data-parallax"),
      media: el.getAttribute("data-parallax-media"),
      /* :scope > — A DIRECT CHILD, NOT ANY DESCENDANT, and the difference is
         load-bearing now that two items nest. .story contains the About panel,
         which owns a runway sitting EARLIER in the document than .story's own;
         a bare descendant query would hand .story the panel's runway and measure
         the desktop beat map against the wrong element. Each runway is a direct
         child of the item it belongs to. */
      runway: el.querySelector(":scope > [data-parallax-runway]"),
      /* NaN when the attribute is absent, and that is the "never flip" signal —
         not a default of 0, which would flip on the first pixel. */
      flip: isNaN(flip) ? null : flip,
      travel: 0,
      theme: ""
    };
  });

  /* Cached, not read per frame: offsetHeight forces layout, and this only
     changes when the viewport does. */
  function measure() {
    items.forEach(function (item) {
      item.travel = item.runway ? item.runway.offsetHeight : 0;
    });
  }

  function apply() {
    frame = 0;

    items.forEach(function (item) {
      if (!active(item)) return;
      var r = item.el.getBoundingClientRect();
      /* PROGRESS IS MEASURED OVER THE PIN, NOT OVER THE SECTION. This was
         `r.height - innerHeight`, which on a 950 window ran to about 1108px
         while About's content finished settling after 679 — so the dim was still
         climbing long after the content had arrived, and kept climbing while it
         slid away. The runway's own height IS the settle travel, so measuring
         against it makes the dim, the theme flip and the content all land on the
         same frame.
         -r.top is how far the section's top has passed the viewport top, which
         is exactly how far the stage has been pinned: the stage sits at top:60
         inside 60px of padding, so it sticks the moment that number goes
         positive. */
      var p = item.travel > 0 ? -r.top / item.travel : 0;
      if (p < 0) p = 0;
      else if (p > 1) p = 1;

      /* SIX PLACES, NOT FOUR. This number is normalised against the whole
         runway, so its quantisation grid in scroll pixels is the runway's
         length times the step: four places on a 1478px pin is a 0.15px grid,
         and a section that derives a sub-beat from it inherits that error
         multiplied by the ratio of the two lengths. Six makes the grid
         0.0015px and the arithmetic stops being visible. */
      item.el.style.setProperty(item.prop, p.toFixed(6));

      if (item.flip === null) return;
      var want = p > item.flip ? "dark" : "light";
      if (want !== item.theme) {
        item.theme = want;
        item.el.setAttribute("data-header-theme", want);
      }
    });
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
    /* Leave the attribute where the CSS wants it, per DORMANT item. A ramping
       section's arrived state is dark, so it must be told once even though
       nothing will animate; a section with no flip already says what it is in
       markup. */
    items.forEach(function (item) {
      if (active(item) || item.flip === null) return;
      item.el.setAttribute("data-header-theme", "dark");
      item.theme = "dark";
    });

    /* The old early return, generalised from "the one section is opted out" to
       "every item is dormant". */
    if (!items.some(active)) return;

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
    /* Every query any item depends on, deduped — crossing ANY of them changes
       which regime applies to at least one item. */
    var queries = [OPT_OUT];
    items.forEach(function (item) {
      if (item.media && queries.indexOf(item.media) === -1) queries.push(item.media);
    });
    var sync = function () {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      items.forEach(function (item) {
        item.theme = "";
        item.el.style.removeProperty(item.prop);
      });
      start();
    };
    queries.forEach(function (q) {
      var mq = window.matchMedia(q);
      if (mq.addEventListener) mq.addEventListener("change", sync);
      else if (mq.addListener) mq.addListener(sync);
    });
  }
})(window, document);
