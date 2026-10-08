/* V4 splash — v4/splash.njk, _splash.css, the head script in layouts/v4.njk.
 *
 * Three jobs:
 *   1. THE SKY. The card shows the visitor's sky now: where, from their time
 *      zone (mapped to that zone's main city); when, from their clock; then
 *      the sun's elevation and azimuth (standard solar position) pick a point
 *      on hand-tuned palettes, with a glow where the sun is and stars at night.
 *   2. THE CARD. At rest it wobbles (CSS). Hover (mouse), tap (touch) or
 *      keyboard focus opens it: upright, larger, with the hour track (the
 *      sun's real path through the day) to drag. Closing returns to now.
 *   3. THE COVER. Any scroll, swipe or page key lifts the splash and the
 *      homepage below plays its entrance; "See My Work" lifts it, then goes
 *      to Works.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var splash = document.querySelector("[data-splash]");
  if (!splash || !root.classList.contains("has-splash")) return;
  root.classList.add("splash-ready");     // the head script's fallback stands down

  var card = splash.querySelector("[data-splash-card]");
  var sky = splash.querySelector(".v4-splash__sky");
  var control = splash.querySelector(".v4-splash__control");
  var track = splash.querySelector(".v4-splash__track");
  var hourIn = splash.querySelector("#splash-hour");
  var nowBtn = splash.querySelector("[data-splash-now]");
  var timeEl = splash.querySelector("[data-splash-time]");
  var pathEl = splash.querySelector("[data-splash-path]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- 1. The sky ----------
  var ZONES = {
    "Europe/Amsterdam": [52.37, 4.9], "Europe/London": [51.51, -0.13], "Europe/Paris": [48.86, 2.35],
    "Europe/Berlin": [52.52, 13.4], "Europe/Brussels": [50.85, 4.35], "Europe/Madrid": [40.42, -3.7],
    "Europe/Rome": [41.9, 12.5], "Europe/Stockholm": [59.33, 18.07], "Europe/Oslo": [59.91, 10.75],
    "Europe/Copenhagen": [55.68, 12.57], "Europe/Helsinki": [60.17, 24.94], "Europe/Lisbon": [38.72, -9.14],
    "Europe/Dublin": [53.35, -6.26], "Europe/Zurich": [47.38, 8.54], "Europe/Vienna": [48.21, 16.37],
    "Europe/Warsaw": [52.23, 21.01], "Europe/Istanbul": [41.01, 28.98], "Europe/Athens": [37.98, 23.73],
    "Europe/Moscow": [55.76, 37.62], "Asia/Tehran": [35.69, 51.39], "Asia/Dubai": [25.2, 55.27],
    "Asia/Kolkata": [28.61, 77.21], "Asia/Singapore": [1.35, 103.82], "Asia/Shanghai": [31.23, 121.47],
    "Asia/Hong_Kong": [22.32, 114.17], "Asia/Tokyo": [35.68, 139.69], "Asia/Seoul": [37.57, 126.98],
    "Australia/Sydney": [-33.87, 151.21], "Australia/Melbourne": [-37.81, 144.96], "Pacific/Auckland": [-36.85, 174.76],
    "America/New_York": [40.71, -74.0], "America/Toronto": [43.65, -79.38], "America/Chicago": [41.88, -87.63],
    "America/Denver": [39.74, -104.99], "America/Los_Angeles": [34.05, -118.24], "America/Vancouver": [49.28, -123.12],
    "America/Mexico_City": [19.43, -99.13], "America/Sao_Paulo": [-23.55, -46.63], "America/Buenos_Aires": [-34.6, -58.38],
    "Africa/Cairo": [30.04, 31.24], "Africa/Lagos": [6.52, 3.38], "Africa/Johannesburg": [-26.2, 28.05],
    "Atlantic/Reykjavik": [64.15, -21.94]
  };
  function offsetHours(tz, date) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
        .formatToParts(date).find(function (x) { return x.type === "timeZoneName"; }).value;
      var m = p.match(/GMT([+-])(\d+)(?::(\d+))?/);
      return m ? (m[1] === "-" ? -1 : 1) * (+m[2] + (+m[3] || 0) / 60) : 0;
    } catch (e) { return -date.getTimezoneOffset() / 60; }
  }
  function placeFor(tz) {
    var c = ZONES[tz];
    if (c) return { tz: tz, lat: c[0], lon: c[1] };
    var south = /^(Australia|Pacific\/Auckland|America\/(Sao|Buenos|Santiago|Lima))/.test(tz);
    return { tz: tz, lat: south ? -30 : 45, lon: offsetHours(tz, new Date()) * 15 };
  }

  var RAD = Math.PI / 180;
  function sun(date, lat, lon) {
    var d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    var g = (357.529 + 0.98560028 * d) * RAD;
    var L = (280.459 + 0.98564736 * d + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
    var e = (23.439 - 0.00000036 * d) * RAD;
    var ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
    var dec = Math.asin(Math.sin(e) * Math.sin(L));
    var gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    var ha = (gmst * 15 + lon) * RAD - ra, la = lat * RAD;
    var alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha));
    var az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(la) - Math.tan(dec) * Math.cos(la)) / RAD + 180;
    return { alt: alt / RAD, az: az };
  }

  // Palettes by sun elevation: top, upper, lower, horizon.
  var KEYS = [
    [-90, ["#03050d", "#060a1a", "#0a1024", "#111832"]],
    [-18, ["#04060f", "#08102a", "#0e1838", "#18224a"]],
    [-12, ["#050a20", "#0f1c48", "#1d2f6e", "#33437f"]],
    [-6,  ["#0a133a", "#22337a", "#4b55a0", "#9c8bb8"]],
    [-2,  ["#101b4c", "#2f3f8c", "#7a78b8", "#efb3ae"]],
    [1,   ["#1d2f72", "#4c5fa8", "#c69fb6", "#f6c29c"]],
    [5,   ["#2f5aa6", "#6f93cf", "#c8cfe3", "#f8dcb8"]],
    [12,  ["#2f6cbf", "#6fa4de", "#b9d6f0", "#e8f0f6"]],
    [30,  ["#1f63bf", "#4f93e0", "#9ccaf2", "#d8ebf8"]],
    [90,  ["#1a58b5", "#438ade", "#8fc3f2", "#d2e8f8"]]
  ];
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }); }
  function rgb(c) { return "rgb(" + c.join(" ") + ")"; }
  function lum(c) {
    var s = c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * s[0] + .7152 * s[1] + .0722 * s[2];
  }
  function whiteReads(c) { var L = lum(c); return 1.05 / (L + .05) >= (L + .05) / .05; }
  function palette(alt, setting) {
    var i = 0;
    while (i < KEYS.length - 2 && alt > KEYS[i + 1][0]) i++;
    var a = KEYS[i], b = KEYS[i + 1];
    var t = Math.min(1, Math.max(0, (alt - a[0]) / (b[0] - a[0])));
    var cols = a[1].map(function (h, k) { return mix(hex(h), hex(b[1][k]), t); });
    if (setting && alt > -8 && alt < 10) {          // evenings run warmer at the horizon
      var w = 1 - Math.abs(alt - 1) / 9;
      cols[3] = mix(cols[3], [244, 150, 120], .22 * w);
      cols[2] = mix(cols[2], [200, 130, 150], .12 * w);
    }
    return cols;
  }

  var place = placeFor(Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Amsterdam");
  var live = true, at = new Date();
  function hhmm(date) { return new Intl.DateTimeFormat("en-GB", { timeZone: place.tz, hour: "2-digit", minute: "2-digit" }).format(date); }
  function minuteOf(date) { var p = hhmm(date).split(":"); return +p[0] * 60 + +p[1]; }
  function atMinute(min) { var now = new Date(); return new Date(now.getTime() + (min - minuteOf(now)) * 60000); }

  // The sun's path through the shown day, every 10 minutes from local
  // midnight. The horizon sits mid-height; the curve is scaled by the day's
  // largest |elevation| so it fills the track.
  var trackDay = "", elevations = [], maxAbs = 1;
  function drawTrack(date) {
    var dayStart = new Date(date.getTime() - minuteOf(date) * 60000);
    var key = place.tz + dayStart.toISOString().slice(0, 13);
    if (key !== trackDay) {
      trackDay = key; elevations = []; maxAbs = 1;
      for (var m = 0; m <= 1440; m += 10) {
        var a = sun(new Date(dayStart.getTime() + m * 60000), place.lat, place.lon).alt;
        elevations.push(a); maxAbs = Math.max(maxAbs, Math.abs(a));
      }
      pathEl.setAttribute("d", elevations.map(function (a, i) {
        return (i ? "L" : "M") + (i * 10) + " " + (50 - a / maxAbs * 46).toFixed(2);
      }).join(" "));
    }
    var min = +hourIn.value, i = Math.min(143, Math.floor(min / 10)), f = (min - i * 10) / 10;
    var y = elevations[i] + (elevations[i + 1] - elevations[i]) * f;
    track.style.setProperty("--dot-x", (min / 1440 * 100).toFixed(2) + "%");
    track.style.setProperty("--dot-y", (50 - y / maxAbs * 46).toFixed(2) + "%");
  }

  function render() {
    var date = live ? new Date() : at;
    var s = sun(date, place.lat, place.lon);
    var setting = sun(new Date(date.getTime() + 600000), place.lat, place.lon).alt < s.alt;
    var cols = palette(s.alt, setting);
    ["--c0", "--c1", "--c2", "--c3"].forEach(function (k, i) { sky.style.setProperty(k, rgb(cols[i])); });
    // Glow: east on the left of the card, west on the right; height from elevation.
    sky.style.setProperty("--sun-x", (8 + Math.min(1, Math.max(0, (s.az - 60) / 240)) * 84).toFixed(1) + "%");
    sky.style.setProperty("--sun-y", (96 - Math.max(-12, Math.min(70, s.alt)) * 1.2).toFixed(1) + "%");
    sky.style.setProperty("--glow", Math.max(0, Math.min(.9, (s.alt + 5) / 11)).toFixed(2));
    sky.style.setProperty("--stars", Math.max(0, Math.min(1, (-s.alt - 6) / 8)).toFixed(2));
    // Ink: white on a dark sky, black on a pale one; the controls read the bottom.
    sky.style.setProperty("--on-sky", whiteReads(cols[0]) ? "#FFFFFF" : "#000000");
    var low = whiteReads(mix(cols[2], cols[3], .6));
    control.style.setProperty("--on-sky", low ? "#FFFFFF" : "#000000");
    control.style.setProperty("--on-sky-soft", low ? "rgb(255 255 255 / .75)" : "#727272");

    timeEl.textContent = hhmm(date);
    if (live) hourIn.value = String(minuteOf(date));
    hourIn.setAttribute("aria-valuetext", hhmm(date));
    drawTrack(date);
    nowBtn.setAttribute("aria-pressed", live ? "true" : "false");
  }

  hourIn.addEventListener("input", function () { live = false; at = atMinute(+hourIn.value); render(); });
  nowBtn.addEventListener("click", function (e) { e.stopPropagation(); live = true; render(); });
  render();
  var tick = setInterval(function () { if (live) render(); }, 30000);

  // ---------- 2. The card ----------
  var hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");
  var open = false, settleTimer = 0;
  function setOpen(next) {
    if (next === open) return;
    open = next;
    clearTimeout(settleTimer);
    if (open) {
      card.style.rotate = getComputedStyle(card).rotate;   // freeze the wobble where it is
      card.classList.remove("is-settling");
      card.classList.add("is-open");
      requestAnimationFrame(function () { card.style.rotate = "0deg"; });
    } else {
      card.classList.remove("is-open");
      card.classList.add("is-settling");
      card.style.rotate = "-3deg";
      settleTimer = setTimeout(function () {                // hand back to the wobble
        card.classList.remove("is-settling");
        card.style.rotate = "";
      }, reduce.matches ? 0 : 620);
      live = true; render();
    }
  }
  card.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse" && hoverable.matches) setOpen(true); });
  card.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && hoverable.matches) setOpen(false); });
  card.addEventListener("click", function () { if (!hoverable.matches) setOpen(true); });
  splash.addEventListener("click", function (e) { if (!hoverable.matches && open && !card.contains(e.target)) setOpen(false); });
  card.addEventListener("focusin", function () { if (card.matches(":focus-visible") || card.querySelector(":focus-visible")) setOpen(true); });
  card.addEventListener("focusout", function (e) { if (!card.contains(e.relatedTarget) && !card.matches(":hover")) setOpen(false); });
  card.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); card.blur(); } });

  // ---------- 3. The cover ----------
  // While the splash is up the page beneath is inert; lifting it hands
  // everything back. The homepage starts its entrance part-way through the
  // lift, so it rises in as the cover clears it.
  var others = Array.prototype.slice.call(document.body.children).filter(function (el) {
    return el !== splash && el.tagName !== "SCRIPT";
  });
  others.forEach(function (el) { el.inert = true; });

  var LIFT = reduce.matches ? 0 : (parseFloat(getComputedStyle(root).getPropertyValue("--v4-splash-lift")) || .8) * 1000;
  var lifted = false;
  function lift(then) {
    if (lifted) return;
    lifted = true;
    clearInterval(tick);
    others.forEach(function (el) { el.inert = false; });
    window.scrollTo(0, 0);
    splash.classList.add("is-leaving");
    root.classList.add("splash-lifting");                 // keeps scroll locked until it is gone
    setTimeout(function () { root.classList.remove("has-splash"); }, LIFT * .45);
    setTimeout(function () {
      splash.classList.remove("is-leaving");
      splash.hidden = true;
      root.classList.remove("splash-lifting");
      if (then) then();
      else if (location.hash.length > 1) {                // a reload at /#section: go back to it
        var target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
      }
    }, LIFT + 120);                                        // a beat for trackpad momentum to die out
  }

  splash.querySelector("[data-splash-cta]").addEventListener("click", function (e) {
    e.preventDefault();
    lift(function () {
      var work = document.getElementById("work");
      if (work) work.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
    });
  });

  // Any scroll, either way, lifts it.
  splash.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaY) > 2) { e.preventDefault(); lift(); }
  }, { passive: false });

  // A vertical swipe lifts it, unless it is a drag on the open card's track.
  var touchY = null;
  splash.addEventListener("touchstart", function (e) {
    touchY = track.contains(e.target) ? null : e.touches[0].clientY;
  }, { passive: true });
  splash.addEventListener("touchmove", function (e) {
    if (touchY !== null && Math.abs(e.touches[0].clientY - touchY) > 24) { touchY = null; lift(); }
  }, { passive: true });

  // Page keys, unless the hour slider has focus (it uses the arrows itself).
  document.addEventListener("keydown", function (e) {
    if (lifted || e.target === hourIn) return;
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Spacebar", "Home", "End"].indexOf(e.key) !== -1) {
      if (e.key === " " && e.target.closest && e.target.closest("button, a")) return;
      e.preventDefault();
      lift();
    }
  });
})();
