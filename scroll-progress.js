// scroll-progress.js — shared by every case study page.
//
// Drives the <div class="scroll-progress"> bar fixed to the bottom of the
// viewport: its width is a direct, linear mapping of scroll position (0% at the
// top, 100% at the bottom). Not an animation — just a readout of scrollY — so it
// needs no prefers-reduced-motion handling. Updates are throttled to one per
// frame with requestAnimationFrame. Inert on pages without the element (so it's
// safe to load anywhere, though by convention only case study pages include it).

(function () {
  "use strict";

  function init() {
    var bar = document.querySelector(".scroll-progress");
    if (!bar) return; // no element on this page → nothing to do

    var ticking = false;

    function update() {
      ticking = false;
      // Guard against divide-by-zero when the page can't scroll (content shorter
      // than the viewport): keep the bar at 0%.
      var scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      var percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = percent + "%";
    }

    // Throttle scroll/resize bursts to one DOM write per frame.
    function onChange() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    update(); // set the initial width on load
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
