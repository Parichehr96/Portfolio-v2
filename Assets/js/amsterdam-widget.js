/* "Live in Amsterdam" widget — home page right sidebar only.
 *
 * Shows the visitor's local time (and Amsterdam time when they differ), a live
 * status (dot + headline + sub-text) derived from the current Amsterdam wall
 * clock, and a "best time to reach me" range converted to the visitor's zone.
 *
 * Zero dependencies. Timezone + DST handled natively by the IANA string
 * "Europe/Amsterdam" via the Intl API — no manual UTC offsets baked in.
 */
(function () {
  "use strict";

  var root = document.getElementById("live-widget");
  if (!root) return; // only present on index.html

  var els = {
    visitorTime: document.getElementById("lw-visitor-time"),
    amsTime: document.getElementById("lw-ams-time"),
    dot: document.getElementById("lw-dot"),
    head: document.getElementById("lw-status-head"),
    sub: document.getElementById("lw-status-sub"),
    range: document.getElementById("lw-range"),
  };

  var M = function (h, m) { return h * 60 + (m || 0); };

  // Amsterdam schedule. Each block: time window, dot state, and 3–5 phrasings.
  var SCHEDULE = [
    { start: M(0, 0), end: M(7, 0), dot: "sleep", v: [
      { text: "Probably asleep", sub: "Resting and recharging. Back online after 9." },
      { text: "Definitely asleep", sub: "Not a chance I'm awake right now." },
      { text: "Asleep", sub: "The best design decisions happen after rest." },
      { text: "Offline until morning", sub: "Even designers need to shut down sometimes." },
    ] },
    { start: M(7, 0), end: M(8, 30), dot: "away", v: [
      { text: "Morning routine", sub: "Gym, breakfast, and planning the day." },
      { text: "Getting ready", sub: "Probably at the gym or making breakfast." },
      { text: "Starting slow", sub: "Coffee hasn't kicked in yet." },
      { text: "Warming up", sub: "Gym first, then the hard problems." },
    ] },
    { start: M(8, 30), end: M(9, 0), dot: "active", v: [
      { text: "Starting the day", sub: "Coffee, inbox, and setting priorities." },
      { text: "Planning mode", sub: "Figuring out what matters most today." },
      { text: "Inbox zero attempt", sub: "Coffee in hand, priorities taking shape." },
      { text: "First coffee", sub: "Reviewing yesterday's decisions with fresh eyes." },
    ] },
    { start: M(9, 0), end: M(12, 30), dot: "active", v: [
      { text: "Probably in deep work", sub: "Designing, prototyping, or solving complex product problems." },
      { text: "Deep work mode", sub: "Headphones on, flows open, solving something." },
      { text: "In the zone", sub: "Probably arguing with a flow that almost works." },
      { text: "Focused", sub: "Somewhere between wireframes and high-fidelity." },
      { text: "Building something", sub: "Prototyping, testing ideas, or refining structure." },
    ] },
    { start: M(12, 30), end: M(13, 30), dot: "away", v: [
      { text: "Probably at lunch", sub: "Away from the screen. Back in an hour." },
      { text: "Lunch break", sub: "Recharging with food, not pixels." },
      { text: "Away for lunch", sub: "The best ideas come after eating." },
      { text: "Offline briefly", sub: "Even the cursor needs a break." },
    ] },
    { start: M(13, 30), end: M(16, 30), dot: "active", v: [
      { text: "Probably collaborating", sub: "Meetings, design reviews, and working with product and engineering." },
      { text: "In collaboration mode", sub: "Reviewing designs, aligning with engineering, or in a product sync." },
      { text: "Working with the team", sub: "Design reviews, feedback sessions, or whiteboarding." },
      { text: "Talking through problems", sub: "The afternoon is for alignment and shared decisions." },
    ] },
    { start: M(16, 30), end: M(18, 0), dot: "active", v: [
      { text: "Wrapping up the day", sub: "Finishing features and documenting design decisions." },
      { text: "End of day push", sub: "Polishing the last details before closing the laptop." },
      { text: "Documenting", sub: "Making sure tomorrow-me understands today's decisions." },
      { text: "Tying up loose ends", sub: "Cleaning up files, writing notes, shipping what's ready." },
    ] },
    { start: M(18, 0), end: M(20, 0), dot: "away", v: [
      { text: "Learning something new", sub: "Exploring AI workflows, building side projects, or reading." },
      { text: "Experimenting", sub: "Probably building something no one asked for." },
      { text: "Side project time", sub: "The playground where constraints don't exist." },
      { text: "Curiosity hour", sub: "Reading, tinkering, or going down a rabbit hole." },
    ] },
    { start: M(20, 0), end: M(22, 30), dot: "away", v: [
      { text: "Offline for the evening", sub: "Cooking, relaxing, or spending time with friends." },
      { text: "Off the clock", sub: "Probably cooking something ambitious." },
      { text: "Personal time", sub: "Design brain is off. Human brain is on." },
      { text: "Done for today", sub: "Somewhere between the kitchen and the couch." },
    ] },
    { start: M(22, 30), end: M(24, 0), dot: "sleep", v: [
      { text: "Winding down", sub: "Probably reading before bed." },
      { text: "Almost offline", sub: "A book, some quiet, then sleep." },
      { text: "Shutting down", sub: "Tomorrow's problems can wait." },
      { text: "End of the day", sub: "Reading, reflecting, and letting the day go." },
    ] },
  ];

  // Pick one phrasing per block on load — stable for the session, fresh on reload.
  var picks = SCHEDULE.map(function (b) {
    return Math.floor(Math.random() * b.v.length);
  });
  if (window.console && console.log) {
    console.log("[amsterdam-widget] picked variation indices:", picks);
  }

  var visitorTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (window.console && console.log) {
    console.log("[amsterdam-widget] visitor timeZone:", visitorTZ);
  }

  // "HH:MM" for a Date in the given IANA zone (visitor-local when tz omitted).
  function hhmm(date, tz) {
    var opts = { hour: "2-digit", minute: "2-digit", hour12: false };
    if (tz) opts.timeZone = tz;
    return new Intl.DateTimeFormat("en-GB", opts).format(date);
  }

  // Amsterdam wall clock as {h, m, str}.
  function amsHM(date) {
    var s = hhmm(date, "Europe/Amsterdam");
    var parts = s.split(":");
    return { h: +parts[0], m: +parts[1], str: s };
  }

  // Convert an Amsterdam wall time (h:m, today) to the visitor's local "HH:MM".
  function amsWallToLocal(h, m) {
    var now = new Date();
    // Amsterdam's current UTC offset (ms), DST-aware.
    var amsOffsetMs =
      new Date(now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" })) -
      new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    // Today's date in Amsterdam.
    var p = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(now);
    var get = function (t) { return +p.find(function (x) { return x.type === t; }).value; };
    // UTC instant for "Amsterdam y-mo-d h:m", then format in the visitor's zone.
    var utcMs = Date.UTC(get("year"), get("month") - 1, get("day"), h, m) - amsOffsetMs;
    return hhmm(new Date(utcMs));
  }

  // Best time to reach me: 09:00–17:00 CET, converted if the visitor isn't in CET.
  function renderRange() {
    var a = amsWallToLocal(9, 0);
    var b = amsWallToLocal(17, 0);
    if (a === "09:00" && b === "17:00") {
      els.range.textContent = "09:00 – 17:00";
    } else {
      els.range.textContent = a + " – " + b + " (your time)";
    }
  }

  function render() {
    var now = new Date();
    var local = hhmm(now);          // visitor local
    var ams = amsHM(now);           // Amsterdam

    els.visitorTime.textContent = local;

    // Second line only when the visitor's wall clock differs from Amsterdam's
    // (covers both other zones and same-offset zones — no redundancy).
    if (local === ams.str) {
      els.amsTime.hidden = true;
      els.amsTime.textContent = "";
    } else {
      els.amsTime.hidden = false;
      els.amsTime.textContent = ams.str + " in Amsterdam";
    }

    // Active block by Amsterdam minutes → its pre-picked phrasing + dot state.
    var mins = ams.h * 60 + ams.m;
    var idx = 0;
    for (var i = 0; i < SCHEDULE.length; i++) {
      if (mins >= SCHEDULE[i].start && mins < SCHEDULE[i].end) { idx = i; break; }
    }
    var block = SCHEDULE[idx];
    var variation = block.v[picks[idx]];
    els.head.textContent = variation.text;
    els.sub.textContent = variation.sub;
    els.dot.className = "lw-dot lw-dot--" + block.dot;
  }

  renderRange();
  render();
  // Recompute clock + status every minute (DST handled by the zone string).
  setInterval(function () { render(); renderRange(); }, 60000);
})();
