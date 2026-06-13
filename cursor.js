/**
 * Shared custom cursor — included on EVERY page (index + every case study).
 *
 * A cream follower dot (desktop only) that replaces the system cursor. On
 * index.html it additionally reveals the hidden splash tagline like a flashlight
 * over invisible ink; on pages without a tagline (case studies) it's just the
 * smooth-following cream dot — every reveal branch is guarded by the presence of
 * `.invisible-text`, so the same code is safe everywhere.
 *
 * Layering — three stacked pieces:
 *   • .invisible-text (in #splash, index only) — the real tagline, fully
 *     transparent so it's invisible over both the page bg AND the visible lead
 *     sentence it overlaps, but in the DOM and selectable for a11y.
 *   • .custom-cursor (z 9998) — the cream circle. Follows the mouse with a 0.35
 *     lerp and grows to 120px while over the tagline.
 *   • .cursor-reveal (z 9999, ABOVE the cursor) — a body-level clone of the
 *     tagline in dark ink, positioned over the original and clipped to a circle
 *     at the cursor. Where it overlaps the cream circle the dark text reads;
 *     everywhere else it's dark-on-dark and invisible.
 *
 * Styles live in the shared styles.css (.custom-cursor / .cursor-reveal). Only
 * runs on fine-pointer / hover devices; touch keeps the system cursor.
 * Respects prefers-reduced-motion by snapping (lerp = 1) instead of smoothing.
 */
function initCustomCursor() {
  // Desktop pointers only — leave touch/coarse devices with the system cursor.
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  const splash = document.getElementById("splash");
  const tagline = document.querySelector(".invisible-text"); // hidden tagline (Layer B)
  const lead = document.querySelector(".splash-lead");       // visible sentence (Layer A)
  const name = document.querySelector(".splash-name");       // visible title (Layer A)

  // Dark clone of the tagline that sits above the cursor and gets clipped.
  let reveal = null;
  if (tagline) {
    reveal = tagline.cloneNode(true);
    reveal.classList.add("cursor-reveal");
    reveal.removeAttribute("id");
    reveal.setAttribute("aria-hidden", "true");
    document.body.appendChild(reveal);
  }

  const REVEAL_RADIUS = 60; // half of the 120px expanded cursor
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LERP = reduceMotion ? 1 : 0.35;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;
  let shown = false;
  // Cached bounding boxes (re-measured on resize/scroll). offsetParent is null
  // once the splash is display:none (dismissed) → null rect.
  let tRect = null;    // hidden tagline (Layer B)
  let lRect = null;    // visible lead sentence (Layer A)
  let nRect = null;    // visible title (Layer A)
  let zoneRect = null; // spotlight trigger zone = lead ∪ tagline

  const visRect = (el) =>
    el && el.offsetParent !== null ? el.getBoundingClientRect() : null;
  const union = (a, b) => {
    if (!a) return b;
    if (!b) return a;
    return {
      left: Math.min(a.left, b.left),
      top: Math.min(a.top, b.top),
      right: Math.max(a.right, b.right),
      bottom: Math.max(a.bottom, b.bottom),
    };
  };

  const measure = () => {
    tRect = visRect(tagline);
    lRect = visRect(lead);
    nRect = visRect(name);
    if (reveal && tRect) {
      reveal.style.left = tRect.left + "px";
      reveal.style.top = tRect.top + "px";
      reveal.style.width = tRect.width + "px";
      reveal.style.height = tRect.height + "px";
    }
    zoneRect = union(tRect, lRect);
  };
  measure();

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!shown) {
      shown = true;
      cursor.style.opacity = "1";
    }
  });
  // Hide the dot when the pointer leaves the window; restore on return.
  document.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });
  document.addEventListener("mouseenter", () => { if (shown) cursor.style.opacity = "1"; });
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", measure, { passive: true });

  const splashGone = () => splash && splash.style.display === "none";

  // Inverse mask: punch a transparent hole at the cursor into a visible layer
  // (title / lead) so it vanishes inside the spotlight; --mr 0 = fully visible.
  const setMask = (el, r, on) => {
    if (!el) return;
    if (on && r) {
      el.style.setProperty("--mx", curX - r.left + "px");
      el.style.setProperty("--my", curY - r.top + "px");
      el.style.setProperty("--mr", REVEAL_RADIUS + "px");
    } else {
      el.style.setProperty("--mr", "0px");
    }
  };

  const frame = () => {
    curX += (mouseX - curX) * LERP;
    curY += (mouseY - curY) * LERP;
    cursor.style.transform =
      "translate(" + curX + "px, " + curY + "px) translate(-50%, -50%)";

    // Spotlight active when the pointer is over the middle text block (visible
    // lead sentence ∪ hidden tagline), while the splash is still showing.
    const over =
      !!zoneRect &&
      !splashGone() &&
      mouseX >= zoneRect.left && mouseX <= zoneRect.right &&
      mouseY >= zoneRect.top && mouseY <= zoneRect.bottom;

    cursor.classList.toggle("is-over", over);

    // Layer B (tagline) APPEARS inside the circle (clipped to its own box).
    if (reveal) {
      reveal.style.clipPath = over && tRect
        ? "circle(" + REVEAL_RADIUS + "px at " + (curX - tRect.left) + "px " + (curY - tRect.top) + "px)"
        : "circle(0px at 0 0)";
    }
    // Layer A (visible title + lead) DISAPPEARS inside the circle.
    setMask(lead, lRect, over);
    setMask(name, nRect, over);

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

document.addEventListener("DOMContentLoaded", initCustomCursor);
