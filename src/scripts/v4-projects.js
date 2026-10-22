/* V5 selected projects — v4/projects.njk, _projects.css.
 *
 * THE GROW, tied to the scroll. --p on the section goes 0 to 1 as its top
 * travels from where it peeks under the hero up to the top of the screen:
 * the navy card widens to the full width and the content rises in. Then the
 * stage holds (the section's 60svh tail) and scrolls on. When the stage is
 * taller than the screen (a short phone), it sticks by its bottom instead, so
 * nothing is cut off.
 *
 * THE TABS pick the project (click, or the arrow keys on a focused tab); the
 * white notch slides under the active one. No scroll switching.
 *
 * THE THUMBNAILS, one at a time. The one showing plays: a video from its
 * start, a layered one its layers, an animated one its keyframes. 1s after
 * that ends it slides on to the next, round and round. A drag or swipe, or a
 * dot, moves it by hand. Only the open card plays, and only while the section
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

  /* ---- The grow ---------------------------------------------------------- */
  var tip = 0;
  function measure() {
    tip = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--v5-tip")) || 80;
    stage.style.top = Math.min(0, window.innerHeight - stage.offsetHeight) + "px";
  }
  function grow() {
    if (reduce) { section.style.setProperty("--p", 1); return; }
    var start = window.innerHeight - tip;             // where the top peeks in, under the hero
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
      c.i = ((k % N) + N) % N;
      track.style.setProperty("--i", c.i);
      dots.forEach(function (d, j) {
        d.classList.toggle("is-on", j === c.i);
        d.setAttribute("aria-current", j === c.i ? "true" : "false");
      });
      play();
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

  function live() {
    carousels.forEach(function (c, k) { c.setLive(onScreen && k === active); });
  }

  function pick(k, focus) {
    if (k === active) return;
    active = k;
    tabs.forEach(function (t, j) {
      t.classList.toggle("is-active", j === k);
      t.setAttribute("aria-selected", j === k ? "true" : "false");
      t.tabIndex = j === k ? 0 : -1;
    });
    cards.forEach(function (c, j) { c.hidden = j !== k; c.classList.toggle("is-active", j === k); });
    carousels[k].go(0);
    placePointer();
    measure();
    live();
    if (focus) tabs[k].focus();
  }

  tabs.forEach(function (t, k) {
    t.tabIndex = k === 0 ? 0 : -1;
    t.addEventListener("click", function () { pick(k); });
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
