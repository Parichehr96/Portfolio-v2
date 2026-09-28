/* V4 toast — Figma 1126:30853.
 *
 * Shown on every load, in the page: the three columns start below it. It
 * leaves in one of two ways:
 *   - its timer band (the ::before in _toast.css) finishes filling, 10s in;
 *   - the × is pressed.
 * Either way it fades, then collapses so the columns glide up to where they
 * rest without it (--v4-content-top). The collapsed toast stays in the DOM as
 * an empty spacer and is made inert, so it can no longer take focus.
 * Hovering or focusing the toast pauses the timer (CSS).
 */
(function () {
  "use strict";

  var toast = document.querySelector("[data-toast]");
  if (!toast) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FADE = reduced ? 0 : 250;

  function dismiss() {
    if (toast.classList.contains("is-leaving")) return;
    toast.classList.add("is-leaving");
    setTimeout(function () {
      // Pin the current height so the collapse has a start value, then let
      // .is-collapsed take it to 0 on the next frame.
      toast.style.height = toast.offsetHeight + "px";
      void toast.offsetHeight;
      toast.style.height = "";
      toast.classList.add("is-collapsed");
      toast.setAttribute("aria-hidden", "true");
      toast.inert = true;
    }, FADE);
  }

  // The timer is a pseudo-element animation; its end still fires here.
  toast.addEventListener("animationend", function (event) {
    if (event.animationName === "v4-toast-timer") dismiss();
  });

  var close = toast.querySelector("[data-toast-close]");
  if (close) close.addEventListener("click", dismiss);
})();
