/* Radial fill hover — shared, cursor-tracked fill animation.
 *
 * Initialises every .radial-fill-hover element that has a direct child
 * .radial-fill. On mouseenter the fill grows from the cursor entry point
 * (0.5s ease-out); on mouseleave it shrinks back to the exit point (0.25s
 * ease-in). The fill colour, resting state and rounded corners all come from
 * CSS (.radial-fill), so the same logic drives any component that opts in —
 * this is the single shared implementation, not a per-component copy.
 *
 * prefers-reduced-motion: this module no-ops; CSS reveals the fill instantly.
 *
 * NOTE: the Primary Button's flood is a separate, centred CSS-only effect
 * (.btn-primary::before) and is intentionally left untouched. */
(function () {
  "use strict";

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return; // CSS handles the instant fallback
  }

  var EXPAND = "clip-path 0.5s ease-out, -webkit-clip-path 0.5s ease-out";
  var COLLAPSE = "clip-path 0.25s ease-in, -webkit-clip-path 0.25s ease-in";

  // Cursor position as a percentage of the host element's box.
  function pointPct(event, host) {
    var rect = host.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }

  function setClip(fill, transition, radius, point) {
    var value = "circle(" + radius + " at " + point.x + "% " + point.y + "%)";
    fill.style.transition = transition;
    fill.style.clipPath = value;
    fill.style.webkitClipPath = value;
  }

  function init() {
    var hosts = document.querySelectorAll(".radial-fill-hover");
    Array.prototype.forEach.call(hosts, function (host) {
      var fill = host.querySelector(":scope > .radial-fill");
      if (!fill) return;

      host.addEventListener("mouseenter", function (event) {
        // 150% guarantees full coverage from any corner (need ~141%).
        setClip(fill, EXPAND, "150%", pointPct(event, host));
      });

      host.addEventListener("mouseleave", function (event) {
        setClip(fill, COLLAPSE, "0%", pointPct(event, host));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
