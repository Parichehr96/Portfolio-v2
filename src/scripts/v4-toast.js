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
 *
 * It also notes a hard refresh as its keys are pressed (the page cannot tell
 * one from a normal refresh afterwards), so the check in v4/toast.njk shows
 * the toast again on the reload that follows.
 */
(function () {
  "use strict";

  var toast = document.querySelector("[data-toast]");
  if (!toast) return;

  document.addEventListener("keydown", function (e) {
    var key = (e.key || "").toLowerCase();
    var hard =
      (key === "r" && e.shiftKey && (e.metaKey || e.ctrlKey)) ||
      (key === "f5" && (e.ctrlKey || e.shiftKey));
    if (!hard) return;
    try { sessionStorage.setItem("v4-hard-reload", "1"); } catch (err) {}
  });

  if (document.documentElement.classList.contains("is-toast-skipped")) return;

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

  // THE FUSE: the arc starts full at 0%; the spark burns it back as the
  // number counts up to the progress value, over 2s. The spark keeps sparking.
  var ring = toast.querySelector("[data-toast-ring]");
  if (ring) {
    var arc = ring.querySelector("circle");
    var spark = ring.querySelector("[data-toast-spark]");
    var value = ring.querySelector("[data-toast-value]");
    var end = Math.max(0, Math.min(100, +ring.dataset.progress || 0));
    var R = 19.17, BURN = 2000, DELAY = 400;

    var draw = function (p) {               // p: percent done, 0..100
      var left = 100 - p, a = (left / 100) * 2 * Math.PI;
      arc.style.setProperty("--left", left);
      // The tip, anticlockwise from 12; the rays trail back along the burnt part.
      var x = 20 - R * Math.sin(a), y = 20 - R * Math.cos(a);
      var rot = Math.atan2(Math.sin(a), -Math.cos(a)) * 180 / Math.PI + 45;
      spark.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) rotate(" + rot.toFixed(1) + "deg)";
      value.textContent = Math.round(p) + "%";
    };

    if (reduced) draw(end);
    else {
      draw(0);
      var start = null;
      var tick = function (now) {
        if (start === null) start = now + DELAY;
        var u = Math.max(0, Math.min(1, (now - start) / BURN));
        draw(end * (1 - Math.pow(1 - u, 2)));  // eases into its stop
        if (u < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  var close = toast.querySelector("[data-toast-close]");
  if (close) close.addEventListener("click", dismiss);
})();
