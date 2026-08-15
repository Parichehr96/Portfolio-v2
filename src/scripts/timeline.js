/* About-section timeline — maps scroll progress onto the active milestone.
 *
 * MARKUP CONTRACT (see _includes/components/milestone-item.njk)
 *   #tl-runway            scroll runway, height = --tl-count × 60vh
 *   .tl-sticky            pinned 100vh viewport inside it
 *   .tl-year[data-index]  the rail buttons (role=tab)
 *   .tl-panel[data-index] the panels (role=tabpanel)
 *
 * The rail and the panels are driven by the same index, so they cannot disagree
 * about which year is showing.
 *
 * Reduced motion is handled entirely in CSS — _milestone-item.css unpins the
 * runway and shows every panel as a static list. This module bails out in that
 * case rather than fighting it.
 *
 * Zero dependencies.
 */
(function () {
  "use strict";

  var runway = document.getElementById("tl-runway");
  if (!runway) return; // homepage only

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var years = Array.prototype.slice.call(runway.querySelectorAll(".tl-year"));
  var panels = Array.prototype.slice.call(runway.querySelectorAll(".tl-panel"));
  var count = Math.min(years.length, panels.length);
  if (!count) return;

  var current = -1;

  function activate(i) {
    if (i === current) return;
    current = i;
    for (var n = 0; n < count; n++) {
      var on = n === i;
      years[n].classList.toggle("is-active", on);
      years[n].setAttribute("aria-selected", on ? "true" : "false");
      panels[n].classList.toggle("is-active", on);
    }
  }

  // Progress through the runway, 0 → 1, clamped. The sticky child is 100vh, so
  // the scrollable distance is the runway height minus one viewport — using the
  // full height would mean the last milestone never becomes active.
  function progress() {
    var rect = runway.getBoundingClientRect();
    var scrollable = runway.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(Math.max(-rect.top / scrollable, 0), 1);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      // Multiply by count (not count-1) and clamp, so every milestone gets an
      // equal slice of the runway instead of the last one getting a single px.
      var i = Math.min(Math.floor(progress() * count), count - 1);
      activate(i);
    });
  }

  // Clicking a year jumps to the scroll offset that would activate it, so the
  // rail stays a real control rather than a read-only indicator.
  years.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      var scrollable = runway.offsetHeight - window.innerHeight;
      var target = runway.offsetTop + (scrollable * (i + 0.5)) / count;
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  activate(0);
  onScroll();
})();
