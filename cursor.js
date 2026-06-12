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
 *   • .invisible-text (in #splash, index only) — the real tagline, coloured like
 *     the page bg so it's invisible, but in the DOM and selectable for a11y.
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
  const tagline = document.querySelector(".invisible-text");

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
  let rect = null; // cached tagline bounding box

  const measure = () => {
    // offsetParent is null once the splash is display:none (dismissed) → no rect.
    rect = tagline && tagline.offsetParent !== null ? tagline.getBoundingClientRect() : null;
    if (reveal && rect) {
      reveal.style.left = rect.left + "px";
      reveal.style.top = rect.top + "px";
      reveal.style.width = rect.width + "px";
      reveal.style.height = rect.height + "px";
    }
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

  const frame = () => {
    curX += (mouseX - curX) * LERP;
    curY += (mouseY - curY) * LERP;
    cursor.style.transform =
      "translate(" + curX + "px, " + curY + "px) translate(-50%, -50%)";

    // Over the tagline (only while the splash is still showing)?
    const over =
      !!rect &&
      !splashGone() &&
      mouseX >= rect.left && mouseX <= rect.right &&
      mouseY >= rect.top && mouseY <= rect.bottom;

    cursor.classList.toggle("is-over", over);
    if (reveal) {
      reveal.style.clipPath = over
        ? "circle(" + REVEAL_RADIUS + "px at " + (curX - rect.left) + "px " + (curY - rect.top) + "px)"
        : "circle(0px at 0 0)";
    }

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

document.addEventListener("DOMContentLoaded", initCustomCursor);
