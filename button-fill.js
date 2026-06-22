/* Primary-button radial fill (.btn-primary).
 *
 * The cream-16% flood itself is a CSS ::before whose clip-path circle is centred
 * on --mx/--my and expands on :hover (0.5s ease-out) / retracts on leave (0.25s
 * ease-in) — all in styles.css. This module's only job is to set --mx/--my to
 * the cursor's ENTRY point on mouseenter and its EXIT point on mouseleave, so the
 * flood grows from, and shrinks back toward, the pointer.
 *
 * .selected buttons are skipped (already solid-filled). Coarse/touch pointers are
 * left alone — no hover, so nothing to track. */
(function () {
  "use strict";

  // Pointer-capable devices only; touch keeps the static button.
  if (!window.matchMedia || !window.matchMedia("(hover: hover)").matches) return;

  // Cursor position relative to the button's top-left, in px (robust vs.
  // event.offsetX, which is measured from whatever child is under the cursor).
  function setPoint(btn, event) {
    var rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", event.clientX - rect.left + "px");
    btn.style.setProperty("--my", event.clientY - rect.top + "px");
  }

  function init() {
    var buttons = document.querySelectorAll(".btn-primary");
    Array.prototype.forEach.call(buttons, function (btn) {
      // Entry point → fill expands from here (0.5s, CSS :hover).
      btn.addEventListener("mouseenter", function (event) {
        if (btn.classList.contains("selected")) return; // already filled
        setPoint(btn, event);
      });
      // Exit point → fill retracts toward here (0.25s, CSS base transition).
      btn.addEventListener("mouseleave", function (event) {
        if (btn.classList.contains("selected")) return;
        setPoint(btn, event);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
