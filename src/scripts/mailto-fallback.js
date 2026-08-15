/**
 * Mailto fallback → Gmail web compose.
 *
 * A plain `mailto:` link only does something if the visitor's browser/OS has a
 * default mail handler registered. When none is, clicking it appears to do
 * nothing. This delegated handler keeps the native behaviour as the primary
 * path and falls back to Gmail's web compose only when the native attempt
 * clearly did nothing.
 *
 * How "did nothing" is detected: if a mail app (or the browser's protocol
 * dialog) opens, the page loses focus / becomes hidden. So we start the native
 * attempt, then wait 1.5s — if the page is STILL focused and visible, no
 * handler responded and we open Gmail compose in a new tab. The open() call
 * fires ~1.5s after the click, well inside the browser's transient user-
 * activation window (~5s), so it is not treated as an unsolicited popup.
 *
 * Delegated on `document`, so it also covers any mailto links added later.
 */
(function () {
  "use strict";

  var FALLBACK_MS = 1500;
  var GMAIL_COMPOSE = "https://mail.google.com/mail/?view=cm&fs=1&to=";

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!link) return;

    // Leave alone: already-handled clicks, non-primary buttons, and
    // modifier-clicks (the visitor is deliberately asking for native/new-tab).
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    var href = link.getAttribute("href");
    // Recipient = everything between "mailto:" and any "?subject=..." tail.
    var addr = href.slice("mailto:".length).split("?")[0];
    if (!addr) return; // malformed — let the browser handle it natively

    e.preventDefault();

    var settled = false;
    var timer = window.setTimeout(function () {
      if (settled) return;
      cleanup();
      // Still here after 1.5s → no mail handler responded. Open Gmail compose.
      window.open(GMAIL_COMPOSE + encodeURIComponent(addr), "_blank", "noopener");
    }, FALLBACK_MS);

    function settle() {
      if (settled) return;
      settled = true;
      cleanup();
    }
    function onVisibility() {
      if (document.hidden) settle();
    }
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("blur", settle);
      document.removeEventListener("visibilitychange", onVisibility);
    }

    // A launching mail app / protocol dialog blurs or hides the page → cancel
    // the fallback so we never double-open.
    window.addEventListener("blur", settle);
    document.addEventListener("visibilitychange", onVisibility);

    // Fire the native mailto attempt.
    window.location.href = href;
  });
})();
