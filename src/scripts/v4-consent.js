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
 *
 * A no also closes the curtains on the visitor's sky: <html> gets
 * .consent-denied and the hero shows my sky instead (scripts/v4-sky.js).
 * Clicking that window asks again, in the middle of the screen over a soft
 * scrim (window.__consentAsk); the scrim or Escape leaves the answer as it is.
 * Every answer is announced on the document ("v4:consent").
 */
(function () {
  "use strict";

  var card = document.querySelector("[data-consent]");
  if (!card) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SHOW_AFTER = 1200, PLAY = reduced ? 0 : 1000, FADE = reduced ? 200 : 450;
  var timer = 0;
  var scrim = document.createElement("div");
  scrim.className = "v4-consent-scrim";
  scrim.hidden = true;
  card.parentNode.insertBefore(scrim, card);

  function save(answer) {
    try { localStorage.setItem("v4-consent", answer); } catch (e) {}
    window.__consent = answer;
  }

  function apply(answer) {
    var yes = answer === "granted";
    document.documentElement.classList.toggle("consent-denied", !yes);
    document.dispatchEvent(new CustomEvent("v4:consent", { detail: { answer: answer } }));
    if (typeof window.gtag === "function")
      window.gtag("consent", "update", { analytics_storage: yes ? "granted" : "denied" });
    if (yes && typeof window.__loadClarity === "function") window.__loadClarity();
    if (!yes && typeof window.clarity === "function") window.clarity("consent", false);
  }

  function show(delay, centre) {
    clearTimeout(timer);
    card.classList.remove("is-open", "is-closed", "is-out", "is-in");
    card.classList.toggle("is-centre", !!centre);
    card.hidden = false;
    scrim.hidden = !centre;
    timer = setTimeout(function () {
      void card.offsetWidth;
      card.classList.add("is-in");
      if (centre) {
        scrim.classList.add("is-in");
        card.querySelector("[data-consent-answer]").focus({ preventScroll: true });
      }
    }, delay);
  }

  function hide(after) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      card.classList.remove("is-in");
      card.classList.add("is-out");
      scrim.classList.remove("is-in");
      timer = setTimeout(function () { card.hidden = true; scrim.hidden = true; }, FADE);
    }, after);
  }

  // Asked again from the window, in the middle of the screen.
  window.__consentAsk = function () { show(0, true); };
  scrim.addEventListener("click", function () { hide(0); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && card.classList.contains("is-centre") && !card.hidden) hide(0);
  });

  function answer(value) {
    save(value);
    apply(value);
    card.classList.add(value === "granted" ? "is-open" : "is-closed");
    hide(PLAY);
  }

  Array.prototype.forEach.call(card.querySelectorAll("[data-consent-answer]"), function (b) {
    b.addEventListener("click", function () { answer(b.getAttribute("data-consent-answer")); });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-consent-open]"), function (b) {
    b.addEventListener("click", function () { show(0); });
  });

  if (window.__consent !== "granted" && window.__consent !== "denied") show(SHOW_AFTER);
})();
