/* Testimonial scroll row — home page only (Figma "Methodology Steps" 6:25814).
 *
 * The track is a plain CSS scroll-snap row, so wheel, trackpad, touch and the
 * keyboard already work with no JS. This only adds the two arrow buttons and
 * keeps their enabled/disabled state in sync with the scroll position.
 *
 * Zero dependencies.
 */
(function () {
  "use strict";

  var track = document.getElementById("testi-track");
  if (!track) return; // only present on index.html

  var prev = document.querySelector(".testi-arrow--prev");
  var next = document.querySelector(".testi-arrow--next");
  if (!prev || !next) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // One card plus one gap, measured live so it survives any CSS change.
  function step() {
    var card = track.querySelector(".testi-card");
    if (!card) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function nudge(dir) {
    // Explicit behavior overrides the track's CSS scroll-behavior: smooth.
    track.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
  }
  prev.addEventListener("click", function () {
    nudge(-1);
  });
  next.addEventListener("click", function () {
    nudge(1);
  });

  function sync() {
    var max = track.scrollWidth - track.clientWidth;
    // Nothing overflows (a wide enough viewport) — no arrows to show at all.
    var fits = max <= 1;
    prev.hidden = fits;
    next.hidden = fits;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  }

  var queued = false;
  function syncSoon() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      sync();
    });
  }

  sync();
  track.addEventListener("scroll", syncSoon, { passive: true });
  window.addEventListener("resize", syncSoon);
  // Card widths depend on the webfont for their text, not their box, so a load
  // reflow can still change scrollWidth — re-check once everything settles.
  window.addEventListener("load", sync);
})();
