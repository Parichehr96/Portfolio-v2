/* ROAMING TOOL ICONS — the four brand marks drift around the hero board and can
 * be picked up and thrown.
 *
 * VELOCITY MODEL: a damped random walk, not per-frame randomness. Each frame
 * adds a small random ACCELERATION and then clamps the resulting speed into an
 * ambient band. Randomising velocity directly reads as jitter; accumulating
 * acceleration curves the path smoothly, which is the whole difference between
 * "ambient" and "busy".
 *
 * EDGES ARE A CUSHION, NOT A WALL. Flipping the velocity sign at the boundary
 * gives a hard billiard bounce. Instead a margin band applies an inward force
 * proportional to how far in the icon has pushed, so it decelerates and curves
 * away. Position is hard-clamped afterwards purely as a backstop, so a hard
 * throw can never outrun the cushion and escape.
 *
 * ONE LOOP FOR ALL FOUR, paused by IntersectionObserver when the hero scrolls
 * away and by visibilitychange when the tab is hidden. The timestamp is reset
 * on resume — without that, `dt` would integrate the entire paused span on the
 * first frame back and teleport every icon across the board.
 *
 * TRANSFORMS ONLY, and via the INDIVIDUAL translate/rotate/scale properties
 * rather than one `transform`. That separation is load-bearing: `translate` is
 * rewritten every frame and must never transition, while `scale` and `rotate`
 * need to ease when an icon is picked up. Packing them into a single
 * `transform` would force one transition setting on all three, and the grab
 * lift would fight the roam loop for the same property.
 *
 * REDUCED MOTION: no loop is started at all. Icons sit at their Figma
 * positions, and dragging still works — dragging is a direct response to input,
 * not motion the page decided to play.
 */
