/* V4 analytics — what visitors do, sent to GA4 (G-JXCBH3PH93) and tagged in
 * Microsoft Clarity, so recordings can be filtered by the same names.
 *
 * Loaded by layouts/v4.njk, so the homepage and every case study. Which page
 * it is comes from <body data-page>: "home", or the case study's slug.
 *
 * Every call goes through track(), which does nothing when gtag or clarity is
 * missing (a blocker, offline, or no consent), so it never throws. It only
 * listens: it never cancels a click or changes what the page does.
 *
 * THE EVENTS (mark the first four as key events in GA4):
 *   download_resume        "My resume"                         { location }
 *   click_email            any mailto link                     { location }
 *   click_linkedin         LinkedIn                            { location }
 *   select_project         a project card or its name, home   { project, via: card | title }
 *   click_dribbble / click_behance                            { location }
 *   view_project           a project row half in view, once    { project }
 *   browse_thumbnails      a thumbnail moved, once per project { project, via: arrow | swipe | scroll | key }
 *   view_section           Work / About reached, once          { section }
 *   open_window            the sky window opened, once
 *   drag_sky               the light dragged, once
 *   open_folder            Tools / Services opened             { folder }
 *   dismiss_toast          the toast's ×
 *   view_case_study        a case study opened                 { case_study }
 *   case_section           a case section reached, once each   { case_study, section, index }
 *   finish_case_study      the end of a case study reached     { case_study }
 *   open_other_case        a link to another case study        { case_study, to }
 */
(function () {
  "use strict";

  function track(name, params) {
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, params || {});
      if (typeof window.clarity === "function") window.clarity("event", name);
    } catch (e) { /* analytics must never break the page */ }
  }

  var page = (document.body && document.body.getAttribute("data-page")) || "";
  var CASES = ["onton", "challenquiz", "connect2wow", "wow-design-system"];
  var isHome = page === "home";
  var isCase = CASES.indexOf(page) !== -1;

  // Fires `fn` once, the first time `el` is at least `share` in view; with no
  // share, once its top has passed two thirds of the way up the screen, which
  // works for a section of any height.
  function seen(el, share, fn) {
    if (!el || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); fn(); }
    }, share ? { threshold: share } : { rootMargin: "0px 0px -33% 0px", threshold: 0 });
    io.observe(el);
  }

  // Where on the page a link sits, for the contact events.
  function where(el) {
    if (el.closest(".v4-footer")) return "footer";
    if (el.closest(".v4-top, .v4-intro")) return "intro";
    if (el.closest(".v4-about")) return "about";
    return isCase ? "case" : "page";
  }

  function projectOf(el) {
    var row = el.closest(".v4-project");
    var id = row && row.getAttribute("aria-labelledby");
    return id ? id.replace(/^project-/, "") : "";
  }

  // ---- Clicks, every page (capture, so it runs before any handler stops it) --
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    if (t.closest("[data-toast-close]")) { track("dismiss_toast"); return; }

    var a = t.closest("a[href]");
    if (a) {
      var href = a.getAttribute("href") || "";
      if (a.hasAttribute("download") || /\.pdf($|\?)/i.test(href)) track("download_resume", { location: where(a) });
      else if (/^mailto:/i.test(href)) track("click_email", { location: where(a) });
      else if (/(^|\/\/|\.)linkedin\.com/i.test(href)) track("click_linkedin", { location: where(a) });
      else if (/(^|\/\/|\.)dribbble\.com/i.test(href)) track("click_dribbble", { location: where(a) });
      else if (/(^|\/\/|\.)behance\.net/i.test(href)) track("click_behance", { location: where(a) });
      else if (/^\/work\/[^/]+\/?$/.test(href)) {
        var to = href.split("/")[2];
        if (isHome && a.closest(".v4-project")) track("select_project", { project: projectOf(a), via: "title" });
        else if (isCase && to !== page) track("open_other_case", { case_study: page, to: to });
      }
      return;
    }

    // The rest of a project card is a link too (scripts/v4-strip.js); its
    // own controls and a drag are not.
    var card = t.closest("[data-card-href]");
    if (isHome && card && !t.closest("button") && !(window.getSelection && String(window.getSelection())))
      track("select_project", { project: projectOf(card), via: "card" });

    var folder = t.closest("[data-folder]");
    if (folder) setTimeout(function () {
      if (folder.getAttribute("aria-expanded") === "true" || folder.classList.contains("is-open"))
        track("open_folder", { folder: (folder.className.match(/v4-folder--(\w+)/) || [])[1] || "" });
    }, 0);
  }, true);

  // ---- Homepage --------------------------------------------------------------
  if (isHome) {
    ["work", "about"].forEach(function (id) {
      seen(document.getElementById(id), 0, function () { track("view_section", { section: id }); });
    });

    Array.prototype.forEach.call(document.querySelectorAll(".v4-project"), function (row) {
      var project = projectOf(row);
      seen(row, 0.5, function () { track("view_project", { project: project }); });
      var browsed = false;
      row.addEventListener("v4:strip", function (e) {
        if (browsed) return;
        browsed = true;
        track("browse_thumbnails", { project: project, via: (e.detail && e.detail.via) || "" });
      });
    });

    var opened = false, dragged = false;
    document.addEventListener("v4:window", function (e) {
      if (!opened && e.detail && e.detail.open) { opened = true; track("open_window"); }
    });
    var hour = document.getElementById("sky-hour");
    if (hour) hour.addEventListener("input", function () {
      if (!dragged) { dragged = true; track("drag_sky"); }
    });
  }

  // ---- Case studies ------------------------------------------------------------
  if (isCase) {
    track("view_case_study", { case_study: page });

    // Each section once, so the report shows where readers stop.
    Array.prototype.forEach.call(document.querySelectorAll(".v4-case__section[id]"), function (s, i) {
      seen(s, 0, function () { track("case_section", { case_study: page, section: s.id, index: i + 1 }); });
    });

    // The end: the bottom of the page in view.
    var finished = false;
    function check() {
      if (finished) return;
      var doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight * 0.95) {
        finished = true;
        track("finish_case_study", { case_study: page });
        window.removeEventListener("scroll", onScroll);
      }
    }
    var pending = 0;
    function onScroll() { if (!pending) pending = setTimeout(function () { pending = 0; check(); }, 200); }
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
