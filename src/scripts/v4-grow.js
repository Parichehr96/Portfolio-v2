/* V5 growing panels and the menu over dark sections.
 *
 * GROW (v4/folders.njk, _folders.css). --p on each [data-grow] section goes
 * 0 to 1 as its top travels from the screen's bottom to its top; CSS grows
 * the panel to the full screen by it. --k is the screen's share of the
 * comp's 1512, for what is drawn in px; --kp
 * what fits the wider folder on a phone. Reduced motion: grown from the start.
 *
 * DARK (_rail.css). Each menu item, and the clock, turns light (.is-on-dark)
 * while a dark surface ([data-dark]) is drawn right under it: item by item,
 * so a panel growing past them lights each in turn.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var grows = Array.prototype.slice.call(document.querySelectorAll("[data-grow]"));
  // What turns light over a dark surface: each menu item, and the clock.
  var marks = Array.prototype.slice.call(document.querySelectorAll(".v4-rail__item, .v5-clock-track .v4-aside"));
  var pinned = ".v4-rail-track, .v4-aside-track";

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
    // What lies under each one, itself aside: a dark surface ([data-dark],
    // as drawn: a growing panel's clipped-off part does not count)?
    marks.forEach(function (m) {
      var r = m.getBoundingClientRect();
      var x = m.matches(".v4-aside") ? r.right - 50 : r.left + 10, y = r.top + Math.min(r.height / 2, 50);
      var under = document.elementsFromPoint(x, y).filter(function (e) { return !e.closest(pinned); })[0];
      m.classList.toggle("is-on-dark", !!(under && under.closest("[data-dark]")));
    });
  }

  var ticking = false;
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", ask, { passive: true });
  window.addEventListener("resize", ask);
  update();
})();
