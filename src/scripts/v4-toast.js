/* V4 toast — Figma 1126:30853.
 *
 * Closes the toast and remembers it per message (its data-toast id). The
 * returning-visitor check runs earlier, inline in layouts/v4.njk, so the
 * toast is hidden before first paint. A new message gets a new id in
 * _data/home.js, so it shows again.
 *
 * Storage can throw (private mode, blocked site data); every access is guarded
 * and a failure only means the toast shows again next visit.
 */
(function () {
  "use strict";

  var toast = document.querySelector("[data-toast]");
  if (!toast) return;

  var key = "v4-toast-dismissed:" + toast.getAttribute("data-toast");

  var close = toast.querySelector("[data-toast-close]");
  if (!close) return;
  close.addEventListener("click", function () {
    toast.hidden = true;
    try {
      localStorage.setItem(key, "1");
    } catch (e) {}
  });
})();
