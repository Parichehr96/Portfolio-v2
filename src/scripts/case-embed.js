/* CASE EMBEDS — make the box hug its document on BOTH axes.
 *
 * WHAT THE CSS ALONE COULD NOT DO. media-slot.njk writes four constants per
 * embed — --embed-w/h (the comp's slot) and --nat-w/h (the document's measured
 * size) — and _case-study-v2.css derives a scale from them. That works only
 * while both numbers stay true, and neither did:
 *
 *   VERTICALLY, --nat-h is a number somebody measured once. alert-routing's
 *   document actually lays out 617 tall against the 606 recorded for it, so the
 *   last 11px were clipped by the iframe. The other two are the same bug in the
 *   other direction: their slots are SHORTER than their documents (430 vs 438,
 *   392 vs 456), so the scale shrank them to 98% and 86% to fit a height that
 *   was never the content's.
 *
 *   HORIZONTALLY, the scale is computed from --embed-w, a constant, while the
 *   slot itself is `width: 100%` and shrinks with its column. Between roughly
 *   1000px and 1280px of viewport the slot drops to 530/438/387 while the iframe
 *   keeps painting at its full 635, and .case-embed's overflow:hidden cuts
 *   100-250px off the right edge — which is the Component column disappearing.
 *
 * SO THIS MEASURES INSTEAD OF TRUSTING. Same-origin local documents, so the
 * content is readable: take the document's real scrollWidth/scrollHeight, size
 * the iframe to exactly that, scale by the slot's REAL width, and set the slot's
 * height to the scaled result. The box then hugs the content on both axes at
 * every viewport, and nothing is ever clipped or scrolled.
 *
 * THE CONSTANTS STAY AS THE PRE-JS RENDER. --embed-w/h still set the slot's
 * min-height and max-width in CSS, so the box occupies roughly the right space
 * before this runs and the page does not jump. If the script never loads, the
 * old fixed-slot behaviour is what remains — degraded, not broken.
 *
 * Zero dependencies, plain <script defer>, same as everything else here.
 */
(function (window, document) {
  "use strict";

  var boxes = [].slice.call(document.querySelectorAll(".case-embed"));
  if (!boxes.length) return;

  /* One measure pass for one embed. Cheap enough to run on every resize tick:
     two reads off the child document and three style writes, no layout thrash
     beyond what setting the height already costs. */
  function fit(box) {
    var frame = box.querySelector(".case-embed__frame");
    if (!frame) return;

    var doc;
    try {
      doc = frame.contentDocument;
    } catch (e) {
      return; // cross-origin — leave the CSS fallback in place
    }
    if (!doc || !doc.body) return;

    /* GROW ONLY — NEVER SHRINK BELOW THE DECLARED SIZE, and that rule is not
       caution, it is correctness. The first version of this cleared the iframe's
       height to `auto` before measuring, on the theory that a document reports
       its true height best when nothing constrains it. That is true only of
       documents whose height comes from their content. Challenquiz's
       prototype.html sizes itself against the VIEWPORT, so measuring it inside a
       collapsed frame made it report 497 where it needs 671 — and the box then
       clipped 174px off a page this was never supposed to touch.

       So the declared --nat-w/h stay the floor. They are a real measurement of
       each document, just a stale one; the job here is to catch the cases where
       the document outgrew them, not to re-derive them from scratch. max() does
       exactly that: alert-routing's 617 beats its recorded 606 and the box
       grows, while prototype.html measures no larger than its 970 and is left
       exactly where batch G put it. */
    var declW = parseFloat(getComputedStyle(box).getPropertyValue("--nat-w")) || 0;
    var declH = parseFloat(getComputedStyle(box).getPropertyValue("--nat-h")) || 0;

    var natW = Math.max(
      declW,
      doc.documentElement.scrollWidth,
      doc.body.scrollWidth
    );
    if (!natW) return;
    frame.style.width = natW + "px";

    /* Height is read AFTER the width is settled — the height a document comes to
       depends on the width it wraps at. */
    var natH = Math.max(
      declH,
      doc.documentElement.scrollHeight,
      doc.body.scrollHeight
    );
    if (!natH) return;
    frame.style.height = natH + "px";

    /* SCALE COMES FROM THE SLOT'S REAL WIDTH, not from --embed-w. clientWidth
       rather than getBoundingClientRect().width so a transform on an ancestor
       cannot feed its own scaling back in. Never scale UP: a document narrower
       than its slot sits at its own size rather than being blown up soft. */
    var slotW = box.clientWidth;
    var scale = slotW > 0 ? Math.min(1, slotW / natW) : 1;

    frame.style.setProperty("--fit-scale", String(scale));
    /* The box hugs: its height is whatever the scaled document comes to. This is
       what replaces the aspect-ratio the CSS used to impose.

       min-height IS CLEARED HERE, and it has to be. The CSS floors the box at
       --embed-h so the band reserves roughly the right space before this runs —
       but that floor is the comp's height, and a document scaled down to fit a
       narrow column is SHORTER than it. Left in place it padded the box with
       dead space: at a 387px slot alert-routing painted 369 tall inside a box
       still held open to 606. The reservation has done its job by the time we
       have a real number. */
    box.style.minHeight = "0px";
    box.style.height = Math.ceil(natH * scale) + "px";
  }

  function fitAll() {
    for (var i = 0; i < boxes.length; i++) fit(boxes[i]);
  }

  boxes.forEach(function (box) {
    var frame = box.querySelector(".case-embed__frame");
    if (!frame) return;

    /* An iframe that is already complete fires no load event, so both paths are
       needed — `load` for the normal case, an immediate call for a document that
       arrived from cache before this script ran. */
    frame.addEventListener("load", function () {
      fit(box);
      watch(box, frame);
    });
    if (frame.contentDocument && frame.contentDocument.readyState === "complete") {
      fit(box);
      watch(box, frame);
    }
  });

  /* CONTENT THAT MOVES AFTER LOAD. alert-routing invites a hover that reveals a
     component, and a reveal changes the document's height — so a one-shot
     measurement at load would be right for exactly as long as nobody used it.
     One observer on the child's <body> keeps the box hugging through that; a
     second on the slot catches the column changing width without the window
     resizing (the ≤900 tier reflowing, a container query, a font swap). */
  function watch(box, frame) {
    if (box.dataset.embedWatched) return;
    box.dataset.embedWatched = "1";
    if (!window.ResizeObserver) return;

    var doc;
    try {
      doc = frame.contentDocument;
    } catch (e) {
      return;
    }
    if (!doc || !doc.body) return;

    var ro = new window.ResizeObserver(function () {
      fit(box);
    });
    ro.observe(doc.body);
    ro.observe(box);
  }

  /* Resize is coalesced to one measure per frame — a drag across a breakpoint
     fires dozens of events and each one would otherwise cost every embed a
     reflow of its child document. */
  var frame = 0;
  window.addEventListener("resize", function () {
    if (frame) return;
    frame = window.requestAnimationFrame(function () {
      frame = 0;
      fitAll();
    });
  });

  /* Webfonts land after first paint and can change a document's height. The
     promise is guarded because it is absent in older Safari. */
  if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
    document.fonts.ready.then(fitAll);
  }

  fitAll();
})(window, document);
