/* V4 footer trees in the wind — v4/footer.njk, _footer.css.
 *
 * The footer's Amsterdam illustration is an <img> (so it always shows). As
 * the footer nears the screen, this swaps it for the same SVG inline, whose
 * tree crowns are tagged (class="tree", a pivot at the base of each crown),
 * and sets how they sway from the wind in Amsterdam right now: Open-Meteo's
 * current 10 m wind speed (free, no key), kept for 15 minutes per tab. The
 * crowns bend from their base with a slower gust on top: a light breeze is a
 * visible, easy sway; a stormy day bends them further and faster. If the
 * weather can't be fetched they sway as on a light breeze. Reduced motion:
 * no sway (CSS).
 *
 * THE WINDMILL (v4/windmill.njk) turns in the same wind, anticlockwise, the
 * way its wind line blows (right to left): about a turn in 4.6s
 * on a 10 km/h breeze, faster as it blows harder, slow on a calm day, easing
 * to each new pace rather than jumping. Every so often (more often the windier
 * it is) a gust runs down the blue wind line and the blades surge with it. Only
 * while the footer is on screen; reduced motion leaves the mill still.
 *
 * Hovering the windmill shows Amsterdam's wind speed; hovering the one lit
 * window in the navy house (class="me" in amsterdam.svg) says who is in it.
 */
(function () {
  "use strict";

  var holder = document.querySelector("[data-wind-art]");
  if (!holder || !("fetch" in window)) return;

  var URL_WIND = "https://api.open-meteo.com/v1/forecast?latitude=52.37&longitude=4.89&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh";
  var CACHE = "v4-wind";
  var BREEZE = 10;                                         // km/h, when the weather is unknown
  var millV = BREEZE, millKnown = false;

  function setWind(kmh, fromDeg) {
    var v = Math.max(0, Math.min(90, +kmh || 0));
    // Lean with the wind: a westerly (from 180..360) pushes the crowns east (right).
    var dir = typeof fromDeg === "number" && fromDeg > 0 && fromDeg < 180 ? -1 : 1;
    millV = v;
    if (typeof fromDeg === "number") millKnown = true;   // the live reading, not the stand-in breeze
    var bend = Math.min(13, 2.5 + v * 0.25);               // degrees of skew: 5 at 10 km/h
    var gust = bend * 0.3;                                 // a slower lean on top
    var period = Math.max(1.2, 3.2 - v * 0.05);            // seconds per sway
    holder.style.setProperty("--wind-bend", (bend * dir).toFixed(2) + "deg");
    holder.style.setProperty("--wind-gust", (gust * dir).toFixed(2) + "deg");
    holder.style.setProperty("--wind-period", period.toFixed(2) + "s");
    holder.setAttribute("data-wind-kmh", String(Math.round(v)));
  }

  function wind() {
    try {
      var c = JSON.parse(sessionStorage.getItem(CACHE) || "null");
      if (c && Date.now() - c.t < 15 * 60000) return Promise.resolve(c);
    } catch (e) {}
    return fetch(URL_WIND).then(function (r) { return r.json(); }).then(function (j) {
      var c = { t: Date.now(), v: j.current.wind_speed_10m, d: j.current.wind_direction_10m };
      try { sessionStorage.setItem(CACHE, JSON.stringify(c)); } catch (e) {}
      return c;
    });
  }

  function inline() {
    var img = holder.querySelector("img");
    if (!img) return;
    setWind(BREEZE);
    fetch(img.getAttribute("src")).then(function (r) { return r.text(); }).then(function (svg) {
      var box = document.createElement("div");
      box.innerHTML = svg;
      var el = box.querySelector("svg");
      if (!el) return;
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("focusable", "false");
      el.removeAttribute("width");
      el.removeAttribute("height");
      el.classList.add("v4-footer__art");
      img.replaceWith(el);
      if (tip) me();                                       // the lit window, now that it is inline
      wind().then(function (c) { setWind(c.v, c.d); }).catch(function () {});
    }).catch(function () {});
  }

  // ---- The windmill ----------------------------------------------------------
  var mill = document.querySelector("[data-mill]");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (mill && !still && "IntersectionObserver" in window) {
    var blades = mill.querySelector(".v4-mill__blades");
    var line = mill.querySelector(".v4-mill__wind");
    var angle = 0, omega = 0, boost = 0, last = 0, raf = 0, nextGust = 0, seen = false;

    function pace() {                                      // degrees a second for this wind
      return Math.max(18, Math.min(220, 18 + millV * 6));
    }
    function gap() {                                       // seconds to the next gust
      var base = Math.max(4, 13 - millV * 0.2);
      return base * (0.6 + Math.random() * 0.8);
    }
    function gust(now) {
      line.classList.remove("is-blowing");
      void line.getBoundingClientRect();                   // restart the sweep
      line.classList.add("is-blowing");
      boost = 1;
      nextGust = now + gap() * 1000;
    }
    function frame(now) {
      raf = 0;
      if (!seen || document.hidden) { last = 0; return; }
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!nextGust) nextGust = now + 1500;
      if (now >= nextGust) gust(now);
      boost *= Math.exp(-dt / 1.6);
      var target = pace() * (1 + 0.7 * boost);
      omega += (target - omega) * Math.min(1, dt * 1.5);
      angle = (angle - omega * dt) % 360;                 // anticlockwise: the way the wind line blows
      blades.style.transform = "rotate(" + angle.toFixed(2) + "deg)";
      raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf && seen && !document.hidden) raf = requestAnimationFrame(frame); }
    new IntersectionObserver(function (entries) {
      seen = entries[0].isIntersecting;
      wake();
    }).observe(mill);
    document.addEventListener("visibilitychange", wake);
  }

  // Hovered (or tapped), the windmill shows the wind speed by the pointer;
  // the one lit window in the city, who is behind it.
  var tip = document.querySelector("[data-mill-tip]");
  var foot = tip && tip.closest("footer"), tipT = 0;
  function place(e, text) {
    tip.textContent = text;
    tip.hidden = false;
    var r = foot.getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - r.left + 14, r.width - tip.offsetWidth - 8) + "px";
    tip.style.top = (e.clientY - r.top - tip.offsetHeight - 12) + "px";
  }
  function hover(el, text) {
    el.addEventListener("pointermove", function (e) { place(e, text()); });
    el.addEventListener("pointerleave", function () { tip.hidden = true; });
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      place(e, text()); clearTimeout(tipT); tipT = setTimeout(function () { tip.hidden = true; }, 2500);
    });
  }
  function me() { var w = holder.querySelector(".me"); if (w) hover(w, function () { return "Me, working somewhere in Amsterdam"; }); }
  if (mill && tip) {
    hover(mill, function () {
      return millKnown ? "Amsterdam wind speed: " + Math.round(millV) + " km/h" : "Amsterdam wind speed: loading\u2026";
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); inline(); }
    }, { rootMargin: "600px 0px" });
    io.observe(holder);
  } else {
    inline();
  }
})();
