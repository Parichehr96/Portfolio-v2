/* IDLE TOOL ICONS — the four brand marks drift gently around their Figma
 * resting points and can still be picked up and thrown.
 *
 * WIGGLE, NOT ROAM. This replaces an autonomous random-walk with keep-out
 * fields that let the marks travel most of the board. That version had to fight
 * itself: an icon free to wander also has to be told where it may not go, so
 * the board's centre needed an elliptical repulsion field, the edges needed a
 * cushion, and the composition still drifted away from the comp within seconds.
 * Bounding the motion to a small circle around each icon's own resting point
 * deletes all of that. The layout is always the comp's layout; the motion is
 * texture on top of it, not transport.
 *
 * THE PATH IS TWO WAVES PER AXIS, not one. A single sine on x and y traces a
 * straight line (matched frequencies) or a clean ellipse (unmatched) — both
 * read as machinery. Summing a second, slower wave at an irrational-ish ratio
 * gives a path that never quite closes, which is what reads as idle drift
 * rather than an orbit. Each icon gets its own period and its own phase offsets
 * so the four are never in step; with one shared clock and no per-icon
 * randomness, that de-synchronisation is deterministic rather than luck.
 *
 * THE 20px RADIUS IS A GUARANTEE, not an average. The two summed waves can line
 * up, so the vector is clamped to --wiggle-radius before it is written. Nothing
 * downstream has to trust the maths.
 *
 * DRAG IS UNCHANGED and still owned by HeroDrag: straighten to 0deg on grab,
 * gentle return home on release. While held, the wiggle is skipped entirely;
 * on release the icon eases from wherever it was dropped back onto its orbit,
 * so the hand-off has no visible jump.
 *
 * REDUCED MOTION: no loop is ever started. Icons sit exactly on their Figma
 * points and dragging still works — dragging is a direct response to input, not
 * motion the page decided to play.
 *
 * Only [data-hero-icon] is bound. The static decoration in the same board
 * (arrow, cursor mark, the two product mockups) carries no such attribute, so
 * it can neither wiggle nor be dragged.
 */
(function (window, document) {
  "use strict";

  var board = document.querySelector(".hero__board");
  if (!board) return;

  var icons = Array.prototype.slice.call(board.querySelectorAll("[data-hero-icon]"));
  if (!icons.length) return;

  // Tuning lives in tokens.css so it sits with the rest of the motion scale.
  function num(name, fallback) {
    var v = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(name)
    );
    return isNaN(v) ? fallback : v;
  }
  var RADIUS = num("--wiggle-radius", 20);
  var PERIOD = num("--wiggle-period", 7);

  var BOB_DEG = 2; // amplitude of the idle tilt
  var RETURN_MS = 420; // release -> back on orbit

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Per-icon wiggle constants.
   *
   * The multipliers are deliberately not round ratios of each other. Whole-
   * number ratios (2:1, 3:2) close the path into a repeating Lissajous figure
   * that the eye locks onto after a few seconds; these do not resolve, so the
   * drift stays unpredictable without being random. */
  var items = icons.map(function (el, i) {
    var n = icons.length;
    return {
      el: el,
      // Each icon runs 0.8x-1.4x the base period, so no two ever line up.
      speed: 1 / (PERIOD * (0.8 + 0.2 * i)),
      // Quarter-turn offsets: the four start at different points on their path.
      phase: (Math.PI * 2 * i) / n,
      // The secondary wave is slower and offset again per icon.
      speed2: 1 / (PERIOD * (1.7 + 0.3 * i)),
      phase2: (Math.PI * 2 * ((i * 3) % n)) / n + 0.7,
      held: false,
      // Offset carried out of a drag, eased back to zero so the icon rejoins
      // its orbit instead of snapping.
      restX: 0,
      restY: 0,
      restAt: 0,
    };
  });

  function write(it, x, y, rot) {
    var s = it.el.style;
    s.setProperty("--wiggle-x", x.toFixed(2) + "px");
    s.setProperty("--wiggle-y", y.toFixed(2) + "px");
    if (rot !== undefined) s.setProperty("--wiggle-rot", rot.toFixed(2) + "deg");
  }

  // ---- Drag -----------------------------------------------------------------
  // Unchanged from the roaming version: same handle, same straighten-and-return.
  var drag = window.HeroDrag;
  if (drag) {
    items.forEach(function (it) {
      drag.makeDraggable(it.el, {
        bounds: function () {
          return board.getBoundingClientRect();
        },
        getOffset: function () {
          return { x: it.restX, y: it.restY };
        },
        onStart: function () {
          it.held = true; // the loop skips it; the lift eases via CSS
          it.el.classList.add("is-dragging");
        },
        onMove: function (dx, dy) {
          it.restX = dx;
          it.restY = dy;
          write(it, dx, dy);
        },
        onEnd: function (dx, dy) {
          // Hand back to the loop from exactly where it was dropped. The
          // release VELOCITY is deliberately discarded: a thrown icon that kept
          // its momentum would sail away from a resting point it is supposed to
          // stay within 20px of. It eases home instead.
          it.restX = dx;
          it.restY = dy;
          it.restAt = now();
          it.held = false;
          it.el.classList.remove("is-dragging");
        },
      });
    });
  }

  // Reduced motion stops here: icons rest on their Figma points, still
  // draggable, with no loop ever created.
  if (reduce) return;

  // ---- Loop -----------------------------------------------------------------
  function now() {
    return window.performance && window.performance.now
      ? window.performance.now()
      : Date.now();
  }

  var frame = 0;
  var start0 = now();

  function step() {
    frame = window.requestAnimationFrame(step);
    var t = (now() - start0) / 1000;

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.held) continue;

      var a = t * it.speed * Math.PI * 2 + it.phase;
      var b = t * it.speed2 * Math.PI * 2 + it.phase2;

      // Two waves per axis, with x and y reading them in opposite order so the
      // path is not a diagonal line.
      var x = Math.sin(a) * 0.68 + Math.cos(b) * 0.32;
      var y = Math.cos(a) * 0.62 + Math.sin(b) * 0.38;

      x *= RADIUS;
      y *= RADIUS;

      // The guarantee: however the two waves stack, the offset never leaves the
      // circle. Scaling both components preserves the direction.
      var d = Math.hypot(x, y);
      if (d > RADIUS) {
        x *= RADIUS / d;
        y *= RADIUS / d;
      }

      // Ease any leftover drag offset back to zero, so the icon rejoins its
      // orbit rather than jumping onto it the frame the pointer lifts.
      if (it.restX || it.restY) {
        var k = (now() - it.restAt) / RETURN_MS;
        if (k >= 1) {
          it.restX = it.restY = 0;
        } else {
          // easeOutCubic — quick to leave the drop point, slow to settle.
          var e = 1 - Math.pow(1 - k, 3);
          x += it.restX * (1 - e);
          y += it.restY * (1 - e);
        }
      }

      write(it, x, y, Math.sin(a) * BOB_DEG);
    }
  }

  function startLoop() {
    if (frame) return;
    frame = window.requestAnimationFrame(step);
  }
  function stopLoop() {
    if (!frame) return;
    window.cancelAnimationFrame(frame);
    frame = 0;
  }

  if ("IntersectionObserver" in window) {
    new window.IntersectionObserver(function (entries) {
      if (entries[entries.length - 1].isIntersecting) startLoop();
      else stopLoop();
    }).observe(board);
  } else {
    startLoop();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopLoop();
    else if (board.getBoundingClientRect().bottom > 0) startLoop();
  });
})(window, document);
