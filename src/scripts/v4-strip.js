/* V4 project strips — v4/project-row.njk, _work.css.
 *
 * AN ENDLESS CAROUSEL. One small move goes one thumbnail along, either way,
 * for ever: the round arrows either side, a sideways scroll on a trackpad or
 * Shift+wheel, a swipe on a phone, a drag with a mouse, or the arrow keys
 * once the strip has focus. The one at the front is centred (.is-front), its
 * neighbours peeking in either side, dimmed.
 * Up-and-down scrolling stays the page's. Endless by a copy of the panels on
 * each side (.is-clone, hidden from screen readers): after sliding onto a
 * copy it jumps, unseen, to the real one.
 *
 * ONLY THE THUMBNAIL AT THE FRONT PLAYS, once the strip is on screen. A
 * "video" panel plays its loop from the start; anywhere else it waits on its
 * first frame. Its file loads once the strip is near, so it is ready. A "layers" panel brings its layers in one by one
 * (.is-play) the first time it comes to the front, and keeps them up while
 * it stays in sight (.is-held); until then they are hidden. Out of sight,
 * both reset, so they play again next time. Reduced motion: no slide, no
 * motion.
 *
 * BIG ON THE WAY IN, driven by the scroll. A card's strip comes up from the
 * bottom of the screen at its column size and grows as it rises, to 1.7x
 * and along the whole page just below the clock and menu; from their bottom
 * edge up to the top of the screen it shrinks back to the column
 * (--grow on the carousel, 0 to 1 to 0; .is-big while above 0; _work.css).
 * Wide screens only, not for reduced motion.
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

  // A "video" panel: from its start when it comes to the front, back on its
  // first frame anywhere else.
  function play(panel) {
    var v = panel.querySelector("video");
    if (!v || reduce || !v.paused) return;
    v.preload = "auto";
    try { v.currentTime = 0; } catch (e) {}
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function stop(panel) {
    var v = panel.querySelector("video");
    if (!v || (v.paused && !v.currentTime)) return;
    v.pause();
    try { v.currentTime = 0; } catch (e) {}
  }

  // How much a strip is grown right now (1 unless its card is .is-big).
  function scaleOf(strip) {
    var c = strip.closest(".v4-project__carousel");
    var m = c && getComputedStyle(c).transform;
    return m && m !== "none" ? (parseFloat(m.split("(")[1]) || 1) : 1;
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
      Array.prototype.forEach.call(c.querySelectorAll("video"), function (v) { v.preload = "none"; v.removeAttribute("loop"); });
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
    // The one at the front is centred in the strip; the rest are dimmed.
    function place(slide, extra) {
      track.classList.toggle("is-sliding", !!slide && !reduce);
      x = (strip.clientWidth - all[idx].offsetWidth) / 2 - offset(idx) + (extra || 0);
      track.style.transform = "translate3d(" + x + "px,0,0)";
      all.forEach(function (el, k) { el.classList.toggle("is-front", k === idx); });
    }

    // What is in view now, and what plays: only the one at the front.
    function update() {
      var w = strip.clientWidth, seen = [];
      all.forEach(function (el, k) {
        var L = k % N, left = el.offsetLeft - all[0].offsetLeft + x;
        var vis = onScreen && left < w - 1 && left + el.offsetWidth > 1;
        var front = onScreen && k === idx;
        if (vis) seen[L] = true;
        if (el.classList.contains("v4-project__panel--video")) {
          if (front) play(el); else stop(el);
        } else if (el.classList.contains("v4-project__panel--anim")) {
          // Its own keyframes run from the start each time it comes to the front.
          el.classList.toggle("is-play", front && !reduce);
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
        track.classList.add("is-jumping");               // no fade: the copy and the real one swap in place
        place(false);
        void track.offsetWidth;
        track.classList.remove("is-jumping");
      }
      update();
    }
    track.addEventListener("transitionend", function (e) {
      if (e.target === track && e.propertyName === "transform") settle();
    });

    // `via` says how (arrow, swipe, scroll, key), for scripts/v4-analytics.js.
    function go(dir, via) {
      idx = Math.max(0, Math.min(3 * N - 1, idx + dir));
      strip.dispatchEvent(new CustomEvent("v4:strip", { bubbles: true, detail: { dir: dir, via: via || "" } }));
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
      if (Math.abs(acc) >= WHEEL) { go(acc > 0 ? 1 : -1, "scroll"); locked = true; acc = 0; }
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
      place(false, dx / scaleOf(strip));
    });
    function release(e) {
      if (!down) return;
      down = false;
      strip.classList.remove("is-dragging");
      try { strip.releasePointerCapture(e.pointerId); } catch (err) {}
      if (axis !== "x") return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) >= SWIPE) go(dx < 0 ? 1 : -1, "swipe");
      else { place(true); timer = setTimeout(settle, SLIDE + 80); }
    }
    strip.addEventListener("pointerup", release);
    strip.addEventListener("pointercancel", release);
    // A drag is not a click: swallow the click that ends one.
    strip.addEventListener("click", function (e) {
      if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0; }
    }, true);

    // The arrows, beside the strip (outside its clip); a press is theirs, not the card's link.
    Array.prototype.forEach.call(strip.parentNode.querySelectorAll("[data-strip-step]"), function (b) {
      b.hidden = false;
      b.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        go(+b.getAttribute("data-strip-step"), "arrow");
      });
    });

    strip.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1, "key"); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1, "key"); }
    });

    window.addEventListener("resize", function () { place(false); update(); });
    // A browser may hold a video back while the page is hidden: start the
    // one at the front again when it shows.
    document.addEventListener("visibilitychange", function () { if (!document.hidden) update(); });
    place(false);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].intersectionRatio >= 0.2;
        if (entries[0].isIntersecting) real.forEach(function (el) { var v = el.querySelector("video"); if (v && v.preload === "none") v.preload = "auto"; });
        update();
      }, { threshold: [0, 0.2, 0.7] }).observe(strip);
    } else {
      onScreen = true;
      update();
    }
  });

  // BIG ON THE WAY IN: on every scroll (one frame at most), each strip's
  // --grow from where its top is. 0 at the bottom of the screen, rising to 1
  // a little (HOLD of the screen) below the bottom of the sticky menu and
  // clock, 1 down to that line, then back to 0 at the top of the screen;
  // eased both ways.
  var HOLD = 0.1;
  var wide = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".v4-project")).filter(function (c) {
    return c.querySelector(".v4-project__strip.is-carousel");
  });
  var rail = document.querySelector(".v4-rail"), clock = document.querySelector(".v4-status");
  var frame = 0;
  function line() {
    // The lower of the two bottoms, where each sits in the top half of the screen (stuck there).
    var y = 0;
    [rail, clock].forEach(function (el) {
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.top >= 0 && r.bottom < window.innerHeight / 2) y = Math.max(y, r.bottom);
    });
    return (y || window.innerHeight * 0.15) + 16;
  }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function growAt(top, L, H) {
    var P = Math.min(H - 1, L + H * HOLD);          // full size from here up to the line
    if (top >= P) return ease((H - top) / (H - P));  // rising in from the bottom
    if (top >= L) return 1;                          // held, just below the clock and menu
    return ease(top / L);                            // past the line: shrinking to the top
  }

  // Each strip's size glides towards where the scroll says it should be
  // (a mouse wheel moves the page in jumps; this smooths them), a frame at
  // a time until it gets there. Positions are taken as if no strip above
  // were grown, so a strip's own growing never moves another's target.
  // While it moves, the strip is its own layer (will-change), drawn once and
  // scaled smoothly; once it stops it is drawn again, sharp at its size.
  var state = cards.map(function (c) {
    return { card: c, car: c.querySelector(".v4-project__carousel"), strip: c.querySelector(".v4-project__strip"), cur: 0, target: 0, moving: false };
  });
  var BIG = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--v4-strip-big")) || 1.7;
  var SMOOTH = 0.16;   // share of the way it closes each 60th of a second
  var last = 0;

  function targets() {
    var L = line(), H = window.innerHeight, above = 0;
    state.forEach(function (st) {
      var top = st.car.getBoundingClientRect().top - above;   // as if nothing above were grown
      st.target = wide.matches ? growAt(top, L, H) : 0;
      above += (BIG - 1) * st.cur * st.strip.offsetHeight;    // the room this one adds below itself now
    });
  }
  function apply(st) {
    st.car.style.setProperty("--grow", (Math.round(st.cur * 10000) / 10000).toString());
    st.card.classList.toggle("is-big", st.cur > 0.001);
  }
  function tick(now) {
    frame = 0;
    targets();
    var dt = last ? Math.min(64, now - last) : 16.7;
    last = now;
    var k = 1 - Math.pow(1 - SMOOTH, dt / 16.7), busy = false;
    state.forEach(function (st) {
      var d = st.target - st.cur;
      if (Math.abs(d) < 0.0015) {
        if (st.cur !== st.target) { st.cur = st.target; apply(st); }
        if (st.moving) { st.moving = false; st.car.style.willChange = ""; }
        return;
      }
      st.cur += d * k;
      if (!st.moving) { st.moving = true; st.car.style.willChange = "transform"; }
      apply(st);
      busy = true;
    });
    if (busy) frame = requestAnimationFrame(tick);
    else last = 0;
  }
  function soon() { if (!frame) frame = requestAnimationFrame(tick); }
  if (cards.length) {
    window.addEventListener("scroll", soon, { passive: true });
    window.addEventListener("resize", soon);
    if (wide.addEventListener) wide.addEventListener("change", soon);
    // Start where the page is, without gliding in on load.
    targets();
    state.forEach(function (st) { st.cur = st.target; apply(st); });
  }

  // THE CURSOR LABEL. Over a linked card's thumbnails, with a mouse, a small
  // "View case study" pill follows the pointer (_work.css). Not over the
  // arrows, and not while the strip is being dragged, which browses instead.
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var pill = document.createElement("div");
  pill.className = "v4-cursor-pill";
  pill.setAttribute("aria-hidden", "true");
  pill.textContent = "View case study";
  document.body.appendChild(pill);
  Array.prototype.slice.call(document.querySelectorAll("[data-card-href] .v4-project__strip")).forEach(function (s) {
    s.addEventListener("pointermove", function (e) {
      var off = e.pointerType !== "mouse" || !fine.matches || s.classList.contains("is-dragging") || e.target.closest("[data-strip-step]");
      pill.style.setProperty("--x", (e.clientX + 16) + "px");
      pill.style.setProperty("--y", (e.clientY + 16) + "px");
      pill.classList.toggle("is-on", !off);
    });
    s.addEventListener("pointerleave", function () { pill.classList.remove("is-on"); });
  });

  Array.prototype.slice.call(document.querySelectorAll("[data-card-href]")).forEach(function (card) {
    var href = card.getAttribute("data-card-href");
    function open(e) {
      if (e.target.closest("a, button")) return;                  // its own link or control handles it
      var sel = window.getSelection && String(window.getSelection());
      if (sel) return;                                             // they were selecting text
      if (e.metaKey || e.ctrlKey || e.button === 1) window.open(href, "_blank", "noopener");
      else window.location.href = href;
    }
    card.addEventListener("click", open);
    card.addEventListener("auxclick", function (e) { if (e.button === 1) open(e); });
  });
})();
