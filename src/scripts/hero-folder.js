/* HERO FOLDER — flap toggle that pulls the cards further out, plus card drag.
 *
 * THE RESTING STATE IS THE FIGMA COMP, AND JS NEVER TOUCHES IT. The cards peek
 * out of the folder on load because that is what the CSS already does with no
 * custom properties set at all; this module only ever ADDS `.is-expanded` to
 * pull them further out, and removing it returns them to that same peek.
 *
 * That direction matters. An earlier attempt inverted it — the script marked
 * the folder interactive and the cards defaulted to a tucked-away
 * `--tuck-y: 66%`, so they flashed on first paint and then vanished once the
 * deferred script ran. Nothing here may reintroduce a default that hides them:
 * with JS absent, broken, or slow, the hero must still render the comp.
 *
 * THE FLAP IS THE BUTTON, not the folder as a whole. A <button> wrapping the
 * cards would nest interactive controls and its click would fight every
 * pointerdown-to-drag. See the comment in hero.njk.
 *
 * DRAG IS THREE PHASES, and all three are expressed as classes so CSS owns
 * every duration and easing:
 *
 *   grab      .is-grabbing   short eased beat; card straightens and lifts
 *   hold      .is-dragging   no transition at all, so tracking is 1:1
 *   release   .is-returning  long eased settle back to its home
 *
 * "Home" is never stored. Clearing --drag-x/--drag-y and letting --rot-scale
 * return to 1 lets the existing rest/expanded rules recompute it, so a card
 * released while the folder is expanded settles into its EXPANDED slot rather
 * than the rest peek — with no bookkeeping here that could drift out of sync
 * with the folder state.
 *
 * REDUCED MOTION needs no branch FOR THE DRAG: base.css already zeroes every
 * transition globally, so the phases collapse to instant. Dragging still works,
 * because dragging is a direct response to input rather than motion the page
 * plays.
 *
 * THE IDLE PEEK IS THE EXCEPTION and does branch, because it is the one thing
 * here the page plays at nobody's request. Zeroed transitions would turn it
 * into a 6px jump and jump back — motionless by the letter of the rule and a
 * flash by the spirit of it — so under reduced motion it is never scheduled at
 * all and no class is ever added.
 *
 * WHY A PEEK EXISTS. At rest the folder is indistinguishable from artwork, and
 * an interaction nobody discovers may as well not ship. One small nudge on the
 * frontmost card a few seconds in says "these move" without a word of
 * instruction. It plays ONCE: a repeating hint reads as a broken loop, and
 * anyone who has already touched the folder has been told what it needed to
 * tell them, which is why every form of contact cancels it permanently.
 */
