/* GA4 custom event tracking (property G-JXCBH3PH93).
 *
 * Shared across every page; which events are wired is decided by the
 * data-page attribute on <body> — "home" for index.html, or the case-study
 * slug ("onton" / "challenquiz" / "connect2wow"). An attribute rather than a
 * URL check, so neither clean URLs nor the /onton.html -> /work/onton/ redirects
 * in vercel.json can break the detection.
 *
 * PAGES THAT ARE NEITHER record only the outbound-click events at the bottom of
 * this file. /projects/ and /404.html are both in that position; see the
 * CASE_STUDIES note below for why that is an allow-list.
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
  if (!page) return;

  /* THE THREE PAGES THAT ARE CASE STUDIES, NAMED. This was `else` — anything
     that was not "home" took the case-study branch — and that was wrong the
     moment a third kind of page existed. /projects/ reports data-page
     "projects" and the 404 reports "404", so both were firing view_case_study
     with those strings as the case_study parameter and arming
     finish_case_study behind them. Two phantom values in a dimension that is
     supposed to have exactly three.
     An allow-list rather than a deny-list because the failure directions are
     not symmetrical: a page missing from this array records nothing, which is
     recoverable, while a page wrongly included silently corrupts the dimension
     for as long as nobody reads the reports closely. Add a slug here when a
     fourth case study ships. */
  var CASE_STUDIES = ["onton", "challenquiz", "connect2wow"];
  var isHome = page === "home";
  var isCaseStudy = CASE_STUDIES.indexOf(page) !== -1;

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
    // Hero-card latches — see events 10 and 11 at the bottom of this block.
    var hovered = {};
    var pulled = {};
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

    /* ---- 3. view_about — the About section enters the viewport ---- */
    /* #about-me only. This used to fall back to #all-about-me and #about for
       pages still serving v2 markup; no page does, and a fallback that can
       never match is just a claim the reader has to go and disprove. */
    var about = document.getElementById("about-me");
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

    /* ---- 10 + 11. hero_card_hover / hero_card_pull ----
       The three expertise cards in the hero folder. `card` is the data-card slug
       written by partials/hero.njk from hero.js — a slug and not the title, so a
       copy edit cannot silently split the GA dimension in two.

       BOTH LATCH PER CARD, PER PAGE LOAD, and independently: a card can report a
       hover and a pull, once each. `hovered` and `pulled` are plain objects
       rather than Sets to match the rest of this file, which is ES5 throughout.

       WHAT "PULL" MEANS HERE IS "DRAGGED", and the distinction is worth stating
       because the two platforms end a drag differently. Above 480px the card
       always springs home — hero-folder.js calls that elastic behaviour
       deliberate, so there is no "opened" state to wait for and a completed drag
       is the only signal there is. At 480 and below the same gesture latches the
       card open. Both paths pass through the same class transition, so one rule
       covers them without knowing which it is.

       NOTHING HERE TOUCHES THE GESTURE. hero-folder.js and draggable.js are not
       modified and are not called; this observes the classes they already write.
       That is the whole reason it is a MutationObserver and not a pointer
       listener — a second pointerdown handler on the same element is a chance to
       interfere with a drag, and analytics is never worth that risk. */
    var heroCards = document.querySelectorAll(".hero-folder__card[data-card]");
    for (var hc = 0; hc < heroCards.length; hc++) {
      (function (card) {
        var slug = card.getAttribute("data-card");
        if (!slug) return;

        card.addEventListener(
          "mouseenter",
          function () {
            if (hovered[slug]) return;
            hovered[slug] = true;
            track("hero_card_hover", { card: slug });
          },
          { passive: true }
        );

        if (!("MutationObserver" in window)) return;

        /* THE GRAB CLASSES, NOT .is-dragging ALONE. onStart adds .is-grabbing
           synchronously the moment draggable.js's threshold is crossed, and
           .is-dragging only arrives GRAB_MS later — so a quick flick can begin
           and end without .is-dragging ever existing. Watching for either, then
           firing when both have gone, catches the short drags too.

           A PLAIN CLICK NEVER GETS HERE: onStart is what adds the first class,
           and draggable.js only calls it past 4px of movement (9 on touch), so a
           press with no drag sets nothing to observe. The other classes this
           element takes — is-peeking, is-returning, is-open — move through the
           same attribute and are simply not read. */
        var held = false;
        new MutationObserver(function () {
          var now =
            card.classList.contains("is-grabbing") ||
            card.classList.contains("is-dragging");
          if (now) {
            held = true;
            return;
          }
          if (!held) return;
          held = false;
          if (pulled[slug]) return;
          pulled[slug] = true;
          track("hero_card_pull", { card: slug });
        }).observe(card, { attributes: true, attributeFilter: ["class"] });
      })(heroCards[hc]);
    }
  }

  /* A SEPARATE `if`, NOT AN `else`. /projects/ and /404.html are neither home
     nor a case study and must fall through both blocks recording nothing. */
  if (isCaseStudy) {
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

  /* ---- Outbound clicks — EVERY page ----
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

      // Outbound contact and social. ONE else-if CHAIN, so exactly one of them
      // can match a given href — that is what keeps a single click from
      // recording twice.
      //
      // TWO EVENTS WERE REMOVED WITH THIS BATCH, both for the same reason: the
      // link they matched does not exist and is not coming back. click_github
      // had no GitHub link anywhere on the site, and download_resume matched a
      // Resume.pdf href that no template renders — the resume was taken off the
      // site deliberately. A branch that can never be taken is not a spare
      // capability, it is a claim in the code that the site does something it
      // does not; if either link returns, its line comes back with it.
      if (/^mailto:/i.test(href)) track("click_email");
      else if (/(^|\/\/|\.)calendar\.app\.google/i.test(href)) track("click_calendar");
      else if (/(^|\/\/|\.)linkedin\.com/i.test(href)) track("click_linkedin");
      else if (/(^|\/\/|\.)dribbble\.com/i.test(href)) track("click_dribbble");
      else if (/(^|\/\/|\.)behance\.net/i.test(href)) track("click_behance");
    },
    true
  );
})();
