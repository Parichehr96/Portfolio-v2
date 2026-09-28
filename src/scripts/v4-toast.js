/* V4 toast — Figma 1126:30853.
 *
 * Shown on every load. It leaves in one of two ways:
 *   - its timer band (the ::before in _toast.css) finishes filling, 10s in;
 *   - the × is pressed.
 * Either way it fades out, then is hidden so it no longer takes focus.
 * Hovering or focusing the toast pauses the timer (CSS), so it never
 * disappears while someone is reading it or reaching for the ×.
 */
(function () {
  "use strict";

  var toast = document.querySelector("[data-toast]");
  if (!toast) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function dismiss() {
    if (toast.hidden || toast.classList.contains("is-leaving")) return;
    toast.classList.add("is-leaving");
    // Hide once the fade is done; straight away if motion is reduced.
    setTimeout(function () { toast.hidden = true; }, reduced ? 0 : 300);
  }

  // The timer is a pseudo-element animation; its end still fires here.
  toast.addEventListener("animationend", function (event) {
    if (event.animationName === "v4-toast-timer") dismiss();
  });

  var close = toast.querySelector("[data-toast-close]");
  if (close) close.addEventListener("click", dismiss);
})();