(function (window, document) {
  "use strict";

  var root = document.querySelector("[data-hero-folder]");
  if (!root) return; // hero not on this page

  var toggle = root.querySelector(".hero-folder__front");
  var label = root.querySelector("[data-folder-label]");
  var cards = Array.prototype.slice.call(root.querySelectorAll(".hero-folder__card"));

  var LABEL_REST = "Pull the cards out";
  var LABEL_EXPANDED = "Put the cards back";

  // Durations live in CSS; read them once so the two never drift apart.
  function ms(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    var n = parseFloat(v);
    if (!n) return fallback;
    return v.indexOf("ms") !== -1 ? n : n * 1000;
  }
  var GRAB_MS = ms("--duration-grab", 180);
  var RETURN_MS = ms("--duration-return", 600);
  var PEEK_DELAY_MS = ms("--delay-peek", 2500);
  var PEEK_RISE_MS = ms("--duration-peek-rise", 260);
  var PEEK_HOLD_MS = ms("--hold-peek", 140);
  var PEEK_SETTLE_MS = ms("--duration-peek-settle", 420);

  // ---- Expand / collapse ----------------------------------------------------
  function setExpanded(on) {
    root.classList.toggle("is-expanded", on);
    if (toggle) toggle.setAttribute("aria-expanded", on ? "true" : "false");
    if (label) label.textContent = on ? LABEL_EXPANDED : LABEL_REST;
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setExpanded(!root.classList.contains("is-expanded"));
    });
    // A real <button> already fires click on Enter and Space, so there is
    // deliberately no key handler — adding one double-fires and toggles twice.
  }

  // ---- Idle peek ------------------------------------------------------------
  // One nudge on the frontmost card, a few seconds after load, then never
  // again. Deliberately set up BEFORE the drag section's early return: the peek
  // depends on nothing but CSS, so it must still play on a page where
  // window.HeroDrag failed to load and the cards are only clickable.
  (function schedulePeek() {
    // The one hard branch in this file. Everything else degrades to instant
    // under reduced motion; unrequested motion has to degrade to nothing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // THE FRONTMOST CARD, which is the last in DOM order — the stack paints in
    // document order (see _hero.css), so this is the only one with no sibling
    // drawn over it. Nudging a buried card would animate a partly hidden edge.
    var card = cards[cards.length - 1];
    if (!card) return;

    var timer = 0;
    var done = false;

    // Both phases collapse into one path so the natural end and an interrupted
    // peek settle identically — there is no second way for the card to get home.
    function settle() {
      window.clearTimeout(timer);
      card.classList.remove("is-peeking");
      card.classList.add("is-peek-settling");
      timer = window.setTimeout(function () {
        card.classList.remove("is-peek-settling");
      }, PEEK_SETTLE_MS);
    }

    // Idempotent, and permanent: `done` is what makes this a one-time cue even
    // though three separate events race to call it.
    function cancel() {
      if (done) return;
      done = true;
      root.removeEventListener("pointerover", cancel);
      root.removeEventListener("pointerdown", cancel);
      root.removeEventListener("focusin", cancel);
      // Nothing to settle if the delay has not elapsed — clearing the pending
      // start is the whole cancel, and the card never moves at all.
      if (card.classList.contains("is-peeking")) settle();
      else window.clearTimeout(timer);
    }

    function play() {
      if (done) return;
      card.classList.add("is-peeking");
      timer = window.setTimeout(settle, PEEK_RISE_MS + PEEK_HOLD_MS);
    }

    // pointerover, not pointerenter: it bubbles, so one listener on the folder
    // covers the flap, the cards and the art behind them. pointerdown catches a
    // press from a pointer that never hovered (touch, pen) and is also how a
    // drag begins, so a grab mid-peek cancels on its first event rather than
    // fighting the animation. focusin covers arriving by keyboard.
    root.addEventListener("pointerover", cancel);
    root.addEventListener("pointerdown", cancel);
    root.addEventListener("focusin", cancel);

    // A one-shot cue fired into a background tab is simply spent unseen — and
    // there is no second one. Timers still run while hidden, so the delay has
    // to start from the moment the page is actually being looked at.
    if (document.visibilityState === "hidden") {
      document.addEventListener("visibilitychange", function onVisible() {
        if (document.visibilityState === "hidden") return;
        document.removeEventListener("visibilitychange", onVisible);
        timer = window.setTimeout(play, PEEK_DELAY_MS);
      });
    } else {
      timer = window.setTimeout(play, PEEK_DELAY_MS);
    }
  })();

  // ---- Drag -----------------------------------------------------------------
  var drag = window.HeroDrag;
  var board = root.closest(".hero__board");
  if (!drag || !board) return; // toggle still works without dragging

  function boardBounds() {
    return board.getBoundingClientRect();
  }

  cards.forEach(function (card) {
    var x = 0;
    var y = 0;
    var grabTimer = 0;
    var returnTimer = 0;

    function write() {
      card.style.setProperty("--drag-x", x + "px");
      card.style.setProperty("--drag-y", y + "px");
    }

    drag.makeDraggable(card, {
      bounds: boardBounds,
      getOffset: function () {
        return { x: x, y: y };
      },

      onStart: function () {
        // A grab can interrupt a return already in flight; drop its cleanup so
        // it cannot strip .is-grabbing out from under the new gesture.
        window.clearTimeout(returnTimer);
        card.classList.remove("is-returning");

        card.classList.add("is-grabbing");
        // Hand over to the untransitioned hold phase once the straighten has
        // played. Doing this on a timer rather than transitionend keeps it
        // correct under reduced motion, where the event may never fire.
        grabTimer = window.setTimeout(function () {
          card.classList.remove("is-grabbing");
          card.classList.add("is-dragging");
        }, GRAB_MS);
      },

      onMove: function (dx, dy) {
        x = dx;
        y = dy;
        write();
      },

      onEnd: function () {
        // Release may land mid-straighten; cancel the pending handover so it
        // cannot re-add .is-dragging after the card has started going home.
        window.clearTimeout(grabTimer);
        card.classList.remove("is-grabbing", "is-dragging");

        // Clearing the offset IS the return: CSS recomputes home for whichever
        // folder state is current, and --rot-scale falls back to 1 so the card
        // rotates back to its slot angle on the way.
        card.classList.add("is-returning");
        x = 0;
        y = 0;
        write();

        returnTimer = window.setTimeout(function () {
          card.classList.remove("is-returning");
        }, RETURN_MS);
      },
    });
  });
})(window, document);
