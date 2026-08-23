/* GA4 custom event tracking (property G-JXCBH3PH93).
 *
 * Shared across every page; which events are wired is decided by the
 * data-page attribute on <body> — "home" for index.html, or the case-study
 * slug ("onton" / "challenquiz" / "ezam"). An attribute rather than a URL
 * check, so clean URLs (/onton vs /onton.html) can't break the detection.
 *
 * Every gtag call goes through track(), which no-ops when gtag is missing —
 * blockers, offline, or consent tooling therefore cost nothing and throw
 * nothing. This file only listens; it never preventDefaults, rewrites an href,
 * or otherwise touches behaviour.
 *
 * Zero dependencies.
 */
(function () {
  "use strict";

  function track(name, params) {
    if (typeof window.gtag !== "function") return;
    try {
      if (params) window.gtag("event", name, params);
      else window.gtag("event", name);
    } catch (e) {
      /* analytics must never break the page */
    }
  }

  var page = (document.body && document.body.getAttribute("data-page")) || "";
  var isHome = page === "home";
  if (!page) return;

  /* ---- Scroll depth ------------------------------------------------------
     Fraction of the document the BOTTOM of the viewport has reached, so 1.0
     means the very end. A page too short to scroll counts as fully read. */
  function depth() {
    var doc = document.documentElement;
    var total = Math.max(doc.scrollHeight, document.body.scrollHeight);
    if (total <= window.innerHeight) return 1;
    return (window.scrollY + window.innerHeight) / total;
  }

  /* 200ms throttle with a TRAILING call — a leading-only throttle can miss the
     final position when someone flings to the bottom, which is exactly the
     moment the 95% events need to be measured. */
  function throttle(fn) {
    var last = 0;
    var timer = 0;
    return function () {
      var wait = 200 - (Date.now() - last);
      if (wait <= 0) {
        last = Date.now();
        fn();
      } else if (!timer) {
        timer = window.setTimeout(function () {
          timer = 0;
          last = Date.now();
          fn();
        }, wait);
      }
    };
  }

  // Each flag latches, so every depth event fires at most once per page load.
  function watchScroll(check) {
    var handler = throttle(function () {
      if (check()) window.removeEventListener("scroll", handler);
    });
    window.addEventListener("scroll", handler, { passive: true });
    check(); // a restored scroll position may already be past a threshold
  }

  if (isHome) {
    /* ---- 1 + 2. scroll_50 / scroll_100 ---- */
    var got50 = false;
    var got100 = false;
    watchScroll(function () {
      var d = depth();
      if (!got50 && d >= 0.5) {
        got50 = true;
        track("scroll_50");
      }
      if (!got100 && d >= 0.95) {
        got100 = true;
        track("scroll_100");
      }
      return got50 && got100; // both done — stop listening
    });

    /* ---- 3. view_about — "All About Me" enters the viewport ---- */
    /* #about-me is the redesigned About section. The two older ids are kept as
       fallbacks only so this keeps firing on any page still serving the v2
       markup; neither exists in the current build. */
    var about =
      document.getElementById("about-me") ||
      document.getElementById("all-about-me") ||
      document.getElementById("about");
    if (about && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              track("view_about");
              io.disconnect(); // once only
              return;
            }
          }
        },
        { threshold: 0 }
      );
      io.observe(about);
    }

  } else {
    /* ---- 8. view_case_study — once, on load ---- */
    track("view_case_study", { case_study: page });

    /* ---- 9. finish_case_study — once, at 95% depth ---- */
    var finished = false;
    watchScroll(function () {
      if (!finished && depth() >= 0.95) {
        finished = true;
        track("finish_case_study", { case_study: page });
      }
      return finished;
    });
  }

  /* ---- 4–7. Outbound / download clicks — EVERY page ----
     The contact links appear in the footer of the case studies too, so this
     sits outside the page branch; GA stamps the page path on each event, so
     homepage vs case-study clicks stay separable in the reports.

     One delegated listener in the CAPTURE phase, so it records the click
     before mailto-fallback.js gets it on the way back up (that handler
     preventDefaults mailto links to offer Gmail web compose). */
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target && e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href") || "";

      // 4. download_resume — the How I Think CTA and the mobile-only copy of it
      //    both point at the same PDF, so match the file, not the class. Only
      //    the home page carries either link.
      if (/Resume\.pdf(\?|#|$)/i.test(href)) track("download_resume");

      // 5–7. Contact links. Mutually exclusive by host.
      if (/^mailto:/i.test(href)) track("click_email");
      else if (/(^|\/\/|\.)linkedin\.com/i.test(href)) track("click_linkedin");
      else if (/(^|\/\/|\.)github\.com/i.test(href)) track("click_github");
    },
    true
  );
})();
