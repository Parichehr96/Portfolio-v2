/* ABOUT EYES — the illustration's pupils follow the cursor.
 *
 * WHY THERE IS AN OVERLAY AT ALL. illustration-pari.svg is not vector art: it
 * is 856 bytes of wrapper around a base64 PNG, byte-identical to the .png the
 * page already loads. There is no pupil element to move, and inside the raster
 * the pupil is a single dark blob FUSED to the lash line above it — no gap, no
 * eye-white, no lower lid. So the markup paints the baked pupil out with a
 * face-coloured patch and draws a fresh one on top; this file only moves it.
 *
 * WHAT LIMITS THE TRAVEL. Not an eye-white — the artwork has none. The pupil is
 * held by the lash swoosh it hangs from, and past about three units it stops
 * reading as attached and starts reading as a dot on a cheek. Hence a clamp
 * measured off the drawing rather than a fraction of some radius.
 *
 * DESKTOP POINTERS ONLY. The CSS hides the overlay entirely unless the device
 * has a fine hovering pointer, which leaves the original artwork untouched on
 * a phone rather than swapping it for a static copy of itself. This file makes
 * the same check before it binds anything, so a touch device does no work.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-about-eyes]");
  if (!root || !root.getAttribute) return;

  var pupils = [].slice.call(root.querySelectorAll("[data-pupil]"));
  if (!pupils.length) return;

  /* The viewBox is 528 x 622 — the same space about.njk and _about.css use, so
     these are the numbers measured off the comp, not screen pixels. */
  var VIEW_W = 528;
  var MAX_X = 3; /* how far a pupil may slide before it leaves the lash */
  var MAX_Y = 1.2; /* less vertically, and it is the pupil's height that sets
                      the ceiling: drop it further than this and its top clears
                      the lash's underside, opening a white seam across the eye */
  var RAMP = 220; /* px over which deflection grows in, so a cursor resting on
                     the face does not snap the eyes to a hard stop */
  var EASE = 0.14; /* lerp factor per frame */
  var SETTLED = 0.005; /* below this the pupil is where it was asked to be */

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var eyes = pupils.map(function (el) {
    return {
      el: el,
      /* Its home, straight off the element — one source of truth for the
         resting position, and it is the markup's. */
      cx: parseFloat(el.getAttribute("cx")),
      cy: parseFloat(el.getAttribute("cy")),
      screenX: 0,
      screenY: 0,
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    };
  });

  var pointerX = 0;
  var pointerY = 0;
  var havePointer = false;
  var needsMeasure = true;
  var frame = 0;
  var bound = false;

  function measure() {
    var box = root.getBoundingClientRect();
    if (!box.width) return false;
    /* CSS px per viewBox unit. The overlay is stretched to the figure, so one
       ratio covers both axes. */
    var unit = box.width / VIEW_W;
    for (var i = 0; i < eyes.length; i++) {
      eyes[i].screenX = box.left + eyes[i].cx * unit;
      eyes[i].screenY = box.top + eyes[i].cy * unit;
    }
    return true;
  }

  function retarget() {
    for (var i = 0; i < eyes.length; i++) {
      var e = eyes[i];
      if (!havePointer) {
        e.targetX = 0;
        e.targetY = 0;
        continue;
      }
      var dx = pointerX - e.screenX;
      var dy = pointerY - e.screenY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.5) {
        e.targetX = 0;
        e.targetY = 0;
        continue;
      }
      /* Direction only, then scaled per axis — which lands the offset exactly
         on the MAX_X/MAX_Y ellipse, so the clamp is the shape of the travel
         rather than a square the corners of which the pupil could never use. */
      var reach = dist < RAMP ? dist / RAMP : 1;
      e.targetX = (dx / dist) * MAX_X * reach;
      e.targetY = (dy / dist) * MAX_Y * reach;
    }
  }

  function tick() {
    frame = 0;

    if (needsMeasure) {
      needsMeasure = false;
      if (measure()) retarget();
    }

    var moving = false;
    for (var i = 0; i < eyes.length; i++) {
      var e = eyes[i];
      e.x += (e.targetX - e.x) * EASE;
      e.y += (e.targetY - e.y) * EASE;
      if (
        Math.abs(e.targetX - e.x) > SETTLED ||
        Math.abs(e.targetY - e.y) > SETTLED
      ) {
        moving = true;
      } else {
        e.x = e.targetX;
        e.y = e.targetY;
      }
      e.el.setAttribute(
        "transform",
        "translate(" + e.x.toFixed(3) + " " + e.y.toFixed(3) + ")"
      );
    }

    if (moving) schedule();
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(tick);
  }

  function onPointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    havePointer = true;
    retarget();
    schedule();
  }

  function onPointerLeave() {
    /* Cursor gone from the document: look straight ahead again rather than
       holding the last glance, which reads as a stare. */
    havePointer = false;
    retarget();
    schedule();
  }

  /* Scroll and resize move the eyes, not the cursor — so the centres go stale
     while clientX/clientY stay valid. Flagged rather than measured here, so a
     scroll never forces layout more than once a frame. */
  function onReflow() {
    needsMeasure = true;
    schedule();
  }

  function centre() {
    for (var i = 0; i < eyes.length; i++) {
      eyes[i].x = eyes[i].y = eyes[i].targetX = eyes[i].targetY = 0;
      eyes[i].el.removeAttribute("transform");
    }
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onReflow, { passive: true });
    window.addEventListener("resize", onReflow, { passive: true });
    needsMeasure = true;
    schedule();
  }

  function unbind() {
    if (!bound) return;
    bound = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("scroll", onReflow);
    window.removeEventListener("resize", onReflow);
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    havePointer = false;
    centre();
  }

  function apply() {
    if (fine.matches && !still.matches) bind();
    else unbind();
  }

  /* Both gates are live: a reduced-motion preference can be toggled mid-session
     and a hybrid laptop can gain or lose its mouse. addEventListener on a media
     query list is the modern spelling; addListener is there for older Safari. */
  function watch(query) {
    if (query.addEventListener) query.addEventListener("change", apply);
    else if (query.addListener) query.addListener(apply);
  }
  watch(fine);
  watch(still);

  apply();
})();
