/* V4 404 — src/404.njk. The window opens as the hero's does: hovered with a
 * mouse, tapped on touch, focused from the keyboard; it closes when the
 * pointer leaves, on a tap elsewhere, or on Escape. Open, the stars join up
 * into a 404 (_404.css).
 */
(function () {
  "use strict";

  var view = document.querySelector("[data-404-window]");
  if (!view) return;
  var hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");

  function set(open) { view.classList.toggle("is-open", open); }

  view.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse" && hoverable.matches) set(true); });
  view.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && hoverable.matches) set(false); });
  view.addEventListener("click", function () { if (!hoverable.matches) set(!view.classList.contains("is-open")); });
  document.addEventListener("click", function (e) { if (!hoverable.matches && !view.contains(e.target)) set(false); });
  view.addEventListener("focus", function () { if (view.matches(":focus-visible")) set(true); });
  view.addEventListener("blur", function () { if (!view.matches(":hover")) set(false); });
  view.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { set(false); view.blur(); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(!view.classList.contains("is-open")); }
  });
})();
