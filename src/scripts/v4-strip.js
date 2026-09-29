/* V4 project strips — v4/project-row.njk, _work.css.
 *
 * The strips are ordinary horizontal scroll containers: trackpads and touch
 * screens scroll them natively. A mouse has no sideways scroll of its own, so
 * this adds click-and-drag. Nothing moves on its own.
 */
(function () {
  "use strict";

  var strips = Array.prototype.slice.call(document.querySelectorAll("[data-strip]"));

  strips.forEach(function (strip) {
    var dragging = false;
    var startX = 0;
    var startLeft = 0;

    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startLeft = strip.scrollLeft;
      strip.classList.add("is-dragging");
      try { strip.setPointerCapture(e.pointerId); } catch (err) {}
    });

    strip.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      strip.scrollLeft = startLeft - (e.clientX - startX);
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove("is-dragging");
      try { strip.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    strip.addEventListener("pointerup", endDrag);
    strip.addEventListener("pointercancel", endDrag);
  });
})();
