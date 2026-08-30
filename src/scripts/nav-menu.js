/* MOBILE MENU — the header's drop panel below 480px (Figma 566:37656).
 *
 * ONE NAV, TOGGLED — not a second copy of the links. The panel this opens IS
 * the desktop bar's <nav>; _nav.css restyles it below 480 and hides it behind
 * .is-closed. That matters beyond tidiness: scripts/header-theme.js binds the
 * scroll-spy to `.site-header__link[data-spy]`, and a duplicate list would give
 * every section two elements to mark as current.
 *
 * THE CLASS IS SCOPED, WHICH IS WHY THIS IS SAFE ABOVE THE BREAKPOINT. Only the
 * ≤480 block gives .is-closed any effect, so leaving it on the element at desktop
 * widths hides nothing. That is also why nothing here reads the viewport to
 * decide whether to run: the state is always tracked, CSS decides whether it is
 * visible. The one exception is the resize handler at the bottom, which exists
 * for aria-expanded rather than for layout.
 *
 * NO INLINE STYLES. Visibility is a class, never element.style.display, so the
 * stylesheet stays the single source of what "closed" looks like at each width.
 *
 * Zero dependencies. Degrades to a nav that is simply always open if this file
 * fails to load — the markup ships closed, so the honest failure mode would be a
 * hidden nav; that is why .is-closed is removed on the first interaction and the
 * button is inert-but-visible rather than the panel being display:none by
 * default at every width.
 */
(function (window, document) {
  "use strict";

  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-menu-panel]");
  if (!toggle || !panel) return;

  var CLOSED = "is-closed";

  function isOpen() {
    return !panel.classList.contains(CLOSED);
  }

  /* Focus moves INTO the panel on open and back to the button on close, which is
     the whole of the keyboard contract here: without the return trip a keyboard
     user who closes the menu is dropped at the top of the document with no
     indication of where they were. */
  function open() {
    panel.classList.remove(CLOSED);
    toggle.setAttribute("aria-expanded", "true");
    var first = panel.querySelector("a");
    if (first) first.focus();
  }

  function close(returnFocus) {
    panel.classList.add(CLOSED);
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", function () {
    if (isOpen()) close(false);
    else open();
  });

  /* Selecting an item closes the menu. The anchor's own navigation is left
     alone — these are in-page hrefs and the browser's scroll is the behaviour we
     want; this only takes the panel out of the way first so the section is not
     revealed underneath an open menu. */
  panel.addEventListener("click", function (ev) {
    if (ev.target.closest("a")) close(false);
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && isOpen()) close(true);
  });

  /* Outside-click. Bound on the document and guarded by containment rather than
     by stopPropagation inside the panel, so nothing else on the page has to know
     this menu exists. */
  document.addEventListener("click", function (ev) {
    if (!isOpen()) return;
    if (panel.contains(ev.target) || toggle.contains(ev.target)) return;
    close(false);
  });

  /* CROSSING THE BREAKPOINT IS AN ARIA PROBLEM, NOT A LAYOUT ONE. Above 480 the
     panel is visible whatever .is-closed says, so a stale aria-expanded="false"
     would describe a bar that is plainly there. Re-sync on the change rather
     than polling resize. */
  if (window.matchMedia) {
    var mq = window.matchMedia("(max-width: 480px)");
    var sync = function (ev) {
      if (!ev.matches) {
        // Desktop/tablet: the bar is open by definition.
        toggle.setAttribute("aria-expanded", "true");
      } else {
        // Back to mobile: start closed, whatever state we crossed over in.
        panel.classList.add(CLOSED);
        toggle.setAttribute("aria-expanded", "false");
      }
    };
    sync(mq);
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else if (mq.addListener) mq.addListener(sync);
  }
})(window, document);
