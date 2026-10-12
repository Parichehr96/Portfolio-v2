/* V4 footer trees in the wind — v4/footer.njk, _footer.css.
 *
 * The footer's Amsterdam illustration is an <img> (so it always shows). As
 * the footer nears the screen, this swaps it for the same SVG inline, whose
 * tree crowns are tagged (class="tree", a pivot at the base of each crown),
 * and sets how they sway from the wind in Amsterdam right now: Open-Meteo's
 * current 10 m wind speed (free, no key), kept for 15 minutes per tab. Calm
 * air barely stirs them; a stormy day bends them further and faster. If the
 * weather can't be fetched they sway as on a light breeze. Reduced motion:
 * no sway (CSS).
 */
(function () {
  "use strict";

  var holder = document.querySelector("[data-wind-art]");
  if (!holder || !("fetch" in window)) return;

  var URL_WIND = "https://api.open-meteo.com/v1/forecast?latitude=52.37&longitude=4.89&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh";
  var CACHE = "v4-wind";
  var BREEZE = 10;                                         // km/h, when the weather is unknown

  function setWind(kmh, fromDeg) {
    var v = Math.max(0, Math.min(90, +kmh || 0));
    // Lean with the wind: a westerly (from 180..360) pushes the crowns east (right).
    var dir = typeof fromDeg === "number" && fromDeg > 0 && fromDeg < 180 ? -1 : 1;
    var amp = Math.min(4.5, 0.6 + v * 0.09);               // degrees of lean
    var period = Math.max(1.4, 4.2 - v * 0.05);            // seconds per sway
    holder.style.setProperty("--wind-amp", (amp * dir).toFixed(2) + "deg");
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
      wind().then(function (c) { setWind(c.v, c.d); }).catch(function () {});
    }).catch(function () {});
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
