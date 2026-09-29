/* V4 homepage clock dock — v4/top.njk, index.njk, _top.css.
 *
 * At the very top of the page the status clock sits top-right, level with the
 * intro. As soon as the visitor scrolls it moves to the bottom of the left
 * panel ([data-clock-dock]), and it goes back when they return to the top.
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
  var wide = window.matchMedia("(min-width: 1200px)");
  var queued = false;

  function place() {
    queued = false;
    var target = wide.matches && window.scrollY > 0 ? dock : home;
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
  wide.addEventListener("change", place);
  place();
})();
