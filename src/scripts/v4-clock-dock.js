/* V4 homepage clock dock — v4/top.njk, index.njk, _top.css.
 *
 * The status clock sits top-right, level with the intro, until the work
 * section ("Selected project") has scrolled up to the top of the viewport,
 * level with the rail's top (the 40px edge). From there on it sits at the
 * bottom of the left panel ([data-clock-dock]), and it goes back top-right
 * when the visitor scrolls above that point again.
 * The element itself moves, so scripts/clock.js keeps driving it.
 *
 * Only where there is a left panel (1200px and up); narrower, the clock stays
 * in the flow under the intro.
 */
(function () {
  "use strict";

  var dock = document.querySelector("[data-clock-dock]");
  var status = document.querySelector(".v4-aside .v4-status");
  if (!dock || !status) return;

  var home = status.parentElement;
  var work = document.getElementById("work");
  var edge = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--v4-edge")) || 40;
  var wide = window.matchMedia("(min-width: 1200px)");
  var queued = false;

  function place() {
    queued = false;
    var reached = work ? work.getBoundingClientRect().top <= edge : window.scrollY > 0;
    var target = wide.matches && reached ? dock : home;
    if (status.parentElement === target) return;
    target.appendChild(status);
    status.classList.remove("is-arriving");
    void status.offsetWidth; // restart the fade-in
    status.classList.add("is-arriving");
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(place);
  }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  wide.addEventListener("change", place);
  place();
})();
