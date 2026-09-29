/* V4 homepage clock — index.njk, v4/top.njk, _top.css.
 *
 * The status clock is rendered at the bottom of the left panel
 * ([data-clock-dock]). From the About section on, for balance, it crosses to
 * the top of the right panel ([data-clock-home], where it first sat), and
 * comes back when the visitor scrolls up above About. The crossing is a
 * quick fade out, move, fade in.
 *
 * Below 1200px there is no left panel, so it simply lives in
 * [data-clock-home], under the intro. The element itself moves, so
 * scripts/clock.js keeps driving it.
 */
(function () {
  "use strict";

  var dock = document.querySelector("[data-clock-dock]");
  var home = document.querySelector("[data-clock-home]");
  var status = dock && dock.querySelector(".v4-status");
  var about = document.getElementById("about");
  if (!home || !status) return;

  var wide = window.matchMedia("(min-width: 1200px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var FADE = 200; // ms, matches .v4-status.is-moving in _top.css
  var timer = null;

  // About counts as reached once its top passes the middle of the screen.
  function pastAbout() {
    return !!about && about.getBoundingClientRect().top <= window.innerHeight / 2;
  }

  function target() {
    return !wide.matches || pastAbout() ? home : dock;
  }

  function place(animate) {
    if (status.parentElement === target() || timer) return;
    if (!animate || reduce.matches) {
      target().appendChild(status);
      return;
    }
    status.classList.add("is-moving");
    timer = setTimeout(function () {
      timer = null;
      target().appendChild(status);
      // Lay it out in the new spot first, so the fade-in runs there.
      void status.offsetWidth;
      status.classList.remove("is-moving");
    }, FADE);
  }

  // One rect read per scroll event; nothing moves unless the side changes.
  window.addEventListener("scroll", function () { place(true); }, { passive: true });

  wide.addEventListener("change", function () { place(false); });
  place(false);
})();
