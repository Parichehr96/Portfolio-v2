/* V4 project strips — v4/project-row.njk, _work.css.
 *
 * Each strip drifts slowly left to right, forever, and stops to be scrolled by
 * hand while the pointer is over it (or it has focus, or a finger is on it).
 *
 * THE DRIFT MOVES THE REAL SCROLL POSITION, not a transform, so the strip the
 * visitor scrolls and the strip that drifts are the same thing: when the drift
 * picks up again it continues from wherever they left it.
 *
 * THE LOOP. The track holds the panels twice, so its two halves are identical
 * and `set` (half the track) is one full set. Keeping scrollLeft within
 * (0, set] by adding or subtracting `set` therefore never shows a jump, for
 * the drift and for hand scrolling alike: there is no end in either direction.
 * The range excludes 0 on purpose: at 0 a browser will not scroll any further
 * left, so reaching it hops to `set`, the identical frame, with room to go.
 *
 * Speed comes from --v4-strip-pace in tokens.css (time for one panel to pass).
 * Reduced motion: no drift; the strip is still scrollable and still endless.
 * Strips off screen do not run.
 */
(function () {
  "use strict";

  var strips = Array.prototype.slice.call(document.querySelectorAll("[data-strip]"));
  if (!strips.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  strips.forEach(function (strip) {
    var track = strip.firstElementChild;
    var panels = track ? track.children.length / 2 : 0;
    if (!panels) return;

    var set = 0;          // width of one set of panels, px
    var speed = 0;        // px per second, left to right
    var pos = 0;          // our own float copy of scrollLeft
    var hovered = false;
    var focused = false;
    var touching = false;
    var dragging = false;
    var visible = false;
    var last = 0;
    var writing = false;  // true while we set scrollLeft ourselves

    function measure() {
      set = track.scrollWidth / 2;
      var pace = parseFloat(getComputedStyle(strip).getPropertyValue("--v4-strip-pace")) || 45;
      speed = (set / panels) / pace;
    }

    function wrap(x) {
      if (set <= 0) return x;
      while (x <= 0) x += set;
      while (x > set) x -= set;
      return x;
    }

    function write(x) {
      pos = wrap(x);
      writing = true;
      strip.scrollLeft = pos;
      writing = false;
    }

    function paused() {
      return reduced || hovered || focused || touching || dragging || !visible;
    }

    function frame(now) {
      var dt = last ? (now - last) / 1000 : 0;
      last = now;
      // Left to right: the content moves right, so the scroll position falls.
      if (!paused() && dt < 0.25) write(pos - speed * dt);
      requestAnimationFrame(frame);
    }

    // Hand scrolling (trackpad, touch, keyboard): adopt the position and keep
    // it inside the loop so it never runs out.
    // Scroll events for our own writes arrive after the fact, and browsers may
    // round scrollLeft, so anything within 2px of `pos` is taken as ours;
    // adopting the rounded value would stall a drift of a fraction of a pixel
    // per frame.
    strip.addEventListener("scroll", function () {
      if (writing) return;
      var x = strip.scrollLeft;
      if (Math.abs(x - pos) < 2) return;
      if (x < 1 || x > set) write(x);
      else pos = x;
    }, { passive: true });

    strip.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hovered = true; });
    strip.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hovered = false; });
    strip.addEventListener("focusin", function () { focused = true; });
    strip.addEventListener("focusout", function () { focused = false; });
    strip.addEventListener("touchstart", function () { touching = true; }, { passive: true });
    strip.addEventListener("touchend", function () { setTimeout(function () { touching = false; }, 1200); }, { passive: true });

    // Mouse drag: a mouse has no sideways scroll of its own.
    var startX = 0;
    var startPos = 0;
    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startPos = pos;
      strip.classList.add("is-dragging");
      try { strip.setPointerCapture(e.pointerId); } catch (err) {}
    });
    strip.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      write(startPos - (e.clientX - startX));
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove("is-dragging");
      try { strip.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    strip.addEventListener("pointerup", endDrag);
    strip.addEventListener("pointercancel", endDrag);

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(strip);

    window.addEventListener("resize", function () {
      var ratio = set ? pos / set : 1;
      measure();
      write(ratio * set);
    });

    measure();
    // Start one set in, which shows the first panel at the left edge: the
    // same frame as 0, with room to drift rightwards straight away.
    write(set);
    requestAnimationFrame(frame);
  });
})();
