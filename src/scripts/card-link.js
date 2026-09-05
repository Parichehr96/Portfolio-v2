/* STRETCHED CARD LINKS — the swipe guard, and nothing else.
 *
 * _work.css gives each My Work row's "Read more" anchor an ::after that covers
 * the whole row, so a click anywhere on the card follows that one link. The
 * pattern is pure CSS and works with this file absent; what it cannot express is
 * the difference between a TAP and a DRAG.
 *
 * WHY IT IS NEEDED AT ALL. A touch that scrolls the page is already suppressed
 * by the browser — no click is synthesised after a fling. The gap is the slow
 * drag: press, move 60px, release, without enough velocity or distance to count
 * as a scroll. That still fires a click, and with the overlay in place the click
 * lands on a link that sends you to a case study you never asked for. Ten pixels
 * of movement is the line between the two.
 *
 * CAPTURE PHASE, so the guard runs before the anchor's own default action and
 * before any delegated handler further down. preventDefault stops the
 * navigation; stopPropagation keeps analytics-events.js's outbound-click
 * listener from recording a click the reader did not make.
 *
 * KEYBOARD IS UNAFFECTED, and that falls out of the design rather than needing a
 * branch: Enter on a focused link fires a click with no pointerdown before it,
 * so `moved` is still false and the guard passes it straight through.
 *
 * Zero dependencies. Delegated from the document, so no per-card binding and
 * nothing to tear down.
 */
(function (window, document) {
  "use strict";

  if (!document.querySelector("[data-card-link]")) return; // not this page

  /* Ten CSS pixels. Below it a wobble is a tap; above it, a drag. The same
     number Android and iOS use for their own tap slop. */
  var THRESHOLD = 10;

  var tracking = false;
  var moved = false;
  var startX = 0;
  var startY = 0;

  function within(target) {
    return target && target.closest ? target.closest("[data-card-link]") : null;
  }

  /* The whole ROW is the hit area, so the press has to be tracked from anywhere
     inside the card — not only from the pill the anchor draws. */
  document.addEventListener(
    "pointerdown",
    function (e) {
      var card = e.target.closest && e.target.closest(".work-card");
      if (!card) return;
      tracking = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
    },
    true
  );

  document.addEventListener(
    "pointermove",
    function (e) {
      if (!tracking || moved) return;
      if (
        Math.abs(e.clientX - startX) > THRESHOLD ||
        Math.abs(e.clientY - startY) > THRESHOLD
      ) {
        moved = true;
      }
    },
    true
  );

  document.addEventListener(
    "pointerup",
    function () {
      tracking = false;
    },
    true
  );

  /* A pointer that leaves the window mid-drag never sends pointerup, and the
     stale `moved` would then swallow the NEXT tap. */
  document.addEventListener(
    "pointercancel",
    function () {
      tracking = false;
      moved = false;
    },
    true
  );

  document.addEventListener(
    "click",
    function (e) {
      if (!moved) return;
      moved = false;
      if (!within(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );
})(window, document);
