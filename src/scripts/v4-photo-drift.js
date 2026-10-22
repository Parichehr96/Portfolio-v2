/* V5 photos — v4/photos.njk, _photos.css.
 *
 * THE DRIFT. --drift on the section runs 0 to 1 while it crosses the screen
 * (its top at the screen's bottom to its bottom at the screen's top); CSS
 * lifts each photo and the title by it, each at its own --speed.
 * Not for reduced motion.
 *
 * THE TURN. A tap (or click, or Enter) turns a photo over and back; hover
 * does it with a mouse, by CSS. One turned at a time.
 */
(function () {
  "use strict";

  var section = document.querySelector("[data-drift]");
  if (!section) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = section.getBoundingClientRect(), vh = window.innerHeight;
      var d = (vh - r.top) / (vh + r.height);
      section.style.setProperty("--drift", Math.max(0, Math.min(1, d)).toFixed(4));
    };
    var ask = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    update();
  }

  var cards = Array.prototype.slice.call(section.querySelectorAll(".v5-photo__card"));
  var via = "";   // a mouse turns them by hover alone; a click from it does nothing more
  cards.forEach(function (card) {
    card.addEventListener("pointerdown", function (e) { via = e.pointerType; });
    card.addEventListener("click", function () {
      var mouse = via === "mouse";
      via = "";
      if (mouse) return;
      var on = !card.classList.contains("is-turned");
      cards.forEach(function (c) { c.classList.remove("is-turned"); c.setAttribute("aria-pressed", "false"); });
      card.classList.toggle("is-turned", on);
      card.setAttribute("aria-pressed", on ? "true" : "false");
    });
  });
})();
