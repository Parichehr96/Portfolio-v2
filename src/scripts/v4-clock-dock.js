/* V4 homepage clock — index.njk, v4/top.njk, _top.css.
 *
 * The status clock is rendered at the bottom of the left panel
 * ([data-clock-dock]) and stays there as the page scrolls. Below 1200px
 * there is no left panel, so it moves into [data-clock-home], under the
 * intro, and back again if the window widens. The element itself moves, so
 * scripts/clock.js keeps driving it.
 */
(function () {
  "use strict";

  var dock = document.querySelector("[data-clock-dock]");
  var home = document.querySelector("[data-clock-home]");
  var status = dock && dock.querySelector(".v4-status");
  if (!home || !status) return;

  var wide = window.matchMedia("(min-width: 1200px)");

  function place() {
    var target = wide.matches ? dock : home;
    if (status.parentElement !== target) target.appendChild(status);
  }

  wide.addEventListener("change", place);
  place();
})();
