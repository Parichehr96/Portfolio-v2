/* SHARED POINTER DRAG — one implementation for every draggable thing in the
 * hero (folder cards now, the roaming tool icons next).
 *
 * WHY IT DOESN'T TOUCH `transform`. Each consumer composes its own: a card
 * blends the drag offset with its open/close tuck and two rotations, while a
 * roaming icon blends it with a physics position. If this module wrote
 * `el.style.transform` it would clobber whichever of those the consumer owns.
 * So it reports offsets through callbacks and the consumer decides what to do
 * with them. That split is the whole reason one module can serve both.
 *
 * NO LAYOUT THRASH. Every rect is read ONCE at pointerdown and cached. The move
 * handler does arithmetic only, and writes are coalesced into a single
 * requestAnimationFrame — so a fast drag produces one style write per frame, not
 * one per pointer event (which can fire several times per frame).
 *
 * Exposed as a global rather than an ES module because the site loads plain
 * `<script defer>` files with no bundler.
 */
(function (window, document) {
  "use strict";

  var DEFAULT_THRESHOLD = 4; // px before a press counts as a drag, not a click

  /* A FINGER IS NOT A MOUSE. 4px is the right number for a cursor, which sits
     exactly where it is put; a thumb resting on the glass wanders several px on
     its own, and a page scroll begins with a few px of unavoidable sideways
     drift. At 4px both of those read as a drag, so a card would jump the instant
     it was touched and again at the top of every scroll. Touch gets its own
     floor. It is a floor, not a replacement — a consumer that asked for a
     LARGER threshold still gets it. */
  var TOUCH_THRESHOLD = 9;

  /**
   * makeDraggable(el, options) → { destroy }
   *
   * options.bounds     () => DOMRect-like, the box the element must stay inside.
   *                    Called once per drag, at pointerdown.
   * options.threshold  px of movement before the drag starts (default 4;
   *                    touch never goes below 9, see TOUCH_THRESHOLD).
   * options.onStart    (ev)            → called when the threshold is crossed.
   * options.onMove     (dx, dy, ev)    → clamped offset from the drag origin.
   * options.onEnd      (dx, dy, vx, vy)→ final offset plus throw velocity px/s.
   * options.getOffset  () => {x, y}    → the element's CURRENT offset, so a
   *                    second drag continues from where the first ended rather
   *                    than snapping back to zero.
   */
  function makeDraggable(el, options) {
    var opts = options || {};
    var threshold = opts.threshold == null ? DEFAULT_THRESHOLD : opts.threshold;
    var touchThreshold = Math.max(threshold, TOUCH_THRESHOLD);

    var pointerId = null;
    var dragging = false;
    var isTouch = false;  // this gesture came from a finger
    var vetoed = false;   // ...and resolved to a page scroll, so hands off
    var startX = 0, startY = 0;   // pointer position at pointerdown
    var baseX = 0, baseY = 0;     // element offset at pointerdown
    var curX = 0, curY = 0;       // latest clamped offset
    var min = { x: 0, y: 0 }, max = { x: 0, y: 0 };
    var frame = 0;
    var pending = null;
    // Last few samples, for release velocity. Three is enough to smooth out a
    // single jittery final event without lagging behind a genuine flick.
    var samples = [];

    function clamp(v, lo, hi) {
      return v < lo ? lo : v > hi ? hi : v;
    }

    function onDown(ev) {
      if (pointerId !== null) return;          // already tracking a pointer
      if (ev.button != null && ev.button > 0) return; // primary button only

      pointerId = ev.pointerId;
      startX = ev.clientX;
      startY = ev.clientY;
      // Read once, here: pointermove carries pointerType too, but reading it at
      // the source keeps the whole gesture on one verdict. An engine that does
      // not report it is treated as a mouse, so the desktop path is what any
      // uncertainty falls back to.
      isTouch = ev.pointerType === "touch";
      vetoed = false;

      var off = opts.getOffset ? opts.getOffset() : { x: 0, y: 0 };
      baseX = off.x || 0;
      baseY = off.y || 0;
      curX = baseX;
      curY = baseY;

      // Read geometry ONCE. The element rect already accounts for any rotation
      // (getBoundingClientRect returns the axis-aligned box), so a tilted card
      // is contained correctly without any trigonometry here.
      var bounds = opts.bounds ? opts.bounds() : null;
      if (bounds) {
        var rect = el.getBoundingClientRect();
        min.x = baseX + (bounds.left - rect.left);
        max.x = baseX + (bounds.right - rect.right);
        min.y = baseY + (bounds.top - rect.top);
        max.y = baseY + (bounds.bottom - rect.bottom);
        // An element larger than its bounds would give min > max; pin it.
        if (min.x > max.x) min.x = max.x = baseX;
        if (min.y > max.y) min.y = max.y = baseY;
      } else {
        min.x = min.y = -Infinity;
        max.x = max.y = Infinity;
      }

      samples = [{ x: ev.clientX, y: ev.clientY, t: ev.timeStamp }];

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
    }

    function flush() {
      frame = 0;
      if (!pending) return;
      if (opts.onMove) opts.onMove(pending.x, pending.y, pending.ev);
      pending = null;
    }

    function onMove(ev) {
      if (ev.pointerId !== pointerId) return;

      var dx = ev.clientX - startX;
      var dy = ev.clientY - startY;

      if (!dragging) {
        // The verdict is final for the rest of the gesture. Without the latch a
        // thumb that had already committed to scrolling could wobble sideways
        // 200ms later and yank the card out from under the moving page.
        if (vetoed) return;

        var limit = isTouch ? touchThreshold : threshold;
        if (Math.abs(dx) < limit && Math.abs(dy) < limit) return;

        /* AXIS GATE, TOUCH ONLY. The first move past the threshold decides what
           the gesture IS, once: more sideways than vertical is a pull, anything
           else belongs to the page. Without it a diagonal swipe starts a real
           drag, the browser then claims the vertical pan and fires pointercancel
           (onUp handles it, and that path is deliberately unchanged), and the
           card is left snapping home mid-scroll — a flinch on every scroll that
           happens to begin on a card.

           A tie goes to the page. It is the recoverable half of the choice: a
           scroll that should have been a pull costs one more swipe, a pull that
           should have been a scroll costs the reader the rest of the page.

           MOUSE IS UNTOUCHED — no gate, no latch, 4px, any direction. A cursor
           has no competing gesture to disambiguate from. */
        if (isTouch && Math.abs(dx) <= Math.abs(dy)) {
          vetoed = true;
          return;
        }

        dragging = true;
        // Capture only once the gesture is genuinely a drag, so a plain click
        // still reaches whatever sits underneath.
        try { el.setPointerCapture(pointerId); } catch (e) {}
        if (opts.onStart) opts.onStart(ev);
      }

      curX = clamp(baseX + dx, min.x, max.x);
      curY = clamp(baseY + dy, min.y, max.y);

      samples.push({ x: ev.clientX, y: ev.clientY, t: ev.timeStamp });
      if (samples.length > 3) samples.shift();

      pending = { x: curX, y: curY, ev: ev };
      if (!frame) frame = window.requestAnimationFrame(flush);
    }

    function onUp(ev) {
      if (ev.pointerId !== pointerId) return;

      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      try { el.releasePointerCapture(pointerId); } catch (e) {}
      pointerId = null;

      if (frame) { window.cancelAnimationFrame(frame); flush(); }

      if (!dragging) return; // was a click, not a drag — leave it to onclick
      dragging = false;

      // Release velocity in px/s from the oldest retained sample. Guard the
      // time delta: two events in the same millisecond would divide by zero.
      var vx = 0, vy = 0;
      if (samples.length > 1) {
        var a = samples[0], b = samples[samples.length - 1];
        var dt = (b.t - a.t) / 1000;
        if (dt > 0.001) { vx = (b.x - a.x) / dt; vy = (b.y - a.y) / dt; }
      }
      if (opts.onEnd) opts.onEnd(curX, curY, vx, vy);
    }

    // Images and text inside a draggable element trigger the browser's own
    // drag-and-drop, which swallows the pointer stream mid-gesture.
    function onDragStart(ev) { ev.preventDefault(); }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("dragstart", onDragStart);

    return {
      isDragging: function () { return dragging; },
      destroy: function () {
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("dragstart", onDragStart);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        if (frame) window.cancelAnimationFrame(frame);
      },
    };
  }

  window.HeroDrag = { makeDraggable: makeDraggable };
})(window, document);
