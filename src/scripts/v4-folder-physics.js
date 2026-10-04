/* V4 Services folder — the same interaction as the Tools folder's
 * <tool-folder> (scripts/vendor/tool-folder.js), on the layered folder of
 * v4/folder.njk.
 *
 * Hover tosses the cards up out of the folder: springs carry each to its
 * spot floating just above the folder, with one soft overshoot, and they
 * sway and lean away from the cursor. Move away and they drop straight back
 * at once (strong gravity, no stagger) and stop dead as they land; the
 * moment both are in, the folder is closed again. Tap toggles on touch;
 * Enter or Space toggles from the keyboard. Reduced motion jumps between the
 * two states.
 *
 * The tuning is tool-folder's own (supremeio/tool-folder, src/element.js),
 * so the two folders feel the same. The script moves the cards; the folder's
 * .is-open class still does the layering (cards over the flap, the closed
 * render hidden), and is only taken off once every card has landed.
 */
(function () {
  "use strict";

  var STAGGER_OUT = 1.6;
  var OUT = { k: 85, c: 11 }, SPIN = { k: 60, c: 9 };
  var SQUASH = { k: 320, c: 18 }, THUD = { k: 380, c: 20 };
  var TOSS = 340;
  var PUSH_RADIUS = 80, PUSH = 16, LEAN = 0.04;
  var D_OUT = 0.06;                  // s between cards going out
  var GRAVITY_IN = 6000;             // the drop home: quick, so leaving feels instant
  var FLOAT_GAP = 12;                // px between the lowest card and the folder

  function spring(pos, vel, target, s, dt) {
    return vel + (s.k * (target - pos) - s.c * vel) * dt;
  }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  Array.prototype.slice.call(document.querySelectorAll("[data-physics]")).forEach(function (folder) {
    var name = (folder.getAttribute("aria-label") || "").split(":")[0];
    var width = parseFloat(getComputedStyle(folder).getPropertyValue("--w")) || folder.offsetWidth;
    var items = Array.prototype.slice.call(folder.querySelectorAll(".v4-folder__item"));
    var n = items.length;
    var isOpen = false, pointer = null, t = 0, raf = 0, last = 0;
    var thud = { y: 0, v: 0 };

    function num(el, prop) {
      return parseFloat(el.style.getPropertyValue(prop)) || 0;
    }

    var cards = items.map(function (el, i) {
      var fx = num(el, "--fx"), fy = num(el, "--fy");
      return {
        el: el, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, q: 0, vq: 0, mode: "rest", wait: 0,
        dx: num(el, "--tx") - fx, dy: num(el, "--ty") - fy,
        cx: fx + el.offsetWidth / 2, cy: fy + el.offsetHeight / 2,
        h: el.offsetHeight, ty: num(el, "--ty"),
        dOut: i * D_OUT,
        sway: 3 + i * 0.4, phase: i * 1.7
      };
    });

    // Open, the cards float above the folder: their open layout as drawn,
    // lifted so the lowest one ends FLOAT_GAP above the folder's top edge.
    var lowest = Math.max.apply(null, cards.map(function (c) { return c.ty + c.h; }));
    var lift = -lowest - FLOAT_GAP;
    cards.forEach(function (c) {
      c.dy += lift;
    });

    function label() {
      folder.setAttribute("aria-expanded", isOpen ? "true" : "false");
      folder.setAttribute("aria-label", name + (isOpen ? ": close the folder" : ": open the folder"));
    }

    function set(open) {
      if (open === isOpen) return;
      isOpen = open;
      label();
      if (open) folder.classList.add("is-open");
      if (reduced.matches) return snap();
      cards.forEach(function (c) {
        if (open) {
          c.wait = c.dOut * STAGGER_OUT + 0.0001;
        } else {
          c.wait = 0;                       // going home starts at once
          if (c.mode !== "rest") drop(c);
        }
      });
      kick();
    }

    function launch(c) {
      c.mode = "out";
      c.vy -= TOSS * (0.85 + 0.3 * Math.random());
      c.vx += (c.dx > 0 ? 1 : -1) * 40 * Math.random();
      c.vr += (Math.random() - 0.5) * 140;
      thud.v += 40;
    }

    function drop(c) {
      c.mode = "fall";
      c.vy = Math.max(c.vy, 0);               // no hop: straight down
      var tHit = (-c.vy + Math.sqrt(c.vy * c.vy - 2 * GRAVITY_IN * Math.min(c.y, -1))) / GRAVITY_IN;
      c.vx = -c.x / tHit;
    }

    function step(c, dt) {
      if (c.wait > 0) {
        c.wait -= dt;
        if (c.wait <= 0) {
          if (isOpen) launch(c);
          else if (c.mode !== "rest") drop(c);
        }
        return true;
      }
      if (c.mode === "out") {
        var tx = c.dx + Math.sin(t * 2 * Math.PI / c.sway + c.phase) * 2.5;
        var ty = c.dy + Math.cos(t * 2 * Math.PI / (c.sway * 1.3) + c.phase) * 3.5;
        if (pointer) {
          var ex = c.cx + c.x - pointer.x, ey = c.cy + c.y - pointer.y;
          var d = Math.hypot(ex, ey) || 1;
          if (d < PUSH_RADIUS) {
            var f = (1 - d / PUSH_RADIUS) * PUSH;
            tx += ex / d * f; ty += ey / d * f;
          }
        }
        c.vx = spring(c.x, c.vx, tx, OUT, dt);
        c.vy = spring(c.y, c.vy, ty, OUT, dt);
        c.vr = spring(c.r, c.vr, c.vx * LEAN, SPIN, dt);
      } else if (c.mode === "fall") {
        c.vy += GRAVITY_IN * dt;
        c.vr = spring(c.r, c.vr, c.vx * LEAN, SPIN, dt);
        if (c.y + c.vy * dt >= 0 && c.vy > 0) {
          // Home: it stops dead, no bounce or squash to wait out.
          c.x = c.y = c.vx = c.vy = c.r = c.vr = c.q = c.vq = 0;
          c.mode = "rest";
          return false;
        }
      } else if (c.mode === "land") {
        c.vr = spring(c.r, c.vr, 0, SPIN, dt);
      }
      c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
      c.vq = spring(c.q, c.vq, 0, SQUASH, dt); c.q += c.vq * dt;
      if (c.mode === "land" && Math.abs(c.r) < 0.05 && Math.abs(c.vr) < 0.5 &&
          Math.abs(c.q) < 0.001 && Math.abs(c.vq) < 0.05) {
        c.r = c.vr = c.q = c.vq = 0; c.mode = "rest";
      }
      return c.mode !== "rest";
    }

    function tick(dt) {
      var busy = isOpen;
      t += dt;
      cards.forEach(function (c) { busy = step(c, dt) || busy; });
      thud.v = spring(thud.y, thud.v, 0, THUD, dt); thud.y += thud.v * dt;
      return busy || Math.abs(thud.y) > 0.01 || Math.abs(thud.v) > 0.1;
    }

    function render() {
      cards.forEach(function (c) {
        var q = c.q / 1000;
        c.el.style.transform = c.mode === "rest" ? "" :
          "translate(" + c.x + "px, " + (c.y + q * 23) + "px) rotate(" + c.r + "deg) scale(" + (1 + q * 0.6) + ", " + (1 - q) + ")";
      });
      var f = thud.y / 1000;
      folder.style.scale = Math.abs(f) < 1e-4 ? "" : (1 + f * 0.5) + " " + (1 - f);
    }

    function settled() {
      // Every card is home: hand the layering back to the closed state.
      if (!isOpen && folder.classList.contains("is-open") &&
          cards.every(function (c) { return c.mode === "rest"; })) {
        folder.classList.remove("is-open");
      }
    }

    function frame(now) {
      var elapsed = Math.min((now - last) / 1000, 1 / 30); last = now;
      var SUB = 4, dt = elapsed / SUB, busy = false;
      for (var i = 0; i < SUB; i++) busy = tick(dt) || busy;
      render();
      settled();
      raf = busy ? requestAnimationFrame(frame) : 0;
    }

    function kick() {
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }

    function snap() {
      cards.forEach(function (c) {
        c.x = isOpen ? c.dx : 0; c.y = isOpen ? c.dy : 0;
        c.r = c.vx = c.vy = c.vr = c.q = c.vq = c.wait = 0;
        c.mode = isOpen ? "out" : "rest";
      });
      render();
      settled();
    }

    folder.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") set(true); });
    folder.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "touch") { pointer = null; set(false); }
    });
    folder.addEventListener("pointermove", function (e) {
      var box = folder.getBoundingClientRect();
      var s = box.width / width || 1;
      pointer = { x: (e.clientX - box.left) / s, y: (e.clientY - box.top) / s };
    });
    folder.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch") set(!isOpen);
    });
    // Keyboard: Enter and Space click the button with no pointer behind it.
    folder.addEventListener("click", function (e) {
      if (e.detail === 0) set(!isOpen);
    });
  });
})();
