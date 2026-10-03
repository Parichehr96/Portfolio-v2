/* V4 About folders — v4/folder.njk, _about.css.
 *
 * Click a folder to open it (its contents slide out), click again to close
 * (they slide back in). The animation is all CSS; this only toggles the
 * state and keeps aria-expanded and the button's label in step.
 *
 * FIT. The folders are drawn at the comp's size (Services is 385 wide). On a
 * screen too narrow for the widest, both scale down together, by CSS zoom,
 * to fit the column, the way the project panels shrink with the screen.
 * Zoom scales everything inside (flap, clip paths, the pieces that slide
 * out), so the folders look and move exactly as they do full size.
 */
(function () {
  "use strict";

  var folders = Array.prototype.slice.call(document.querySelectorAll("[data-folder]"));
  var row = document.querySelector(".v4-about__cards");
  var toolFolders = Array.prototype.slice.call(document.querySelectorAll("tool-folder"));
  var TOOL_FOLDER_W = 196.3; // <tool-folder> at scale 1

  function fit() {
    if (!row || !(folders.length || toolFolders.length)) return;
    var widest = 0;
    folders.forEach(function (f) {
      widest = Math.max(widest, parseFloat(getComputedStyle(f).getPropertyValue("--w")) || 0);
    });
    if (toolFolders.length) widest = Math.max(widest, TOOL_FOLDER_W);
    var scale = widest ? Math.min(1, row.clientWidth / widest) : 1;
    folders.forEach(function (f) { f.style.zoom = scale < 1 ? scale.toFixed(4) : ""; });
    // <tool-folder> scales itself (its `scale` attribute), so the same factor.
    toolFolders.forEach(function (t) {
      if (scale < 1) t.setAttribute("scale", scale.toFixed(4));
      else t.removeAttribute("scale");
    });
  }

  fit();
  window.addEventListener("resize", fit);

  folders.forEach(function (folder) {
    var name = (folder.getAttribute("aria-label") || "").split(":")[0];

    folder.addEventListener("click", function () {
      var open = !folder.classList.contains("is-open");
      folder.classList.toggle("is-open", open);
      folder.setAttribute("aria-expanded", open ? "true" : "false");
      folder.setAttribute("aria-label", name + (open ? ": close the folder" : ": open the folder"));
    });
  });
})();
