/* HERO FOLDER — flap toggle that pulls the cards further out, plus free card
 * dragging.
 *
 * THE RESTING STATE IS THE FIGMA COMP, AND JS NEVER TOUCHES IT. The cards peek
 * out of the folder on load because that is what the CSS already does with no
 * custom properties set at all; this module only ever ADDS `.is-expanded` to
 * pull them further out, and removing it returns them to that same peek.
 *
 * That direction matters. An earlier attempt inverted it — the script marked
 * the folder as interactive and the cards defaulted to a tucked-away
 * `--tuck-y: 66%`, so they flashed on first paint and then vanished once the
 * deferred script ran. Nothing here may reintroduce a default that hides them:
 * with JS absent, broken, or slow, the hero must still render the comp.
 *
 * THE FLAP IS THE BUTTON, not the folder as a whole. A <button> wrapping the
 * cards would nest interactive controls and its click would fight every
 * pointerdown-to-drag. See the comment in hero.njk.
 *
 * Positions, angles and durations all live in CSS (_hero.css / tokens.css):
 * rest and expanded are two declarative states, and the browser interpolates
 * between them. The only thing that ever changes is custom properties feeding
 * one `transform`, which keeps the whole thing on the compositor.
 *
 * REDUCED MOTION needs no branch here — base.css already zeroes every
 * transition globally, so the toggle simply becomes instantaneous. Dragging is
 * untouched either way: it is a direct response to input, not motion the page
 * decided to play on its own.
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

  // ---- Drag -----------------------------------------------------------------
  var drag = window.HeroDrag;
  var board = root.closest(".hero__board");
  if (!drag || !board) return; // toggle still works without dragging

  function boardBounds() {
    return board.getBoundingClientRect();
  }

  cards.forEach(function (card) {
    // The offset lives on the element as custom properties so CSS owns
    // composition; this module never reads or writes `transform` itself.
    var x = 0;
    var y = 0;

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
        card.classList.add("is-dragging");
      },
      onMove: function (dx, dy) {
        x = dx;
        y = dy;
        write();
      },
      onEnd: function (dx, dy) {
        x = dx;
        y = dy;
        write();
        card.classList.remove("is-dragging");
        // Stays where dropped — no snap-back and no throw. A card is a sheet of
        // paper being placed, not something with momentum.
      },
    });
  });
})(window, document);
