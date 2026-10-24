/* V5 selected projects — v4/projects.njk, _projects.css.
 *
 * THE GROW, tied to the scroll. --p on the section goes 0 to 1 as its top
 * travels from where it sits under the hero up to the top of the screen:
 * the navy card widens to the full width and the content rises in. Then the
 * stage holds (the section's 60svh tail) and scrolls on. When the stage is
 * taller than the screen (a short phone), it sticks by its bottom instead, so
 * nothing is cut off.
 *
 * THE TABS pick the project: hovering a logo with a mouse, a click or tap, or
 * the arrow keys on a focused tab; the white notch slides under the active
 * one. No scroll switching. THE WHOLE CARD opens its case study.
 *
 * THE THUMBNAILS, one at a time. The one showing plays: a video from its
 * start, a layered one its layers, an animated one its keyframes. 1s after
 * that ends it slides on to the next, round and round for ever (never
 * rewinding). A drag or swipe, a sideways scroll, or a dot moves it by hand. Only the open card plays, and only while the section
 * is on screen. Reduced motion: no grow, no auto-advance, nothing plays.
 */
(function () {
  "use strict";

  var section = document.querySelector("[data-work]");
  if (!section) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = section.querySelector(".v5-work__stage");
  var tabs = Array.prototype.slice.call(section.querySelectorAll("[data-work-tab]"));
  var cards = Array.prototype.slice.call(section.querySelectorAll("[data-work-card]"));
  var pointer = section.querySelector("[data-work-pointer]");
  var AFTER = 1000;         // ms after a thumbnail's animation, before the next
  var ANIM = 5003;          // one round of an animated (svg) thumbnail, v4/work/onton-link.njk
  var SWIPE = 40;           // px of drag for one step
  var WHEEL = 24;           // px of sideways scroll for one step
  var SLIDE = 560;          // ms, the track's slide (_projects.css)

  /* ---- The grow ---------------------------------------------------------- */
  var start = 1;
  function measure() {
    // Where its top sits at the top of the page: under the hero, on screen.
    start = Math.max(1, Math.min(section.getBoundingClientRect().top + window.scrollY, window.innerHeight - 40));
    stage.style.top = Math.min(0, window.innerHeight - stage.offsetHeight) + "px";
  }
  function grow() {
    if (reduce) { section.style.setProperty("--p", 1); return; }
    var p = 1 - section.getBoundingClientRect().top / start;
    section.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(4));
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; grow(); });
  }, { passive: true });
  window.addEventListener("resize", function () { measure(); grow(); placePointer(); });

  /* ---- The thumbnails ----------------------------------------------------- */
  function layerTime(panel) {
    var cs = getComputedStyle(document.documentElement);
    var s = function (n) { return parseFloat(cs.getPropertyValue(n)) * 1000 || 0; };
    var n = panel.querySelectorAll(".v4-project__layer").length;
    return s("--v4-layer-lead") + Math.max(0, n - 1) * s("--v4-layer-step") + s("--v4-layer-time");
  }

  var carousels = cards.map(function (card) {
    var frame = card.querySelector("[data-work-frame]");
    var track = card.querySelector("[data-work-track]");
    var panels = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(card.querySelectorAll("[data-work-dot]"));
    var c = { card: card, i: 0, timer: 0, live: false };
    var N = panels.length;

    // ENDLESS: a copy of the last before the first and of the first after the
    // last; sliding onto a copy, it then jumps, unseen, to the real one, so
    // the row only ever moves on, never rewinds. --i is the place in the track
    // (the real thumbnail k sits at k + 1).
    function copy(el) {
      var x = el.cloneNode(true);
      x.setAttribute("aria-hidden", "true");
      x.inert = true;
      Array.prototype.forEach.call(x.querySelectorAll("video"), function (v) { v.preload = "none"; });
      return x;
    }
    var wrapTimer = 0;
    if (N > 1) {
      track.insertBefore(copy(panels[N - 1]), panels[0]);
      track.appendChild(copy(panels[0]));
      track.classList.add("is-jump");
      track.style.setProperty("--i", 1);
      void track.offsetWidth;
      track.classList.remove("is-jump");
    }
    function place(v, slide) {
      track.classList.toggle("is-jump", !slide);
      track.style.setProperty("--i", v);
      if (!slide) { void track.offsetWidth; track.classList.remove("is-jump"); }
    }

    function reset(panel) {
      panel.classList.remove("is-play", "is-held");
      var v = panel.querySelector("video");
      if (v) { v.onended = null; v.pause(); try { v.currentTime = 0; } catch (e) {} }
    }

    function next() { go(c.i + 1); }
    function later(ms) { clearTimeout(c.timer); c.timer = setTimeout(next, ms + AFTER); }

    // Play the one showing, and queue the next for 1s after it ends.
    function play() {
      clearTimeout(c.timer);
      panels.forEach(function (p, k) { if (k !== c.i) reset(p); });
      if (!c.live || reduce || N < 2) return;
      var panel = panels[c.i];
      var v = panel.querySelector("video");
      if (v) {
        v.preload = "auto";
        v.onended = function () { later(0); };
        try { v.currentTime = 0; } catch (e) {}
        var pr = v.play();
        if (pr && pr.catch) pr.catch(function () { later(4000); });
      } else if (panel.classList.contains("v4-project__panel--layers")) {
        panel.classList.remove("is-play"); void panel.offsetWidth; panel.classList.add("is-play");
        later(layerTime(panel));
      } else if (panel.classList.contains("v4-project__panel--anim")) {
        panel.classList.add("is-play");
        later(ANIM);
      } else {
        later((parseFloat(panel.dataset.hold) || 4) * 1000);
      }
    }

    function go(k) {
      if (N < 2) return;
      clearTimeout(wrapTimer);
      c.i = ((k % N) + N) % N;
      dots.forEach(function (d, j) {
        d.classList.toggle("is-on", j === c.i);
        d.setAttribute("aria-current", j === c.i ? "true" : "false");
      });
      if (k >= N || k < 0) {
        // past an end: slide onto the copy, then swap to the real one and play
        clearTimeout(c.timer);
        panels.forEach(reset);
        place(k < 0 ? 0 : N + 1, !reduce);
        wrapTimer = setTimeout(function () { place(c.i + 1, false); play(); }, reduce ? 0 : SLIDE);
      } else {
        place(c.i + 1, true);
        play();
      }
    }
    c.go = go;
    c.setLive = function (on) {
      if (c.live === on) return;
      c.live = on;
      if (on) play(); else { clearTimeout(c.timer); panels.forEach(reset); }
    };

    dots.forEach(function (d, j) { d.addEventListener("click", function () { go(j); }); });

    // Drag (mouse) or swipe (touch): follows the finger, then steps.
    var down = false, axis = "", x0 = 0, y0 = 0, moved = 0;
    frame.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      down = true; axis = ""; moved = 0; x0 = e.clientX; y0 = e.clientY;
    });
    frame.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;
      if (!axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "y") { down = false; return; }
        frame.classList.add("is-dragging");
        try { frame.setPointerCapture(e.pointerId); } catch (err) {}
        clearTimeout(c.timer);
      }
      moved = Math.abs(dx);
      track.style.setProperty("--drag", dx + "px");
    });
    function release(e) {
      if (!down) return;
      down = false;
      frame.classList.remove("is-dragging");
      track.style.setProperty("--drag", "0px");
      try { frame.releasePointerCapture(e.pointerId); } catch (err) {}
      if (axis !== "x") return;
      var dx = e.clientX - x0;
      if (Math.abs(dx) >= SWIPE) go(c.i + (dx < 0 ? 1 : -1)); else play();
    }
    frame.addEventListener("pointerup", release);
    frame.addEventListener("pointercancel", release);
    frame.addEventListener("click", function (e) {
      if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0; }
    }, true);

    // Sideways scroll on a trackpad (or Shift + wheel): one step a gesture,
    // its momentum included. Up and down stays the page's.
    var acc = 0, locked = false, quiet = 0;
    frame.addEventListener("wheel", function (e) {
      var k = e.deltaMode === 1 ? 16 : 1, dx = e.deltaX * k, dy = e.deltaY * k;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      e.preventDefault();
      clearTimeout(quiet);
      quiet = setTimeout(function () { locked = false; acc = 0; }, 180);
      if (locked) return;
      acc += dx;
      if (Math.abs(acc) >= WHEEL) { go(c.i + (acc > 0 ? 1 : -1)); locked = true; acc = 0; }
    }, { passive: false });

    // THE WHOLE CARD OPENS ITS CASE STUDY: a click anywhere on it (Cmd/Ctrl
    // or the middle button for a new tab), but not on its own links and
    // buttons, not the end of a drag, and not the end of a text selection.
    var href = card.getAttribute("data-href");
    function open(e, tab) {
      if (!href || e.defaultPrevented || e.target.closest("a, button")) return;
      var sel = window.getSelection && String(window.getSelection());
      if (sel) return;
      if (tab) window.open(href, "_blank", "noopener"); else window.location.href = href;
    }
    card.addEventListener("click", function (e) { open(e, e.metaKey || e.ctrlKey); });
    card.addEventListener("auxclick", function (e) { if (e.button === 1) open(e, true); });

    return c;
  });

  /* ---- The tabs ------------------------------------------------------------ */
  var active = 0, onScreen = false;

  function placePointer() {
    if (!pointer || !tabs[active]) return;
    var t = tabs[active], row = t.parentElement;
    var x = t.offsetLeft + t.offsetWidth / 2 - pointer.offsetWidth / 2;
    if (row.offsetParent !== t.offsetParent) x -= row.offsetLeft;
    pointer.style.setProperty("--x", x + "px");
  }

  // To another tab, like water. The old neck thins at the middle and parts;
  // its halves draw back as drops, up into the tab and down into the card.
  // Then a drop pours from the new tab while the card raises a bead to meet
  // it; when they touch, the neck fills out to the connector (1704:1848).
  // Drawn as a path in the connector's own units (27 x 24 per neck) on an
  // SVG over the tab row; at rest the connector image shows instead.
  var goo = null, gooPath = null, flow = 0;
  if (pointer && !reduce) {
    goo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    goo.setAttribute("class", "v5-work__goo");
    goo.setAttribute("aria-hidden", "true");
    gooPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gooPath.setAttribute("fill", "#fff");
    goo.appendChild(gooPath);
    pointer.parentElement.appendChild(goo);
  }
  function tabX(k) { var t = tabs[k]; return t.offsetLeft + t.offsetWidth / 2; }
  // One drop hanging from the top edge (dir 1) or rising from the bottom
  // edge (dir -1), L long, in units; flares into the edge like the connector.
  function drop(cx, L, dir) {
    if (L <= 0.2) return "";
    var y0 = dir > 0 ? 0 : 24, Y = function (v) { return y0 + dir * v; };
    var hw = Math.min(3.2, 1 + L * 0.22), body = Math.min(7, 3 + L * 0.5), tip = Math.max(L - hw, 0.4);
    var sw = dir > 0 ? 0 : 1;
    return "M" + (cx - 13.5) + " " + Y(0) + " Q" + (cx - body) + " " + Y(0) + " " + (cx - body) + " " + Y(Math.min(2, L * .3)) +
      " C" + (cx - body) + " " + Y(L * .45) + " " + (cx - hw) + " " + Y(L * .6) + " " + (cx - hw) + " " + Y(tip) +
      " A" + hw + " " + hw + " 0 0 " + sw + " " + (cx + hw) + " " + Y(tip) +
      " C" + (cx + hw) + " " + Y(L * .6) + " " + (cx + body) + " " + Y(L * .45) + " " + (cx + body) + " " + Y(Math.min(2, L * .3)) +
      " Q" + (cx + body) + " " + Y(0) + " " + (cx + 13.5) + " " + Y(0) + "Z";
  }
  // The whole neck, its middle n wide either side (3 is the connector's).
  function neck(cx, n) {
    return "M" + (cx - 13.5) + " 0 Q" + (cx - 7) + " 0 " + (cx - 7) + " 2 C" + (cx - 7) + " 7 " + (cx - n) + " 9 " + (cx - n) + " 12 C" + (cx - n) + " 15 " + (cx - 7) + " 17 " + (cx - 7) + " 22 Q" + (cx - 7) + " 24 " + (cx - 13.5) + " 24" +
      " L" + (cx + 13.5) + " 24 Q" + (cx + 7) + " 24 " + (cx + 7) + " 22 C" + (cx + 7) + " 17 " + (cx + n) + " 15 " + (cx + n) + " 12 C" + (cx + n) + " 9 " + (cx + 7) + " 7 " + (cx + 7) + " 2 Q" + (cx + 7) + " 0 " + (cx + 13.5) + " 0Z";
  }
  function movePointer(from) {
    if (!pointer) return;
    if (!goo || from == null || from === active) { placePointer(); return; }
    cancelAnimationFrame(flow);
    var row = pointer.parentElement, k = pointer.offsetWidth / 27;   // px per unit
    goo.setAttribute("viewBox", "0 0 " + row.offsetWidth / k + " 24");
    goo.style.width = row.offsetWidth + "px";
    goo.style.height = pointer.offsetHeight + "px";
    var a = tabX(from) / k, b = tabX(active) / k, t0 = performance.now(), T = 450;
    var e = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    pointer.style.visibility = "hidden";
    goo.style.display = "block";
    (function frame(now) {
      var t = (now - t0) / T, d = "";
      // The old neck: thins (0–.15), parts and its halves draw back (.15–.45).
      if (t < 0.15) d += neck(a, 3 * (1 - e(t / 0.15)) + 0.25);
      else { var r = 12 * (1 - e((t - 0.15) / 0.3)); d += drop(a, r, 1) + drop(a, r, -1); }
      // The new one: a drop pours down (.3–.7), a bead rises (.5–.72); when
      // they meet the neck fills out, a touch past and back (.72–1).
      if (t >= 0.3) {
        if (t < 0.72) {
          var top = 14 * e((t - 0.3) / 0.4), bot = 10 * e((t - 0.5) / 0.22);
          d += drop(b, top, 1) + drop(b, bot, -1);
        } else {
          var q = (t - 0.72) / 0.28, n = 0.8 + 2.2 * e(q) + Math.sin(Math.min(1, q) * Math.PI) * 1.2;
          d += neck(b, n);
        }
      }
      gooPath.setAttribute("d", d);
      if (t < 1) flow = requestAnimationFrame(frame);
      else { goo.style.display = "none"; placePointer(); pointer.style.visibility = ""; }
    })(t0);
  }

  function live() {
    carousels.forEach(function (c, k) { c.setLive(onScreen && k === active); });
  }

  function pick(k, focus) {
    if (k === active) return;
    var from = active;
    active = k;
    tabs.forEach(function (t, j) {
      t.classList.toggle("is-active", j === k);
      t.setAttribute("aria-selected", j === k ? "true" : "false");
      t.tabIndex = j === k ? 0 : -1;
    });
    cards.forEach(function (c, j) { c.hidden = j !== k; c.classList.toggle("is-active", j === k); });
    carousels[k].go(0);
    movePointer(from);
    measure();
    live();
    if (focus) tabs[k].focus();
  }

  tabs.forEach(function (t, k) {
    t.tabIndex = k === 0 ? 0 : -1;
    t.addEventListener("click", function () { pick(k); });
    // With a mouse, pointing at a logo is enough.
    t.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pick(k); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      pick((k + d + tabs.length) % tabs.length, true);
    });
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; live(); }, { threshold: 0.35 }).observe(stage);
  } else { onScreen = true; }
  document.addEventListener("visibilitychange", function () {
    carousels.forEach(function (c) { c.setLive(false); });
    if (!document.hidden) live();
  });

  measure();
  grow();
  placePointer();
  live();
  window.addEventListener("load", function () { measure(); placePointer(); });
})();
