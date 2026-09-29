/* V4 case study reading progress — the "23%" pill beside the project name
 * (Figma 918:34297).
 *
 * How far through the article the reader is: 0% with its top at the top of
 * the viewport, 100% once its end has scrolled into view. Updated once per
 * frame at most while scrolling.
 */
(function () {
  "use strict";

  var pill = document.querySelector("[data-read-progress]");
  var article = document.querySelector("[data-read-article]");
  if (!pill || !article) return;

  var queued = false;

  function update() {
    queued = false;
    var rect = article.getBoundingClientRect();
    var travel = rect.height - window.innerHeight;
    var done = travel > 0 ? -rect.top / travel : 1;
    var pct = Math.round(Math.min(1, Math.max(0, done)) * 100);
    pill.textContent = pct + "%";
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
})();
