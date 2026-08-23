/* THE HEADER'S LIGHT/DARK VARIANT, and which nav item is current.
 *
 * Two jobs, one file, because both answer the same question — which section is
 * the page currently at? — and running two observers off one section list is
 * cheaper and less likely to disagree than two scripts each finding their own.
 *
 * ---------------------------------------------------------------------------
 * 1. THE VARIANT (Figma 446:37196)
 *
 * The header is sticky, so it passes over sections rather than belonging to
 * one. Its palette is a function of POSITION, not identity: light over the hero
 * and About, dark over My Work. Each section declares which it is with
 * data-header-theme, derived from the palette it already claims in tokens.css,
 * so there is no second list of "dark sections" to keep in sync.
 *
 * A ONE-PIXEL TRIPLINE, NOT "the most visible section". The obvious observer
 * reports whichever section occupies most of the viewport, which is the wrong
 * question — a tall section can win that while a different one sits under the
 * header. What matters is only what is directly beneath the bar. So the root is
 * collapsed with rootMargin to a 1px band at the header's bottom edge:
 *
 *     top    -HEADER            push the top of the root down past the header
 *     bottom -(viewport - HEADER - 1)   pull the bottom up to 1px below it
 *
 * Exactly one section can intersect that band, and it is by construction the
 * one the header is on top of. threshold 0, because any intersection with a 1px
 * band is total.
 *
 * The band depends on viewport height, so it is rebuilt on resize. Nothing is
 * read during scroll — no scroll listener, no getBoundingClientRect in a hot
 * path.
 *
 * ---------------------------------------------------------------------------
 * 2. THE CURRENT ITEM (Figma 410:66301, Selected)
 *
 * The v2 bottom nav had a scroll-spy in scripts/nav.js; it was deleted with the
 * bar it drove and nothing replaced it, so this is written fresh rather than
 * repointed. It sets aria-current, and _nav.css styles [aria-current] — so the
 * state is announced to a screen reader rather than only painted, and there is
 * no is-active class duplicating what an ARIA attribute already means.
 *
 * WIRED GENERICALLY, WHICH MATTERS FOR CONTACT. The header links at /#contact,
 * but the footer that owns that id is not built yet. Rather than special-casing
 * it, the spy observes whichever targets actually resolve in the document:
 * today it tracks two, and the day the footer lands it tracks three with no
 * edit here. Links whose target is missing are simply never marked — which is
 * also what makes the header correct on /work/* and /projects, where none of
 * these sections exist.
 *
 * "Current" is the LAST section to have crossed the tripline, held until
 * another crosses it. Marking on intersection alone would clear the highlight
 * in the gaps between sections and flicker the bar.
 */
(function (window, document) {
  "use strict";

  var header = document.querySelector(".site-header");
  if (!header) return;

  var sections = Array.prototype.slice.call(
    document.querySelectorAll("[data-header-theme]")
  );
  if (!sections.length) return;

  // Only links whose target is actually in this document. See the note on
  // Contact above — a missing section means a link that never lights up.
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".site-header__link[data-spy]")
  ).filter(function (link) {
    return document.getElementById(link.getAttribute("data-spy"));
  });

  function setTheme(theme) {
    if (header.getAttribute("data-theme") !== theme) {
      header.setAttribute("data-theme", theme);
    }
  }

  function setCurrent(id) {
    links.forEach(function (link) {
      if (link.getAttribute("data-spy") === id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // Without IntersectionObserver the header keeps the light variant it shipped
  // with and no item is marked. Both are honest defaults: the page opens on the
  // hero, which is light, and "no section highlighted" beats a wrong one.
  if (!("IntersectionObserver" in window)) return;

  var observer = null;

  function observe() {
    if (observer) observer.disconnect();

    // The band has to be measured, not assumed: --header-height is a token, but
    // the header also carries a border and can wrap at narrow widths.
    var headerH = header.getBoundingClientRect().height;
    var below = Math.max(0, window.innerHeight - headerH - 1);

    observer = new window.IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var section = entry.target;
          setTheme(section.getAttribute("data-header-theme") || "light");
          if (section.id) setCurrent(section.id);
        });
      },
      { rootMargin: "-" + headerH + "px 0px -" + below + "px 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  observe();

  // Rebuilt rather than adjusted, because rootMargin is fixed at construction.
  // Debounced: a drag-resize fires this continuously and each rebuild re-tests
  // every section.
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(observe, 150);
  });
})(window, document);
