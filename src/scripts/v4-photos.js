/* V4 About photo wheel — v4/about.njk, _about.css.
 *
 * Turns the wheel slowly and endlessly. Each card has a place on the arc,
 * --p (0 the middle, ±1 its neighbours); CSS turns --p into position and
 * tilt, so all this does is move every --p down a little each frame.
 *
 * ENDLESS: the photos are cloned until there are enough to fill the widest
 * part of the arc on screen, and a card that leaves on the left comes back
 * on the right, far enough out that the jump is never seen. The clones are
 * aria-hidden; screen readers get the list once.
 *
 * It eases to a stop under the pointer (so a caption can be read) and while
 * the wheel is off screen, and stays still for prefers-reduced-motion.
 */
(function () {
  "use strict";

  var band = document.querySelector("[data-photos]");
  if (!band) return;
  var list = band.querySelector(".v4-photos");
  var originals = Array.prototype.slice.call(list.children);
  var n = originals.length;
  if (!n) return;

  var SPEED = 0.12;   // steps per second: about 37px/s through the middle
  var START = parseInt(list.getAttribute("data-start"), 10) || 0; // middle at load
  var EASE = 2.5;     // how fast it slows to a stop and picks up again (1/s)

  var cards = [];
  var count = 0;      // cards in the loop, a multiple of n

  // How far along the arc (in steps) a card must be to be off screen. The
  // arc is 604 at ±2 and 277 a step beyond; 260 covers a tilted card.
  function stepsToHide() {
    var r = band.getBoundingClientRect();
    var centre = r.left + r.width / 2;
    var reach = Math.max(centre, window.innerWidth - centre) + 260;
    return reach <= 604 ? 2 : 2 + (reach - 604) / 277;
  }

  function build() {
    var half = Math.ceil(stepsToHide()) + 1;
    var need = Math.max(n, 2 * half);
    var next = Math.ceil(need / n) * n;
    if (next <= count) return;
    for (var i = count; i < next; i++) {
      if (i < n) continue;
      var clone = originals[i % n].cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      var img = clone.querySelector("img");
      if (img) img.alt = "";
      list.appendChild(clone);
    }
    count = next;
    cards = Array.prototype.slice.call(list.children);
  }

  var offset = 0;     // steps turned so far
  var speed = 0;
  var target = SPEED;
  var hovering = false;
  var visible = true;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function place() {
    var half = count / 2;
    for (var i = 0; i < count; i++) {
      var p = i - START - offset;
      p = ((p + half) % count + count) % count - half;
      cards[i].style.setProperty("--p", p.toFixed(4));
    }
  }

  var last = 0;
  var running = false;

  function frame(now) {
    var dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    target = hovering || !visible || reduce.matches ? 0 : SPEED;
    speed += (target - speed) * Math.min(1, dt * EASE);
    if (Math.abs(speed) < 0.0005 && target === 0) speed = 0;
    offset += speed * dt;
    place();
    if (speed === 0 && target === 0) {
      running = false;
      last = 0;
      return;
    }
    requestAnimationFrame(frame);
  }

  function wake() {
    if (running || reduce.matches) return;
    running = true;
    requestAnimationFrame(frame);
  }

  build();
  place();
  wake();

  band.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "mouse") { hovering = true; wake(); }
  });
  band.addEventListener("pointerleave", function () {
    hovering = false;
    wake();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      wake();
    }, { rootMargin: "200px 0px" }).observe(band);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { build(); place(); }, 150);
  });

  if (reduce.addEventListener) reduce.addEventListener("change", wake);
})();
