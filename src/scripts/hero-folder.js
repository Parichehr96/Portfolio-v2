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
      /* INERT WHILE A CARD IS OPEN. The open card covers the flap — it is 324
         wide across the middle of a 356 board — so a tap that lands here is a
         tap on the card's backdrop, and the reader means "put this away", not
         "also rearrange the fan underneath it". The document listener below
         closes it; this just declines to do a second, invisible thing at the
         same time. Normal behaviour returns the moment nothing is open. */
      if (openRec) return;
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

  /* The one breakpoint this module cares about. Declared here rather than beside
     boundsFor() where it started, because the open/close block below now reads
     it too and runs at module init — several statements before that point. */
  var MOBILE = "(max-width: 480px)";
  function isMobile() {
    return !!window.matchMedia && window.matchMedia(MOBILE).matches;
  }

  // ---- Pulled out and latched open ------------------------------------------
  /* ONE CARD OPEN AT A TIME, and the module holds which. Each card contributes a
     record with its own close(), because the ease-home needs that card's private
     x/y/write/returnTimer closure — the state is per-card, the exclusivity is
     not. openRec is also what makes the flap inert (see the toggle above), so it
     is declared up here rather than inside the drag block: the toggle exists on
     a page where window.HeroDrag failed to load, and reading an undefined
     variable there would break the flap along with the drag. */
  var openRec = null;

  /* The click that ENDS a pull would otherwise close the card it just opened.
     Cleared on the next macrotask, which is after that click has dispatched. */
  var justOpened = false;

  /* Any click anywhere closes: on the card itself ("put it away") or outside it
     ("I'm done"). Both gestures mean the same thing and there is no third
     behaviour worth distinguishing, so this is deliberately one branch rather
     than a containment test. Bound once, guarded on openRec, so it costs nothing
     while nothing is open. */
  document.addEventListener("click", function () {
    if (!openRec || justOpened) return;
    openRec.close();
  });

  /* CROSSING BACK ABOVE THE BREAKPOINT CLOSES IT. Every .is-open rule lives in
     the <=480 block, so above it the card would keep the class, lose the styling
     and sit in the fan at its resting size with a stale offset — visually fine,
     silently wrong. Closing on the change keeps the class and the CSS agreeing
     about which world they are in. */
  if (window.matchMedia) {
    var mq = window.matchMedia(MOBILE);
    var onChange = function (ev) {
      if (!ev.matches && openRec) openRec.close();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  // ---- Drag -----------------------------------------------------------------
  var drag = window.HeroDrag;
  var board = root.closest(".hero__board");
  if (!drag || !board) return; // toggle still works without dragging

  /* THE BOARD IS THE WRONG BOX ON A PHONE. Desktop rests every card inside the
     board, so clamping to the board rect is free — clamp(base) === base and
     nothing moves until the pointer does. The mobile composition breaks that
     assumption on purpose: the folder is 122.9% of the board and bleeds off both
     edges (566:37662), so cards 1 and 3 rest partly OUTSIDE it. Card 3 runs to
     ~398 on a 356-wide board, which makes max.x about -42 before a finger has
     moved at all, and the first touch teleports the card 42px sideways.

     So on mobile the box is the board UNION the card's own rect. That is the
     smallest change that fixes it and the property that matters falls straight
     out of the union: the box always CONTAINS the card, so min <= base <= max,
     so clamp(base) === base, so a pre-move snap is arithmetically impossible —
     for these cards, for any future resting position, at any width.

     What it means in play: a card can always be pulled fully into view, and can
     never be pushed further into the clipped region than the comp already put
     it. Card 3 pulls left, card 1 pulls right, card 2 roams the whole board.
     That reads as the right constraint rather than a concession — the bleed is
     the thing you are pulling the card out OF.

     Union rather than the folder's rect, which was the other candidate: the
     folder's bleed extent ends at ~396.6 and card 3 reaches ~398, so it would
     still have snapped, by 1.4px instead of 42. Close is not a fix.

     Desktop returns the board rect unchanged — same object, same call, same
     behaviour as before this function grew a second branch. */

  function boundsFor(card) {
    return function () {
      var b = board.getBoundingClientRect();
      if (!window.matchMedia || !window.matchMedia(MOBILE).matches) return b;
      var r = card.getBoundingClientRect();
      return {
        left: Math.min(b.left, r.left),
        top: Math.min(b.top, r.top),
        right: Math.max(b.right, r.right),
        bottom: Math.max(b.bottom, r.bottom),
      };
    };
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

    /* THE EASE HOME, lifted out of onEnd so close() can reuse it. Clearing the
       offset IS the return: CSS recomputes home for whichever folder state is
       current, and --rot-scale falls back to 1 so the card rotates back to its
       slot angle on the way. */
    function goHome() {
      card.classList.add("is-returning");
      x = 0;
      y = 0;
      write();

      window.clearTimeout(returnTimer);
      returnTimer = window.setTimeout(function () {
        card.classList.remove("is-returning");
      }, RETURN_MS);
    }

    /* Opening closes whatever was open first — one card at a time, and the
       previous one eases home rather than blinking out. */
    function openThis() {
      if (openRec && openRec !== rec) openRec.close();
      card.classList.add("is-open");
      openRec = rec;
      justOpened = true;
      window.setTimeout(function () {
        justOpened = false;
      }, 0);
    }

    function closeThis() {
      if (openRec !== rec) return;
      openRec = null;
      /* The class and the offset go in the same frame, so the transition runs
         once from the pinned 324x248 to the resting slot rather than twice. */
      card.classList.remove("is-open");
      goHome();
    }

    var rec = { card: card, close: closeThis };

    drag.makeDraggable(card, {
      bounds: boundsFor(card),
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

        /* ON A PHONE, A PULL LATCHES INSTEAD OF SPRINGING BACK. Desktop keeps
           the elastic behaviour — the card is a thing you tug and let go of, and
           the copy is readable at rest there anyway. On mobile the resting card
           shows five of sixteen lines, so a pull that snapped home would have
           shown the reader nothing; the gesture has to leave something behind.

           THE PULL IS THE ONLY OPENER, and that is what keeps this off the
           scroll path: getting here at all means draggable.js's threshold and
           axis gate both passed, so a vertical swipe scrolled the page and never
           reached this line. Nothing new has to be gated. */
        if (isMobile()) {
          openThis();
          return;
        }
        goHome();
      },
    });
  });
})(window, document);
