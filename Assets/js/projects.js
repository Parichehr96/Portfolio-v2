/* Featured Works carousel — home page only (Figma "Projects" 6:25772).
 *
 * The track is a CSS scroll-snap row exactly one card wide, so wheel, trackpad,
 * touch and keyboard scrolling all keep working with no JS. On top of that this
 * module adds:
 *
 *   1. INFINITE LOOPING in both directions. A clone of the last card is inserted
 *      before the first and a clone of the first is appended after the last, so
 *      the track reads [ last' | 0 1 2 3 | first' ]. Stepping off either end
 *      animates FORWARD into the adjacent clone — never a rewind back across the
 *      whole strip — and once the scroll settles the position is reset, with no
 *      animation, onto the clone's real twin. The clone and the twin are pixel
 *      identical, so the reset is invisible and no blank slide is ever shown.
 *
 *   2. PAGINATION DOTS, one per REAL card, kept in sync with the current slide
 *      (including across a wrap) and clickable to jump straight to a slide.
 *
 * There is deliberately no autoplay. The arrows are never disabled any more —
 * with a loop there is no end to clamp at.
 *
 * Zero dependencies.
 */
(function () {
  "use strict";

  var track = document.getElementById("project-track");
  if (!track) return; // only present on index.html

  var prev = document.querySelector(".proj-arrow--prev");
  var next = document.querySelector(".proj-arrow--next");
  if (!prev || !next) return;

  var dotsBox = document.getElementById("project-dots");

  var cards = Array.prototype.slice.call(track.querySelectorAll(".project-card"));
  var count = cards.length;
  if (!count) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var index = 0; // current REAL slide, 0 … count-1

  // ---- Clones ---------------------------------------------------------------
  // Inert copies: hidden from assistive tech, skipped by Tab, and stripped of
  // their href so the duplicated case-study links can't be read or activated
  // twice. Only their pixels matter.
  function cloneCard(card) {
    var c = card.cloneNode(true);
    c.classList.add("project-card--clone");
    c.setAttribute("aria-hidden", "true");
    c.setAttribute("tabindex", "-1");
    c.removeAttribute("href");
    return c;
  }
  track.insertBefore(cloneCard(cards[count - 1]), cards[0]);
  track.appendChild(cloneCard(cards[0]));

  // Track position of a real slide — offset by one for the leading clone.
  function posOf(i) {
    return i + 1;
  }

  // One card plus one gap, measured live so it survives any CSS change.
  function slideWidth() {
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  }

  function scrollToPos(pos, smooth) {
    var w = slideWidth();
    if (!w) return;
    track.scrollTo({
      left: pos * w,
      // "instant", NOT "auto": per spec "auto" defers to CSS, and .proj-track
      // sets scroll-behavior: smooth — so "auto" would animate the clone->twin
      // reset as a visible rewind back across the whole strip.
      behavior: smooth && !reduce ? "smooth" : "instant",
    });
  }

  // ---- Dots -----------------------------------------------------------------
  function buildDots() {
    if (!dotsBox) return;
    cards.forEach(function (card, i) {
      var link = card.querySelector(".project-link");
      // "Explore ONTON" -> "ONTON", so the control is announced by project name.
      var name = link
        ? link.textContent.replace(/^\s*Explore\s+/i, "")
        : "project " + (i + 1);
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "proj-dot";
      dot.setAttribute("aria-label", "Show " + name);
      dot.addEventListener("click", function () {
        goToSlide(i, true);
      });
      dotsBox.appendChild(dot);
    });
  }

  function paintDots() {
    if (!dotsBox) return;
    var ds = dotsBox.children;
    for (var i = 0; i < ds.length; i++) {
      if (i === index) ds[i].setAttribute("aria-current", "true");
      else ds[i].removeAttribute("aria-current");
    }
  }

  // ---- Navigation -----------------------------------------------------------
  // Step one card in `dir`, wrapping. The real index wraps immediately so the
  // dots are already correct while the scroll animates; the scroll itself aims
  // at posOf(index) + dir, which on a wrap is a clone just past the real end.
  function step(dir) {
    var target = posOf(index) + dir; // 0 or count+1 when wrapping
    index = (index + dir + count) % count;
    paintDots();
    scrollToPos(target, true);
  }

  function goToSlide(i, smooth) {
    index = ((i % count) + count) % count;
    paintDots();
    scrollToPos(posOf(index), smooth);
  }

  prev.addEventListener("click", function () {
    step(-1);
  });
  next.addEventListener("click", function () {
    step(1);
  });

  // ---- Settle ---------------------------------------------------------------
  // Runs once scrolling stops, from any source (arrow, dot, wheel, touch, keys).
  // Parked on a clone -> jump silently to its real twin. Parked on a real card ->
  // just adopt it, which is what keeps the dots honest during free scrolling.
  var settleTimer = null;
  function onSettle() {
    var w = slideWidth();
    if (!w) return;
    var pos = Math.round(track.scrollLeft / w);
    if (pos <= 0) {
      index = count - 1; // leading clone == last card
      scrollToPos(posOf(index), false);
    } else if (pos >= count + 1) {
      index = 0; // trailing clone == first card
      scrollToPos(posOf(index), false);
    } else {
      index = pos - 1;
    }
    paintDots();
  }
  track.addEventListener(
    "scroll",
    function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(onSettle, 140);
    },
    { passive: true }
  );

  // ---- Init -----------------------------------------------------------------
  buildDots();
  paintDots();
  // Start on the first REAL card, not the leading clone.
  scrollToPos(posOf(0), false);

  var resizing = false;
  window.addEventListener("resize", function () {
    if (resizing) return;
    resizing = true;
    requestAnimationFrame(function () {
      resizing = false;
      scrollToPos(posOf(index), false); // slide width changed — re-anchor
    });
  });
  // Fonts and layout can still settle after first paint; re-anchor once loaded.
  window.addEventListener("load", function () {
    scrollToPos(posOf(index), false);
  });
})();
