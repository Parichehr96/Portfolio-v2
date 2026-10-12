/* V4 project strips — v4/project-row.njk, _work.css.
 *
 * The strips are ordinary horizontal scroll containers: trackpads and touch
 * screens scroll them natively. A mouse has no sideways scroll of its own, so
 * this adds click-and-drag. Nothing moves on its own.
 *
 * THE WHOLE CARD IS A LINK. A click anywhere on a linked project (name,
 * text or strip; article[data-card-href]) opens its case study, Cmd/Ctrl or
 * middle click in a new tab. Not when the click ends a drag of the strip,
 * nor when it ends a text selection, and links inside keep their own.
 */
(function () {
  "use strict";

  var strips = Array.prototype.slice.call(document.querySelectorAll("[data-strip]"));

  strips.forEach(function (strip) {
    var dragging = false;
    var startX = 0;
    var startLeft = 0;
    var moved = 0;

    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startLeft = strip.scrollLeft;
      strip.classList.add("is-dragging");
      try { strip.setPointerCapture(e.pointerId); } catch (err) {}
    });

    strip.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      moved = Math.max(moved, Math.abs(e.clientX - startX));
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
    // A drag is not a click: swallow the click that ends one.
    strip.addEventListener("click", function (e) {
      if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0; }
    }, true);
  });

  Array.prototype.slice.call(document.querySelectorAll("[data-card-href]")).forEach(function (card) {
    var href = card.getAttribute("data-card-href");
    function open(e) {
      if (e.target.closest("a")) return;                          // its own link handles it
      var sel = window.getSelection && String(window.getSelection());
      if (sel) return;                                             // they were selecting text
      if (e.metaKey || e.ctrlKey || e.button === 1) window.open(href, "_blank", "noopener");
      else window.location.href = href;
    }
    card.addEventListener("click", open);
    card.addEventListener("auxclick", function (e) { if (e.button === 1) open(e); });
  });
})();
