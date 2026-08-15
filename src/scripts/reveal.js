// reveal.js — shared scroll-reveal observer.
//
// Every element tagged `.reveal-item` starts hidden (opacity 0, translateY 10px;
// see styles.css) and reveals once, the first time it crosses 15% visibility, by
// gaining the `.revealed` class. Items that reveal together (initial load or a
// fast scroll through a dense section) are sorted by vertical position and given
// a 60ms staggered transition-delay so they cascade instead of popping in as a
// batch. After playing, the inline delay is cleared so it can't leak into later
// transitions (e.g. hover). Each item is unobserved after it reveals, so
// scrolling back up never re-triggers it.
//
// Included with <script defer> on every page that opts in. Touches nothing but
// `.reveal-item` elements — sidebars, nav, splash, and footer are untagged.

(function () {
  "use strict";

  var STAGGER_MS = 60;
  var DURATION_MS = 550;
  var THRESHOLD = 0.15;

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // An element is "hidden" if it renders no boxes (display:none, or inside a
  // collapsed/hidden container). Such items aren't observed until they're shown.
  function isHidden(el) {
    return el.getClientRects().length === 0;
  }

  function init() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll(".reveal-item")
    );
    if (!items.length) return;

    // Reduced motion: the CSS already forces the final state; just mark them
    // revealed (no observer, no animation) for consistency.
    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(onIntersect, {
      threshold: THRESHOLD,
    });

    items.forEach(function (el) {
      if (isHidden(el)) return; // observe later, once shown
      observer.observe(el);
    });

    function onIntersect(entries) {
      var revealing = [];

      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealing.push(entry.target);
          observer.unobserve(entry.target);
          return;
        }
        // Safety net for fast scrolls (or an item shown by a filter while it's
        // already above the viewport): if it has scrolled fully past the top it
        // will never cross the threshold from below — reveal it instantly, no
        // stagger, so it isn't left stuck invisible. Guard on height > 0 so a
        // display:none element (rect collapsed to 0,0) is NOT caught here.
        var r = entry.boundingClientRect;
        var rootTop = entry.rootBounds ? entry.rootBounds.top : 0;
        if (r.height > 0 && r.bottom <= rootTop) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });

      if (!revealing.length) return;

      // Sort by vertical position so the cascade always runs top → bottom.
      revealing.sort(function (a, b) {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      });

      // Assign the staggered delay to every item in this batch first…
      revealing.forEach(function (el, i) {
        if (i) el.style.transitionDelay = i * STAGGER_MS + "ms";
      });
      // …then force ONE reflow so the hidden initial state is committed before
      // the class flip. This guarantees the transition runs without depending on
      // requestAnimationFrame (one layout read for the whole batch).
      void document.documentElement.offsetWidth;

      revealing.forEach(function (el, i) {
        el.classList.add("revealed");
        var delay = i * STAGGER_MS;
        // Clear the stagger delay once it has played so it can't leak into any
        // later transition on this element.
        window.setTimeout(function () {
          el.style.transitionDelay = "";
        }, delay + DURATION_MS + 50);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
