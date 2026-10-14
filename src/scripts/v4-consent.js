/* V4 consent — the window card (v4/consent.njk).
 *
 * Shown a moment after load until the visitor answers; the answer is kept in
 * localStorage ("v4-consent": "granted" or "denied") and read again in the
 * <head> (partials/head-analytics.njk) before any tag runs.
 *
 *   Sure, peek away           GA4 analytics_storage granted, Clarity loaded;
 *                             the little window swings open.
 *   Keep the curtains closed  GA4 stays cookieless, no Clarity; the curtains
 *                             draw across.
 *
 * "Cookie settings" in the footer ([data-consent-open]) shows it again, so
 * an answer can be changed. A no after a yes also tells Clarity to stop.
 */
(function () {
  "use strict";

  var card = document.querySelector("[data-consent]");
  if (!card) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SHOW_AFTER = 1200, PLAY = reduced ? 0 : 1000, FADE = reduced ? 200 : 450;
  var timer = 0;

  function save(answer) {
    try { localStorage.setItem("v4-consent", answer); } catch (e) {}
    window.__consent = answer;
  }

  function apply(answer) {
    var yes = answer === "granted";
    if (typeof window.gtag === "function")
      window.gtag("consent", "update", { analytics_storage: yes ? "granted" : "denied" });
    if (yes && typeof window.__loadClarity === "function") window.__loadClarity();
    if (!yes && typeof window.clarity === "function") window.clarity("consent", false);
  }

  function show(delay) {
    clearTimeout(timer);
    card.classList.remove("is-open", "is-closed", "is-out", "is-in");
    card.hidden = false;
    timer = setTimeout(function () {
      void card.offsetWidth;
      card.classList.add("is-in");
    }, delay);
  }

  function answer(value) {
    save(value);
    apply(value);
    card.classList.add(value === "granted" ? "is-open" : "is-closed");
    clearTimeout(timer);
    timer = setTimeout(function () {
      card.classList.remove("is-in");
      card.classList.add("is-out");
      timer = setTimeout(function () { card.hidden = true; }, FADE);
    }, PLAY);
  }

  Array.prototype.forEach.call(card.querySelectorAll("[data-consent-answer]"), function (b) {
    b.addEventListener("click", function () { answer(b.getAttribute("data-consent-answer")); });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-consent-open]"), function (b) {
    b.addEventListener("click", function () { show(0); });
  });

  if (window.__consent !== "granted" && window.__consent !== "denied") show(SHOW_AFTER);
})();
