/* Floating bottom navigation — home page only (Figma "Navigation Bar" 6:24205).
 *
 * Two jobs:
 *   1. Click an item → scroll to its section and select it immediately.
 *   2. Scroll        → keep the selected item in sync with the section the
 *                      reader is currently on.
 *
 * Selection is exclusive: exactly one item carries .is-active / aria-current.
 * Zero dependencies.
 */
(function () {
  "use strict";

  var nav = document.querySelector(".bottom-nav");
  if (!nav) return; // only present on index.html

  var items = Array.prototype.slice.call(nav.querySelectorAll(".bottom-nav-item"));
  // Same order as the markup; a null means the section isn't on this page.
  var targets = items.map(function (a) {
    return document.getElementById(a.getAttribute("href").slice(1));
  });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = -1;

  /* A section becomes current once its top crosses this line, measured down
     from the viewport top. Nominally the upper third, but capped: Summary and
     Projects start only 240px apart, and a true third (≈300px on a 900px
     viewport) puts Projects past the line the moment Summary reaches the top —
     so Summary could never be the selected item. 160px clears every section
     gap on the page (the smallest is 240px) at any viewport height. */
  var LINE = 160;

  function select(i) {
    if (i === current || i < 0) return;
    current = i;
    items.forEach(function (a, n) {
      var on = n === i;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  // ---- Scroll → selection --------------------------------------------------
  // A click scrolls over many sections at once; without this the scroll-spy
  // would flicker through each one on the way and land on whichever the
  // animation ended near, instead of the item that was clicked. Cleared early
  // if the reader takes over the scroll themselves.
  var lockedTo = -1;

  function unlock() {
    lockedTo = -1;
  }
  ["wheel", "touchstart", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, unlock, { passive: true });
  });

  // The IntersectionObserver is the trigger; the winner is decided from
  // geometry, which stays correct when several sections share the band.
  function update() {
    if (lockedTo >= 0) return select(lockedTo);
    // Bottom of the page: the last section can be too short to ever reach the
    // line, so it would otherwise never light up.
    var doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
      return select(items.length - 1);
    }
    var best = -1;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i] && targets[i].getBoundingClientRect().top <= LINE + 1) best = i;
    }
    select(best);
  }

  // rootMargin collapses the root to a band from the viewport top down to LINE,
  // so the observer fires exactly when a section's top crosses it. Rebuilt on
  // resize because the margin is derived from the viewport height.
  var io = null;
  function observe() {
    if (io) io.disconnect();
    io = new IntersectionObserver(update, {
      rootMargin: "0px 0px -" + Math.max(0, window.innerHeight - LINE) + "px 0px",
      threshold: 0,
    });
    targets.forEach(function (el) {
      if (el) io.observe(el);
    });
  }
  observe();
  window.addEventListener("resize", observe);
  // Sections above the fold never fire an entry event, and long sections fire
  // none while you scroll through them — so drive it from scroll as well.
  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    },
    { passive: true }
  );

  // ---- Reveal ---------------------------------------------------------------
  // The bar stays out of the way while the hero owns the screen. rootMargin
  // collapses the root to the TOP HALF of the viewport, so the test is simply
  // "is any hero still up there" — the bar appears once the splash's bottom
  // edge passes the midpoint, and slides back out on the way up.
  //
  // Deliberately not intersectionRatio: that is measured against the splash's
  // own height, and on narrow screens the hero content overflows 100vh, so its
  // ratio at the very top is already below half — which revealed the bar on the
  // hero on first load. A viewport-anchored band is independent of hero height.
  //
  // The CSS starts hidden, so there is no flash before this first fires.
  var splash = document.getElementById("splash");
  if (splash) {
    new IntersectionObserver(
      function (entries) {
        nav.classList.toggle("is-revealed", !entries[entries.length - 1].isIntersecting);
      },
      { rootMargin: "0px 0px -50% 0px", threshold: 0 }
    ).observe(splash);
  } else {
    nav.classList.add("is-revealed"); // no hero on this page — always visible
  }

  // ---- Click → scroll ------------------------------------------------------
  items.forEach(function (a, i) {
    a.addEventListener("click", function (e) {
      var el = targets[i];
      if (!el) return; // let the browser handle a missing anchor
      e.preventDefault();
      lockedTo = i;
      select(i);
      // scrollIntoView resolves the destination at scroll time, so it clamps at
      // the document end by itself — which plain scrollTo(top) does not.
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

      // Expanding the footer and the timeline runway both change layout while
      // the scroll is in flight, which can leave the target short of the top.
      // Re-measure a few times as it settles and close any remaining gap.
      var tries = 0;
      (function correct() {
        if (lockedTo !== i || ++tries > 6) {
          if (lockedTo === i) lockedTo = -1;
          return;
        }
        var off = el.getBoundingClientRect().top;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (Math.abs(off) > 4 && window.scrollY < max - 1) {
          window.scrollTo({
            top: Math.min(max, Math.round(off + window.scrollY)),
            behavior: reduce ? "auto" : "smooth",
          });
        }
        setTimeout(correct, 140);
      })();
    });
  });

  update();
})();