(function (window, document) {
  "use strict";

  var board = document.querySelector(".hero__board");
  if (!board) return;

  var icons = Array.prototype.slice.call(board.querySelectorAll(".hero__icon"));
  if (!icons.length) return;

  // Tuning lives in tokens.css so it sits with the rest of the motion scale.
  function num(name, fallback) {
    var v = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(name)
    );
    return isNaN(v) ? fallback : v;
  }
  var SPEED_MIN = num("--roam-speed-min", 10);
  var SPEED_MAX = num("--roam-speed-max", 30);
  var JITTER = num("--roam-jitter", 40);
  var EDGE_MARGIN = num("--roam-edge-margin", 48);
  var EDGE_FORCE = num("--roam-edge-force", 1.5);
  var KEEP_X = num("--roam-keepout-x", 0.26);
  var KEEP_Y = num("--roam-keepout-y", 0.45);
  var KEEP_FORCE = num("--roam-keepout-force", 500);
  var KEEP_FALLOFF = num("--roam-keepout-falloff", 0.5);

  var BOB_DEG = 2; // amplitude of the idle tilt
  var BOB_RATE = 0.4; // rad/s -> a ~16s cycle
  var THROW_MAX = SPEED_MAX * 4; // a flick still settles quickly under damping

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Per-icon state -------------------------------------------------------
  var items = icons.map(function (el, i) {
    var dir = Math.PI * 2 * (i / icons.length); // spread starting headings
    var speed = SPEED_MIN + (SPEED_MAX - SPEED_MIN) * 0.5;
    return {
      el: el,
      x: 0,
      y: 0,
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      phase: dir, // so the four never bob in unison
      held: false,
      min: { x: 0, y: 0 },
      max: { x: 0, y: 0 },
    };
  });

  // Bounds are measured, never assumed: each icon's allowed OFFSET range is
  // whatever keeps its box inside the board from where CSS already placed it.
  // Read once here and on resize — never inside the loop.
  var boardW = 0;
  var boardH = 0;

  function measure() {
    var b = board.getBoundingClientRect();
    boardW = b.width;
    boardH = b.height;
    items.forEach(function (it) {
      var r = it.el.getBoundingClientRect();
      // Subtract the current offset to recover the CSS-placed position.
      var left = r.left - it.x;
      var top = r.top - it.y;
      it.min.x = b.left - left;
      it.max.x = b.right - (left + r.width);
      it.min.y = b.top - top;
      it.max.y = b.bottom - (top + r.height);
      if (it.min.x > it.max.x) it.min.x = it.max.x = 0;
      if (it.min.y > it.max.y) it.min.y = it.max.y = 0;
      // Centre in BOARD coordinates with no offset applied — the keep-out test
      // needs an absolute position, and this is the fixed part of it.
      it.cx0 = left - b.left + r.width / 2;
      it.cy0 = top - b.top + r.height / 2;
    });
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function write(it, rot) {
    var s = it.el.style;
    s.setProperty("--roam-x", it.x.toFixed(2) + "px");
    s.setProperty("--roam-y", it.y.toFixed(2) + "px");
    if (rot !== undefined) s.setProperty("--roam-rot", rot.toFixed(2) + "deg");
  }

  // ---- Drag -----------------------------------------------------------------
  var drag = window.HeroDrag;
  if (drag) {
    items.forEach(function (it) {
      drag.makeDraggable(it.el, {
        bounds: function () {
          return board.getBoundingClientRect();
        },
        getOffset: function () {
          return { x: it.x, y: it.y };
        },
        onStart: function () {
          it.held = true; // physics skips it; the lift eases via CSS
          it.el.classList.add("is-dragging");
        },
        onMove: function (dx, dy) {
          it.x = dx;
          it.y = dy;
          write(it);
        },
        onEnd: function (dx, dy, vx, vy) {
          it.x = dx;
          it.y = dy;
          write(it);
          // Resume roaming from exactly where it was dropped, carrying the
          // release velocity so the hand-off is continuous rather than a stop.
          var s = Math.hypot(vx, vy);
          if (s > THROW_MAX) {
            vx *= THROW_MAX / s;
            vy *= THROW_MAX / s;
          }
          it.vx = vx;
          it.vy = vy;
          it.held = false;
          it.el.classList.remove("is-dragging");
        },
      });
    });
  }

  measure();
  if (window.ResizeObserver) new window.ResizeObserver(measure).observe(board);

  // Reduced motion stops here: icons rest at their Figma positions, still
  // draggable, with no loop ever created.
  if (reduce) return;

  // ---- Loop -----------------------------------------------------------------
  var frame = 0;
  var last = 0;
  var clock = 0;

  function step(now) {
    frame = window.requestAnimationFrame(step);
    if (!last) last = now;
    // Cap dt so a dropped frame nudges rather than launches an icon.
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.held) continue;

      it.vx += (Math.random() - 0.5) * JITTER * dt;
      it.vy += (Math.random() - 0.5) * JITTER * dt;

      /* KEEP-OUT. The centre of the board belongs to the folder, the cards and
         the captions; icons are margin furniture. Distance is measured in the
         ellipse's own normalised space, so one radial push handles both axes
         at whatever aspect the board currently has. Force is zero exactly at
         the boundary and strongest dead centre, with a SQRT falloff — a linear
         one is too weak near the rim to turn an icon that is already moving,
         and they sail straight through (see the note in tokens.css). Nothing
         is forbidden: an icon can still drift a little way in before being
         eased back out, which is the occasional dip rather than a hard wall. */
      var cx = it.cx0 + it.x;
      var cy = it.cy0 + it.y;
      var nx = (cx - boardW / 2) / (KEEP_X * boardW);
      var ny = (cy - boardH / 2) / (KEEP_Y * boardH);
      var d = Math.hypot(nx, ny);
      if (d < 1) {
        var push = KEEP_FORCE * Math.pow(1 - d, KEEP_FALLOFF) * dt;
        if (d > 0.001) {
          it.vx += (nx / d) * push;
          it.vy += (ny / d) * push;
        } else {
          // Dead centre has no radial direction; any heading will do.
          it.vx += push;
        }
      }

      // Soft cushion: force grows with how far past the margin it has drifted.
      if (it.x < it.min.x + EDGE_MARGIN) it.vx += EDGE_FORCE * (it.min.x + EDGE_MARGIN - it.x) * dt;
      if (it.x > it.max.x - EDGE_MARGIN) it.vx -= EDGE_FORCE * (it.x - (it.max.x - EDGE_MARGIN)) * dt;
      if (it.y < it.min.y + EDGE_MARGIN) it.vy += EDGE_FORCE * (it.min.y + EDGE_MARGIN - it.y) * dt;
      if (it.y > it.max.y - EDGE_MARGIN) it.vy -= EDGE_FORCE * (it.y - (it.max.y - EDGE_MARGIN)) * dt;

      var sp = Math.hypot(it.vx, it.vy);
      if (sp > SPEED_MAX) {
        it.vx *= SPEED_MAX / sp;
        it.vy *= SPEED_MAX / sp;
      } else if (sp < SPEED_MIN && sp > 0) {
        it.vx *= SPEED_MIN / sp;
        it.vy *= SPEED_MIN / sp;
      }

      it.x = clamp(it.x + it.vx * dt, it.min.x, it.max.x);
      it.y = clamp(it.y + it.vy * dt, it.min.y, it.max.y);

      write(it, Math.sin(clock * BOB_RATE + it.phase) * BOB_DEG);
    }
  }

  function start() {
    if (frame) return;
    last = 0; // resets dt so the first frame back is not a giant leap
    frame = window.requestAnimationFrame(step);
  }
  function stop() {
    if (!frame) return;
    window.cancelAnimationFrame(frame);
    frame = 0;
  }

  if ("IntersectionObserver" in window) {
    new window.IntersectionObserver(function (entries) {
      if (entries[entries.length - 1].isIntersecting) start();
      else stop();
    }).observe(board);
  } else {
    start();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (board.getBoundingClientRect().bottom > 0) start();
  });
})(window, document);
