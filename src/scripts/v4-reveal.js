/* V4 homepage entrance — _reveal.css, layouts/v4.njk.
 *
 * Blocks arrive one after another as they come into view. Whatever comes
 * into view together (the whole first screen at load, or a project row
 * scrolled to) is revealed in page order, STAGGER apart, the clock right
 * after the intro. A project's
 * thumbnails follow its name, one by one, even those still off to the right
 * in the strip. Runs only when the head script set html.js-reveal.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  if (!root.classList.contains("js-reveal")) return;

  var STAGGER = 0.07; // s
  var blocks = Array.prototype.slice.call(document.querySelectorAll(
    ".v4-rail, .v4-intro__name, .v4-intro__bio, .v4-intro__meta, .v4-status, .v4-label, .v4-project__head"
  ));

  // The clock comes earlier in the page source (its dock is a side column)
  // but should arrive with the intro, just after the location and email.
  var meta = document.querySelector(".v4-intro__meta");
  function anchor(el) {
    return meta && el.classList.contains("v4-status") ? meta : el;
  }

  function show(list) {
    list.forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", (i * STAGGER).toFixed(2) + "s");
      el.classList.add("is-in");
    });
  }

  if (!("IntersectionObserver" in window)) {
    root.classList.add("is-revealed");
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    var batch = entries
      .filter(function (e) { return e.isIntersecting; })
      .map(function (e) { io.unobserve(e.target); return e.target; })
      .sort(function (a, b) {
        var pa = anchor(a), pb = anchor(b);
        if (pa === pb) return a === pa ? -1 : 1;
        return pa.compareDocumentPosition(pb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
    var list = [];
    batch.forEach(function (el) {
      list.push(el);
      // A project's thumbnails follow its name.
      if (el.classList.contains("v4-project__head")) {
        var row = el.closest(".v4-project");
        if (row) list.push.apply(list, row.querySelectorAll(".v4-project__panel"));
      }
    });
    if (list.length) show(list);
  }, { rootMargin: "0px 0px -8% 0px" });

  blocks.forEach(function (el) { io.observe(el); });
})();
