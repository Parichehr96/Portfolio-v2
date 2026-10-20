/* V4 "My process" — v4/process.njk, _process.css.
 *
 * The four strings draw themselves, one at a time, when the drawing comes into
 * view: .is-ready hides them (so nothing is hidden without this script), then
 * .is-drawing traces each in turn. Once, per page view. Reduced motion: left
 * as drawn.
 */
(function () {
  "use strict";

  var flow = document.querySelector(".v4-flow");
  if (!flow || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  flow.classList.add("is-ready");
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    void flow.offsetWidth;                       // start from hidden
    flow.classList.add("is-drawing");
  }, { threshold: 0.4 });
  io.observe(flow);
})();
