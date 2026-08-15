/* Shared carousel — drives EVERY horizontal scroller on the site.
 *
 * Replaces the two near-identical modules the old site shipped
 * (Assets/js/projects.js and Assets/js/testimonials.js). They had drifted:
 * projects had looping and dots, testimonials had edge-clamped arrows, and the
 * two disagreed about how to measure a slide. This is the union of both,
 * selected per instance by data attributes on the markup rather than by which
 * file happened to be loaded.
 *
 * MARKUP CONTRACT (see _includes/components/carousel.njk)
 *   [data-carousel]              wrapper
 *     data-loop="true|false"     infinite wrap with cloned edge cards
 *     data-dots="true|false"     pagination dots, one per real slide
 *   .carousel-track              the scroll-snap row; children are slides
 *   [data-carousel-prev/next]    arrow buttons
 *   [data-carousel-dots]         dot container (filled here, empty in markup)
 *
 * The track is a CSS scroll-snap row, so wheel, trackpad, touch and keyboard
 * scrolling all work with this file absent. Everything below is enhancement.
 *
 * Zero dependencies.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initCarousel(root) {
    var track = root.querySelector(".carousel-track");
    if (!track) return;

    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var loop = root.getAttribute("data-loop") === "true";
    var wantsDots = root.getAttribute("data-dots") === "true";
    // The dots container is a SIBLING of .carousel, not a child — it sits below
    // the card, outside the arrows' positioning context.
    var dotsBox = wantsDots
      ? (root.parentNode || document).querySelector("[data-carousel-dots]")
      : null;

    var slides = Array.prototype.slice.call(track.children);
    var count = slides.length;
    if (!count) return;

    var index = 0; // current REAL slide

    // ---- Looping ------------------------------------------------------------
    // A clone of the last slide goes before the first and a clone of the first
    // after the last, so the track reads [ last' | 0 1 2 | first' ]. Stepping
    // off either end animates FORWARD into the adjacent clone rather than
    // rewinding across the whole strip; once scrolling settles we jump silently
    // onto the clone's real twin. Clone and twin are pixel-identical, so the
    // reset is invisible and no blank slide is ever shown.
    if (loop && count > 1) {
      track.insertBefore(cloneSlide(slides[count - 1]), slides[0]);
      track.appendChild(cloneSlide(slides[0]));
    }

    function cloneSlide(node) {
      var c = node.cloneNode(true);
      c.classList.add("carousel-clone");
      c.setAttribute("aria-hidden", "true");
      c.setAttribute("tabindex", "-1");
      // Strip the href so a duplicated case-study link can't be read by a
      // screen reader or activated twice.
      c.removeAttribute("href");
      return c;
    }

    // Track position of a real slide — offset by one when a leading clone exists.
    function posOf(i) {
      return loop && count > 1 ? i + 1 : i;
    }

    // One slide plus one gap, measured live so it survives any CSS change.
    function slideWidth() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return slides[0].getBoundingClientRect().width + gap;
    }

    function scrollToPos(pos, smooth) {
      var w = slideWidth();
      if (!w) return;
      track.scrollTo({
        left: pos * w,
        // "instant", NOT "auto": per spec "auto" defers to CSS, and the track
        // sets scroll-behavior:smooth — so "auto" would animate the silent
        // clone→twin reset as a visible rewind across the whole strip.
        behavior: smooth && !reduce ? "smooth" : "instant",
      });
    }

    // ---- Dots ---------------------------------------------------------------
    function buildDots() {
      if (!dotsBox) return;
      slides.forEach(function (slide, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", labelFor(slide, i));
        dot.addEventListener("click", function () {
          goTo(i, true);
        });
        dotsBox.appendChild(dot);
      });
    }

    // Announce the dot by what it shows, not "slide 3". Falls back gracefully
    // when a slide has no obvious title.
    function labelFor(slide, i) {
      var link = slide.querySelector(".project-card-link, .testimonial-name");
      if (!link) return "Show slide " + (i + 1);
      return "Show " + link.textContent.replace(/^\s*Explore\s+/i, "").trim();
    }

    function paintDots() {
      if (!dotsBox) return;
      var ds = dotsBox.children;
      for (var i = 0; i < ds.length; i++) {
        if (i === index) ds[i].setAttribute("aria-current", "true");
        else ds[i].removeAttribute("aria-current");
      }
    }

    // ---- Arrows -------------------------------------------------------------
    // Looping carousels never disable their arrows — there is no end to clamp
    // at. Non-looping ones disable at the edges and hide entirely when nothing
    // overflows.
    function syncArrows() {
      if (loop || !prev || !next) return;
      var max = track.scrollWidth - track.clientWidth;
      var fits = max <= 1;
      prev.hidden = fits;
      next.hidden = fits;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max - 1;
    }

    function step(dir) {
      if (loop) {
        var target = posOf(index) + dir; // 0 or count+1 when wrapping
        index = (index + dir + count) % count;
        paintDots();
        scrollToPos(target, true);
      } else {
        track.scrollBy({ left: dir * slideWidth(), behavior: reduce ? "auto" : "smooth" });
      }
    }

    function goTo(i, smooth) {
      index = ((i % count) + count) % count;
      paintDots();
      scrollToPos(posOf(index), smooth);
    }

    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });

    // ---- Settle -------------------------------------------------------------
    // Runs once scrolling stops, from ANY source (arrow, dot, wheel, touch,
    // keys). Parked on a clone → jump silently to its real twin. Parked on a
    // real slide → adopt it, which is what keeps the dots honest during free
    // scrolling.
    var settleTimer = null;
    function onSettle() {
      var w = slideWidth();
      if (!w) return;
      var pos = Math.round(track.scrollLeft / w);
      if (loop && count > 1) {
        if (pos <= 0) {
          index = count - 1;
          scrollToPos(posOf(index), false);
        } else if (pos >= count + 1) {
          index = 0;
          scrollToPos(posOf(index), false);
        } else {
          index = pos - 1;
        }
      } else {
        index = Math.min(Math.max(pos, 0), count - 1);
      }
      paintDots();
    }

    track.addEventListener("scroll", function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(onSettle, 140);
      syncArrows();
    }, { passive: true });

    // ---- Init ---------------------------------------------------------------
    buildDots();
    paintDots();
    syncArrows();
    if (loop) scrollToPos(posOf(0), false); // start on the first REAL slide

    var resizing = false;
    window.addEventListener("resize", function () {
      if (resizing) return;
      resizing = true;
      requestAnimationFrame(function () {
        resizing = false;
        scrollToPos(posOf(index), false); // slide width changed — re-anchor
        syncArrows();
      });
    });

    // Card widths depend on the webfont for their text, so a load reflow can
    // still change scrollWidth — re-check once everything settles.
    window.addEventListener("load", function () {
      scrollToPos(posOf(index), false);
      syncArrows();
    });
  }

  var roots = document.querySelectorAll("[data-carousel]");
  Array.prototype.forEach.call(roots, initCarousel);
})();
