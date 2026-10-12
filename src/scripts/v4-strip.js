/* V4 project strips — v4/project-row.njk, _work.css.
 *
 * AN ENDLESS CAROUSEL. One small move goes one thumbnail along, either way,
 * for ever: a sideways scroll on a trackpad or Shift+wheel, a swipe on a
 * phone, a drag with a mouse, or the arrow keys once the strip has focus.
 * Up-and-down scrolling stays the page's. Endless by a copy of the panels on
 * each side (.is-clone, hidden from screen readers): after sliding onto a
 * copy it jumps, unseen, to the real one.
 *
 * ONLY THE THUMBNAIL AT THE FRONT PLAYS, once the strip is on screen. A
 * "frames" panel plays its steps (data-steps: which still shows, for how
 * long, and a zoom into part of it), on a loop; anywhere else it waits on
 * its first still. A "layers" panel brings its layers in one by one
 * (.is-play) the first time it comes to the front, and keeps them up while
 * it stays in sight (.is-held); until then they are hidden. Out of sight,
 * both reset, so they play again next time. Reduced motion: no slide, no
 * motion.
 *
 * THE WHOLE CARD IS A LINK. A click anywhere on a linked project (name,
 * text or strip; article[data-card-href]) opens its case study, Cmd/Ctrl or
 * middle click in a new tab. Not when the click ends a drag of the strip,
 * nor when it ends a text selection, and links inside keep their own.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SLIDE = 550;                                            // ms, as --v4-strip-slide
  var SWIPE = 40;                                             // px of drag or swipe for one step
  var WHEEL = 24;                                             // px of sideways scroll for one step

  // A "frames" panel's steps: show still f for ms, zoomed into [x, y, scale]
  // (x, y the centre to zoom on, 0-1 of the panel) or not at all.
  function zoomTo(z) {
    if (!z) return "none";
    var s = z[2];
    var tx = Math.max(1 - s, Math.min(0, 0.5 - s * z[0]));
    var ty = Math.max(1 - s, Math.min(0, 0.5 - s * z[1]));
    return "translate(" + (tx * 100).toFixed(2) + "%," + (ty * 100).toFixed(2) + "%) scale(" + s + ")";
  }
  function play(panel) {
    if (panel._seq || reduce) return;
    var steps = JSON.parse(panel.getAttribute("data-steps") || "[]");
    var stack = panel.querySelector(".v4-project__frames");
    var frames = stack ? stack.children : [];
    if (!steps.length || !frames.length) return;
    var i = 0;
    panel.classList.remove("is-reset");
    (function next() {
      var st = steps[i];
      Array.prototype.forEach.call(frames, function (f, k) { f.classList.toggle("is-on", k === st.f); });
      stack.style.transform = zoomTo(st.zoom);
      i = (i + 1) % steps.length;
      panel._seq = setTimeout(next, st.ms);
    })();
  }
  function stop(panel) {
    if (!panel._seq) return;
    clearTimeout(panel._seq);
    panel._seq = 0;
    panel.classList.add("is-reset");
    var stack = panel.querySelector(".v4-project__frames");
    stack.style.transform = "none";
    Array.prototype.forEach.call(stack.children, function (f, k) { f.classList.toggle("is-on", k === 0); });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-strip]")).forEach(function (strip) {
    var track = strip.querySelector(".v4-project__track");
    var real = Array.prototype.slice.call(track.children);
    var N = real.length;
    if (N < 2) return;

    function copy(el) {
      var c = el.cloneNode(true);
      c.classList.add("is-clone");
      c.setAttribute("aria-hidden", "true");
      c.inert = true;
      Array.prototype.forEach.call(c.querySelectorAll("img"), function (i) { i.loading = "eager"; });
      return c;
    }
    real.forEach(function (el) { track.insertBefore(copy(el), real[0]); });
    real.forEach(function (el) { track.appendChild(copy(el)); });
    var all = Array.prototype.slice.call(track.children);   // copies, real, copies
    var idx = N, x = 0, onScreen = false, shown = [], timer = 0;

    strip.classList.add("is-carousel");
    strip.tabIndex = 0;
    strip.setAttribute("aria-roledescription", "carousel");

    function offset(k) { return all[k].offsetLeft - all[0].offsetLeft; }
    function place(slide, extra) {
      track.classList.toggle("is-sliding", !!slide && !reduce);
      x = -offset(idx) + (extra || 0);
      track.style.transform = "translate3d(" + x + "px,0,0)";
    }

    // What is in view now, and what plays: only the one at the front.
    function update() {
      var w = strip.clientWidth, seen = [];
      all.forEach(function (el, k) {
        var L = k % N, left = el.offsetLeft - all[0].offsetLeft + x;
        var vis = onScreen && left < w - 1 && left + el.offsetWidth > 1;
        var front = onScreen && k === idx;
        if (vis) seen[L] = true;
        if (el.classList.contains("v4-project__panel--frames")) {
          if (front) play(el); else stop(el);
        } else if (el.classList.contains("v4-project__panel--layers")) {
          if (front) {
            if (!el.classList.contains("is-play") && !el.classList.contains("is-held")) el.classList.add(shown[L] ? "is-held" : "is-play");
          } else if (vis && shown[L]) {
            el.classList.remove("is-play");
            el.classList.add("is-held");
          } else {
            el.classList.remove("is-play", "is-held");
          }
          if (front) seen[L] = "played";
        }
      });
      for (var L = 0; L < N; L++) shown[L] = seen[L] === "played" || (!!seen[L] && !!shown[L]);
    }

    // After a slide: off a copy onto the real one, unseen, then play.
    function settle() {
      clearTimeout(timer);
      if (idx < N || idx >= 2 * N) {
        idx = N + (((idx - N) % N) + N) % N;
        place(false);
        void track.offsetWidth;
      }
      update();
    }
    track.addEventListener("transitionend", function (e) {
      if (e.target === track && e.propertyName === "transform") settle();
    });

    function go(dir) {
      idx = Math.max(0, Math.min(3 * N - 1, idx + dir));
      place(true);
      clearTimeout(timer);
      timer = setTimeout(settle, reduce ? 0 : SLIDE + 80);
    }

    // Sideways scroll: one step per gesture, its momentum included.
    var acc = 0, locked = false, quiet = 0;
    strip.addEventListener("wheel", function (e) {
      var k = e.deltaMode === 1 ? 16 : 1, dx = e.deltaX * k, dy = e.deltaY * k;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      e.preventDefault();
      clearTimeout(quiet);
      quiet = setTimeout(function () { locked = false; acc = 0; }, 180);
      if (locked) return;
      acc += dx;
      if (Math.abs(acc) >= WHEEL) { go(acc > 0 ? 1 : -1); locked = true; acc = 0; }
    }, { passive: false });

    // Drag (mouse) or swipe (touch, pen): follows the pointer, then steps.
    var down = false, axis = "", startX = 0, startY = 0, moved = 0;
    strip.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      down = true; axis = ""; moved = 0;
      startX = e.clientX; startY = e.clientY;
    });
    strip.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "y") { down = false; return; }
        strip.classList.add("is-dragging");
        try { strip.setPointerCapture(e.pointerId); } catch (err) {}
        clearTimeout(timer);
      }
      moved = Math.abs(dx);
      place(false, dx);
    });
    function release(e) {
      if (!down) return;
      down = false;
      strip.classList.remove("is-dragging");
      try { strip.releasePointerCapture(e.pointerId); } catch (err) {}
      if (axis !== "x") return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) >= SWIPE) go(dx < 0 ? 1 : -1);
      else { place(true); timer = setTimeout(settle, SLIDE + 80); }
    }
    strip.addEventListener("pointerup", release);
    strip.addEventListener("pointercancel", release);
    // A drag is not a click: swallow the click that ends one.
    strip.addEventListener("click", function (e) {
      if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0; }
    }, true);

    strip.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });

    window.addEventListener("resize", function () { place(false); update(); });
    place(false);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].intersectionRatio >= 0.35;
        update();
      }, { threshold: [0, 0.35, 0.7] }).observe(strip);
    } else {
      onScreen = true;
      update();
    }
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
