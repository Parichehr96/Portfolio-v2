/* V4 About folders — v4/folder.njk, _about.css.
 *
 * Click a folder to open it (its contents slide out), click again to close
 * (they slide back in). The animation is all CSS; this only toggles the
 * state and keeps aria-expanded and the button's label in step.
 */
(function () {
  "use strict";

  Array.prototype.slice.call(document.querySelectorAll("[data-folder]")).forEach(function (folder) {
    var name = (folder.getAttribute("aria-label") || "").split(":")[0];

    folder.addEventListener("click", function () {
      var open = !folder.classList.contains("is-open");
      folder.classList.toggle("is-open", open);
      folder.setAttribute("aria-expanded", open ? "true" : "false");
      folder.setAttribute("aria-label", name + (open ? ": close the folder" : ": open the folder"));
    });
  });
})();
