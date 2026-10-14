/* V4 sky panel — v4/sky.njk, _sky.css (Figma 1497:23079).
 *
 * The visitor's sky, right now, under the intro:
 *   1. THE SKY. Where, from their time zone (mapped to that zone's main
 *      city); when, from their clock; then the sun's elevation and azimuth
 *      (standard solar position) pick a point on hand-tuned palettes, with a
 *      glow where the sun is and stars at night.
 *   2. THE HOUR TRACK. Hover the sky (tap on touch, focus from the keyboard)
 *      and the time and the hour track appear: the sun's real path through
 *      the visitor's day, crossing the horizon at sunrise and sunset, with a
 *      dot to drag. Leaving returns to now.
 * Without this script the panel shows a clear midday sky (_sky.css).
 * Each redraw is announced on the panel ("v4:sky"), for the weather over it
 * (scripts/v4-weather.js).
 */
(function () {
  "use strict";

  var panel = document.querySelector("[data-sky]");
  if (!panel) return;
  var sky = panel;
  var control = panel.querySelector(".v4-sky__control");
  var track = panel.querySelector(".v4-sky__track");
  var hourIn = panel.querySelector("#sky-hour");
  var dayEl = panel.querySelector("[data-sky-day]");
  var nowBtn = panel.querySelector("[data-sky-now]");
  var timeEl = panel.querySelector("[data-sky-time]");
  var pathEl = panel.querySelector("[data-sky-path]");
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
    // The city named after the zone ("Europe/Amsterdam" → "Amsterdam"), unless its point is another city's.
    if (c) return { tz: tz, lat: c[0], lon: c[1], city: ({ "Asia/Kolkata": "New Delhi" })[tz] || tz.split("/").pop().replace(/_/g, " ") };
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
    sky.style.setProperty("--c4", rgb(mix(cols[1], cols[0], .25)));   // the thin dark band at the foot
    // Glow: east on the left of the panel, west on the right; height from elevation.
    sky.style.setProperty("--sun-x", (8 + Math.min(1, Math.max(0, (s.az - 60) / 240)) * 84).toFixed(1) + "%");
    // Height: the horizon sits at 66%, just over the hour track (so a low winter sun clears it),
    // up to 8% at 70° and down to 76% at 12° below.
    sky.style.setProperty("--sun-y", (66 - Math.max(-12, Math.min(70, s.alt)) * .83).toFixed(1) + "%");
    sky.style.setProperty("--glow", Math.max(0, Math.min(.9, (s.alt + 5) / 11)).toFixed(2));
    sky.style.setProperty("--stars", Math.max(0, Math.min(1, (-s.alt - 6) / 8)).toFixed(2));
    timeEl.textContent = hhmm(date);
    // The track's label: the day the sky is for, as "Oct 14".
    if (dayEl) dayEl.textContent = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (live) hourIn.value = String(minuteOf(date));
    hourIn.setAttribute("aria-valuetext", hhmm(date));
    drawTrack(date);
    nowBtn.setAttribute("aria-pressed", live ? "true" : "false");
    // For the weather over it (scripts/v4-weather.js): when, where, the sun, the colours.
    panel.dispatchEvent(new CustomEvent("v4:sky", { detail: {
      date: date, live: live, alt: s.alt, setting: setting, cols: cols,
      lat: place.lat, lon: place.lon, tz: place.tz, city: place.city || "" } }));
  }

  hourIn.addEventListener("input", function () { live = false; at = atMinute(+hourIn.value); render(); });
  nowBtn.addEventListener("click", function (e) { e.stopPropagation(); live = true; render(); });
  render();
  setInterval(function () { if (live) render(); }, 30000);

  // ---------- 2. The hour track ----------
  var hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");
  var open = false;
  function setOpen(next) {
    if (next === open) return;
    open = next;
    panel.classList.toggle("is-open", open);
    panel.dispatchEvent(new CustomEvent("v4:window", { bubbles: true, detail: { open: open } }));   // for scripts/v4-analytics.js
    if (!open) { live = true; render(); }               // back to the sky right now
  }
  panel.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse" && hoverable.matches) setOpen(true); });
  panel.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && hoverable.matches) setOpen(false); });
  panel.addEventListener("click", function () { if (!hoverable.matches) setOpen(true); });
  document.addEventListener("click", function (e) { if (!hoverable.matches && open && !panel.contains(e.target)) setOpen(false); });
  panel.addEventListener("focusin", function () { if (panel.matches(":focus-visible") || panel.querySelector(":focus-visible")) setOpen(true); });
  panel.addEventListener("focusout", function (e) { if (!panel.contains(e.relatedTarget) && !panel.matches(":hover")) setOpen(false); });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); panel.blur(); } });
})();
