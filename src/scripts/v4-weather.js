/* V4 sky weather — v4/sky.njk, _sky.css, over scripts/v4-sky.js.
 *
 * The visitor's weather in their sky, soft, in the sky's own light, the way
 * Apple's Weather draws it:
 *   CLOUDS: blurred, layered puffs (high and thin, mid, low and heavy), as
 *     many as the real cloud cover, lit by the sky (white by day, warm at
 *     sunset, dim at night), drifting with the real wind's speed and way.
 *     Heavy cover greys the whole sky; fog hazes it.
 *   RAIN, DRIZZLE, SNOW: falling at the wind's angle. Rain splashes on the
 *     hour track's bar and on the foot of the glass, as on a surface; snow
 *     rests there a moment and melts. Thunder flashes now and then.
 *   THE HOUR TRACK: dragged, the weather follows the day's hourly forecast.
 *   HOVER: a tooltip, "Your sky (Amsterdam): 70% cloud, light rain", the city
 *     the forecast is for (left out where the time zone has no city of ours).
 * The weather is Open-Meteo's (free, no key), for the place the sky is drawn
 * for (the visitor's time zone's city), kept 15 minutes per tab. Drawn only
 * while the sky is on screen; reduced motion keeps the clouds still and
 * nothing falling. If the weather can't be had, the sky stays clear.
 * ?sky-weather=rain (snow, drizzle, thunder, fog, cloudy, clear) previews one.
 */
