/* V5 growing panels and the menu over dark sections.
 *
 * GROW (v4/folders.njk, _folders.css). --p on each [data-grow] section goes
 * 0 to 1 as its top travels from the screen's bottom to its top; CSS grows
 * the panel to the full screen by it. --k is the screen's share of the
 * comp's 1512, for what is drawn in px; --kp
 * what fits the wider folder on a phone. Reduced motion: grown from the start.
 *
 * DARK (_rail.css). While a [data-theme=dark] section's background lies under
 * the menu and clock (for the projects, once grown nearly to the edges), the
 * page gets .v5-on-dark and they turn light.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var grows = Array.prototype.slice.call(document.querySelectorAll("[data-grow]"));
  var darks = Array.prototype.slice.call(document.querySelectorAll("[data-theme=dark]"));
  var root = document.documentElement;
  var LINE = 100;   // px from the top: the line the menu and clock sit on

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var k = Math.min(1, window.innerWidth / 1512);
    var kp = Math.min(1, (window.innerWidth - 32) / 385);   // phones: the wider folder (Services, 384.7) fits
    grows.forEach(function (s) {
      var p = reduce ? 1 : 1 - s.getBoundingClientRect().top / vh;
      s.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(4));
      s.style.setProperty("--k", k.toFixed(4));
      s.style.setProperty("--kp", kp.toFixed(4));
    });
    var dark = darks.some(function (s) {
      var r = (s.firstElementChild || s).getBoundingClientRect();   // its stage, where it sticks
      var p = parseFloat(s.style.getPropertyValue("--p"));
      return r.top <= LINE && r.bottom >= LINE && (isNaN(p) || p > 0.96);
    });
    root.classList.toggle("v5-on-dark", dark);
  }

  var ticking = false;
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", ask, { passive: true });
  window.addEventListener("resize", ask);
  update();
})();