(function () {
  "use strict";

  var panel = document.querySelector("[data-sky]");
  if (!panel || !("fetch" in window) || !window.CanvasRenderingContext2D) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var cv = document.createElement("canvas");
  cv.className = "v4-sky__weather";
  cv.setAttribute("aria-hidden", "true");
  panel.insertBefore(cv, panel.firstChild);
  var ctx = cv.getContext("2d");
  var tip = document.createElement("div");
  tip.className = "v4-sky__tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
  panel.parentNode.appendChild(tip);

  var W = 0, H = 0, DPR = 1;
  function size() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = panel.clientWidth; H = panel.clientHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // ---------- The weather ----------
  var sky = null, data = null;
  var KEY = "v4-weather";
  function fetchWeather(lat, lon) {
    var id = lat.toFixed(2) + "," + lon.toFixed(2);
    try { var c = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (c && c.id === id && Date.now() - c.t < 15 * 60000 && c.d && c.d.hourly && c.d.current) return Promise.resolve(c.d); } catch (e) {}
    var vars = "cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,weather_code,precipitation,snowfall,wind_speed_10m,wind_direction_10m";
    return fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
      "&current=" + vars + "&hourly=" + vars + "&wind_speed_unit=kmh&timezone=auto&forecast_days=2")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.hourly || !d.current) throw new Error("no weather");   // never keep a failed answer
        try { sessionStorage.setItem(KEY, JSON.stringify({ id: id, t: Date.now(), d: d })); } catch (e) {} return d; });
  }

  // The hour's local stamp in the place's time zone, as Open-Meteo writes it.
  function stamp(date, tz) {
    var p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(date).reduce(function (o, x) { o[x.type] = x.value; return o; }, {});
    return p.year + "-" + p.month + "-" + p.day + "T" + p.hour + ":00";
  }
  function kindOf(code) {
    if (code >= 95) return "thunder";
    if (code >= 71 && code <= 77 || code === 85 || code === 86) return "snow";
    if (code >= 61 && code <= 67 || code >= 80 && code <= 82) return "rain";
    if (code >= 51 && code <= 57) return "drizzle";
    if (code === 45 || code === 48) return "fog";
    return "none";
  }
  // ?sky-weather=rain (snow, drizzle, thunder, fog, cloudy, clear) previews a weather.
  var FORCE = (location.search.match(/[?&]sky-weather=(\w+)/) || [])[1];
  var PREVIEW = { clear: [0, 0, 0, 0, 0, 8], cloudy: [.75, 0, 0, 3, 0, 18], rain: [.9, 2.5, 0, 63, 0, 22], drizzle: [.8, .3, 0, 53, 0, 10],
    thunder: [1, 6, 0, 95, 0, 30], snow: [.85, 0, 1.2, 73, 0, 12], fog: [.95, 0, 0, 45, 0, 4] };
  // What the weather is at the sky's moment: now, or the dragged hour (eased between hours).
  function weatherAt(d) {
    if (FORCE && PREVIEW[FORCE]) { var v = PREVIEW[FORCE];
      return { cover: v[0], low: v[0] * .7, mid: v[0] * .5, high: v[0] * .4, precip: v[1], snow: v[2], wind: v[5], dir: 250, code: v[3], kind: kindOf(v[3]) }; }
    if (!data || !data.hourly) return null;
    var h = data.hourly, src = d.live && data.current ? data.current : null;
    var i = h.time.indexOf(stamp(d.date, d.tz));
    if (i < 0 && !src) return null;
    var f = (d.date.getUTCMinutes() || 0) / 60, j = Math.min(h.time.length - 1, i + 1);
    function at(k) { if (src && src[k] != null) return src[k]; return i < 0 ? 0 : h[k][i] + (h[k][j] - h[k][i]) * f; }
    var code = src ? src.weather_code : h.weather_code[f < .5 ? i : j];
    return { cover: at("cloud_cover") / 100, low: (i < 0 ? at("cloud_cover") : h.cloud_cover_low[i]) / 100,
      mid: (i < 0 ? 0 : h.cloud_cover_mid[i]) / 100, high: (i < 0 ? 0 : h.cloud_cover_high[i]) / 100,
      precip: at("precipitation"), snow: at("snowfall"), wind: at("wind_speed_10m"), dir: at("wind_direction_10m"),
      code: code, kind: kindOf(code) };
  }

  // The state drawn, easing towards the weather (so dragging changes it gently).
  var now = { cover: 0, low: 0, mid: 0, high: 0, rain: 0, snow: 0, fog: 0, wind: 8, east: 1, thunder: 0 };
  var want = Object.assign({}, now), wx = null;
  function setWant() {
    if (!sky) return;
    wx = weatherAt(sky);
    if (!wx) return;
    var wet = wx.kind === "rain" || wx.kind === "thunder" ? Math.max(.25, Math.min(1, wx.precip / 4)) : wx.kind === "drizzle" ? .18 : 0;
    var low = wx.low, mid = wx.mid, high = wx.high;
    if (low + mid + high < .05 && wx.cover > .05) { low = wx.cover * .6; mid = wx.cover * .4; }
    want = { cover: wx.cover, low: low, mid: mid, high: high, rain: wet,
      snow: wx.kind === "snow" ? Math.max(.25, Math.min(1, (wx.snow || .5) / 1.5)) : 0,
      fog: wx.kind === "fog" ? 1 : 0, wind: wx.wind || 0,
      // Blowing from the west (180..360), it drifts east, to the right; from the east, left.
      east: wx.dir > 0 && wx.dir < 180 ? -1 : 1, thunder: wx.kind === "thunder" ? 1 : 0 };
  }

  // ---------- Drawing ----------
  // Cloud sprites: soft puffs, pre-blurred, white; tinted per light.
  function sprite(seed, flat) {
    var w = 360, h = Math.round(w * (flat ? .3 : .55)), c = document.createElement("canvas");
    c.width = w; c.height = h;
    var g = c.getContext("2d"), r = rnd(seed);
    g.filter = "blur(" + (flat ? 10 : 7) + "px)";
    for (var k = 0; k < (flat ? 7 : 11); k++) {
      var x = w * (.2 + r() * .6), y = h * (flat ? .5 : .45 + r() * .25), rad = h * (flat ? .22 + r() * .2 : .2 + r() * .22);
      var gr = g.createRadialGradient(x, y - rad * .2, rad * .1, x, y, rad);
      gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
    return c;
  }
  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  var SPRITES = [], FLAT = [];
  for (var s = 1; s <= 5; s++) { SPRITES.push(sprite(s * 7919, false)); FLAT.push(sprite(s * 104729, true)); }

  // The light on the clouds: lit tops and shaded bellies, from the sun's height.
  function light() {
    var a = sky ? sky.alt : 30, day = Math.max(0, Math.min(1, (a + 4) / 14)), dusk = Math.max(0, 1 - Math.abs(a - 2) / 10) * (sky && sky.setting !== undefined ? 1 : 0);
    var top = [lerp(70, 255, day), lerp(80, 255, day), lerp(108, 255, day)];
    top = [lerp(top[0], 255, dusk * .4), lerp(top[1], 214, dusk * .4), lerp(top[2], 186, dusk * .4)];
    var belly = [lerp(42, 196, day), lerp(48, 202, day), lerp(70, 214, day)];
    return { top: top, belly: belly, dim: lerp(.55, 1, day) };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var tinted = {}, tintKey = "";
  function tint(img, L, key) {
    var k = key + tintKey;
    if (tinted[k]) return tinted[k];
    var c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    var g = c.getContext("2d"); g.drawImage(img, 0, 0); g.globalCompositeOperation = "source-in";
    var gr = g.createLinearGradient(0, 0, 0, img.height);
    gr.addColorStop(0, "rgb(" + L.top.map(Math.round) + ")"); gr.addColorStop(1, "rgb(" + L.belly.map(Math.round) + ")");
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    return (tinted[k] = c);
  }

  // The cloud decks: high (thin, wispy, quick), mid, low (heavy, slow).
  var DECKS = [
    { name: "high", n: 7, flat: true, y: [.02, .3], w: [.4, .7], a: .55, v: 1.25 },
    { name: "mid", n: 7, flat: false, y: [.1, .45], w: [.3, .5], a: .8, v: 1 },
    { name: "low", n: 9, flat: false, y: [.3, .72], w: [.4, .65], a: .95, v: .8 },
  ];
  var clouds = [], rs = rnd(4242);
  DECKS.forEach(function (d) {
    for (var k = 0; k < d.n; k++) clouds.push({ deck: d, k: k, x: rs(), y: d.y[0] + rs() * (d.y[1] - d.y[0]), w: d.w[0] + rs() * (d.w[1] - d.w[0]), s: Math.floor(rs() * 5), a: 0 });
  });

  // Rain, drizzle and snow, and the splashes; the surfaces they land on.
  var drops = [], splashes = [];
  function surfaces() {
    var list = [{ y: H * .913, x0: 0, x1: W }];                   // the foot of the glass
    if (panel.classList.contains("is-open")) {
      [".v4-sky__control", ".v4-sky__time"].forEach(function (sel) {
        var el = panel.querySelector(sel); if (!el || getComputedStyle(el).visibility === "hidden") return;
        var r = el.getBoundingClientRect(), p = panel.getBoundingClientRect();
        list.push({ y: r.top - p.top, x0: r.left - p.left + 6, x1: r.right - p.left - 6 });
      });
    }
    return list;
  }
  function newDrop(top) {
    return { x: Math.random() * (W + 120) - 60, y: top ? -Math.random() * 30 : Math.random() * H, v: .85 + Math.random() * .4, r: Math.random(), rest: 0 };
  }

  var flash = 0, nextFlash = 0, last = 0, raf = 0, seen = false;
  function frame(t) {
    raf = 0;
    if (!seen || document.hidden) { last = 0; return; }
    var dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t;
    var still = reduce.matches;
    for (var k in now) now[k] += (want[k] - now[k]) * Math.min(1, dt * 1.6);   // ease to the weather
    var L = light(), key = L.top.map(function (x) { return Math.round(x / 12); }).join(",");
    if (key !== tintKey) { tintKey = key; tinted = {}; }

    ctx.clearRect(0, 0, W, H);
    // Heavy cover greys the sky, fog hazes it.
    var grey = Math.max(0, now.cover - .55) / .45;
    if (grey > 0) { ctx.fillStyle = "rgba(" + L.belly.map(Math.round) + "," + (grey * .55 * L.dim).toFixed(3) + ")"; ctx.fillRect(0, 0, W, H); }

    // Clouds drift with the wind: about 6px/s on a calm day, faster as it blows.
    var drift = (4 + now.wind * .9) * (W / 595) * now.east * (still ? 0 : 1);
    clouds.forEach(function (c) {
      var d = c.deck, cover = now[d.name];
      var need = c.k < Math.round(cover * d.n + (cover > .02 ? .5 : 0));
      c.a += ((need ? 1 : 0) - c.a) * Math.min(1, dt * .8);
      var cw = c.w * W;
      c.x += drift * d.v * dt / W;
      if (c.x * W > W + cw * .1 && drift > 0) { c.x = -cw / W; c.y = d.y[0] + Math.random() * (d.y[1] - d.y[0]); }
      if (c.x * W + cw < -cw * .1 && drift < 0) { c.x = 1; c.y = d.y[0] + Math.random() * (d.y[1] - d.y[0]); }
      if (c.a < .01) return;
      var img = tint((d.flat ? FLAT : SPRITES)[c.s], L, (d.flat ? "f" : "s") + c.s);
      ctx.globalAlpha = c.a * d.a * (.75 + .25 * cover) * L.dim;
      ctx.drawImage(img, c.x * W, c.y * H - cw * img.height / img.width / 2, cw, cw * img.height / img.width);
    });
    ctx.globalAlpha = 1;
    if (now.fog > .01) {
      var fg = ctx.createLinearGradient(0, 0, 0, H);
      fg.addColorStop(0, "rgba(" + L.top.map(Math.round) + "," + (.2 * now.fog) + ")");
      fg.addColorStop(1, "rgba(" + L.top.map(Math.round) + "," + (.55 * now.fog) + ")");
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
    }

    // Rain and snow.
    var target = still ? 0 : Math.round(now.rain * 220 + now.snow * 120);
    while (drops.length < target) drops.push(newDrop(false));
    if (drops.length > target) drops.length = target;
    var surf = drops.length ? surfaces() : [], snowy = now.snow > now.rain;
    var wx2 = now.east * Math.min(260, now.wind * 6) * (W / 595);
    ctx.lineCap = "round";
    drops.forEach(function (p) {
      if (snowy) {
        if (p.rest > 0) { p.rest -= dt; ctx.globalAlpha = Math.max(0, p.rest) * .9; }
        else {
          var vy = (34 + p.r * 30) * (H / 242), vx = wx2 * .25 + Math.sin(t / 700 + p.r * 9) * 14;
          var ny = p.y + vy * dt;
          for (var k = 0; k < surf.length; k++) { var s = surf[k]; if (p.y < s.y && ny >= s.y && p.x > s.x0 && p.x < s.x1) { ny = s.y - 1; p.rest = .9 + p.r; break; } }
          p.y = ny; p.x += vx * dt; ctx.globalAlpha = .85;
        }
        if (p.y > H + 4 || (p.rest < 0)) { Object.assign(p, newDrop(true)); }
        ctx.fillStyle = "rgba(255,255,255," + L.dim + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 + p.r * 1.4, 0, Math.PI * 2); ctx.fill();
        return;
      }
      var drizzle = now.rain < .22;
      var vyR = (drizzle ? 420 : 760) * p.v * (H / 242), vxR = wx2;
      var y2 = p.y + vyR * dt, x2 = p.x + vxR * dt, hit = null;
      for (var m = 0; m < surf.length; m++) { var u = surf[m]; if (p.y < u.y && y2 >= u.y && x2 > u.x0 && x2 < u.x1) { hit = u; break; } }
      if (hit) {
        for (var q = 0; q < 2 + (p.r * 3 | 0); q++)
          splashes.push({ x: x2, y: hit.y - .5, vx: (Math.random() - .5) * 60 + vxR * .1, vy: -(30 + Math.random() * 60), life: .28 + Math.random() * .12 });
        Object.assign(p, newDrop(true)); return;
      }
      p.x = x2; p.y = y2;
      if (p.y > H + 10 || p.x < -80 || p.x > W + 80) { Object.assign(p, newDrop(true)); return; }
      var len = drizzle ? 6 : 13;
      ctx.strokeStyle = "rgba(220,232,250," + ((drizzle ? .35 : .5) * L.dim).toFixed(2) + ")";
      ctx.lineWidth = drizzle ? .8 : 1.1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - vxR / vyR * len, p.y - len); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    for (var z = splashes.length - 1; z >= 0; z--) {
      var sp = splashes[z]; sp.life -= dt;
      if (sp.life <= 0) { splashes.splice(z, 1); continue; }
      sp.vy += 420 * dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt;
      ctx.fillStyle = "rgba(225,236,252," + (sp.life * 2.4 * L.dim).toFixed(2) + ")";
      ctx.fillRect(sp.x, sp.y, 1.4, 1.4);
    }

    // Thunder: a flash now and then, flickering twice.
    if (now.thunder > .5 && !still) {
      if (!nextFlash) nextFlash = t + 2500 + Math.random() * 5000;
      if (t >= nextFlash) { flash = 1; nextFlash = t + 4000 + Math.random() * 6000; }
    }
    if (flash > 0) {
      ctx.fillStyle = "rgba(235,240,255," + (flash * (flash > .6 ? .45 : .25)).toFixed(2) + ")"; ctx.fillRect(0, 0, W, H);
      flash -= dt * 2.8;
    }
    raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && seen && !document.hidden) raf = requestAnimationFrame(frame); }

  // ---------- The sky's moments, and the tooltip ----------
  // The weather for the sky's place; tried again every 2 minutes if it can't be had,
  // and refreshed every 15 while the page stays open.
  var retry = 0;
  function load() {
    clearTimeout(retry);
    fetchWeather(sky.lat, sky.lon).then(function (d) { data = d; setWant(); wake(); retry = setTimeout(load, 15 * 60000); })
      .catch(function () { retry = setTimeout(load, 2 * 60000); });
  }
  var asked = "";
  panel.addEventListener("v4:sky", function (e) {
    sky = e.detail;
    var id = sky.lat + "," + sky.lon;
    if (asked !== id && !FORCE) { asked = id; load(); }
    setWant(); wake();
  });

  function words() {
    var place = sky && sky.city ? " (" + sky.city + ")" : "";
    var whose = window.__consent === "denied" ? "My sky" : "Your sky";   // after a no, the sky is mine
    if (!wx) return sky ? whose + place + ": checking the weather\u2026" : "";
    var pct = Math.round(wx.cover * 100), what = "";
    if (wx.kind === "thunder") what = "thunderstorm";
    else if (wx.kind === "snow") what = "snow";
    else if (wx.kind === "fog") what = "fog";
    else if (wx.kind === "drizzle") what = "drizzle";
    else if (wx.kind === "rain") what = wx.precip < 1 ? "light rain" : wx.precip > 4 ? "heavy rain" : "rain";
    var where = sky && sky.city ? " (" + sky.city + ")" : "";       // the city the forecast is for
    return whose + where + ": " + (pct < 5 ? "clear" : pct + "% cloud") + (what ? ", " + what : "");
  }
  panel.addEventListener("pointermove", function (e) {
    var text = words();
    if (!text || e.target.closest(".v4-sky__control, .v4-sky__time")) { tip.hidden = true; return; }
    tip.textContent = text; tip.hidden = false;
    var r = panel.parentNode.getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - r.left + 14, r.width - tip.offsetWidth) + "px";
    tip.style.top = (e.clientY - r.top - tip.offsetHeight - 12) + "px";
  });
  panel.addEventListener("pointerleave", function () { tip.hidden = true; });

  size();
  if (window.ResizeObserver) new ResizeObserver(size).observe(panel); else window.addEventListener("resize", size);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { seen = en[0].isIntersecting; wake(); }).observe(panel);
  } else { seen = true; }
  document.addEventListener("visibilitychange", wake);
})();
