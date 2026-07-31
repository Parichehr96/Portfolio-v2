/* Reduced time widget — home page LEFT sidebar (Figma 6:24129 / 16:3216).
 *
 * Shows the visitor's local time plus a live status (headline + sub-text)
 * derived from the current Amsterdam wall clock.
 *
 * Previously the right-sidebar "Live in Amsterdam" widget. The "best time to
 * reach me" range and the "Speak with me" CTA were dropped with the redesign —
 * the Contact nav owns contact now — so the zone-conversion helper and the
 * "HH:MM in Amsterdam" second line went with them. The SCHEDULE blocks and the
 * once-per-session phrasing pick are unchanged.
 *
 * Zero dependencies. Timezone + DST handled natively by the IANA string
 * "Europe/Amsterdam" via the Intl API — no manual UTC offsets baked in.
 */
(function () {
  "use strict";

  var root = document.getElementById("ls-clock");
  if (!root) return; // only present on index.html

  var els = {
    time: document.getElementById("ls-clock-time"),
    head: document.getElementById("ls-clock-head"),
    sub: document.getElementById("ls-clock-sub"),
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

  function render() {
    var now = new Date();
    var ams = amsHM(now);           // Amsterdam — drives the status text

    els.time.textContent = hhmm(now); // visitor local

    // Active block by Amsterdam minutes → its pre-picked phrasing + state.
    var mins = ams.h * 60 + ams.m;
    var idx = 0;
    for (var i = 0; i < SCHEDULE.length; i++) {
      if (mins >= SCHEDULE[i].start && mins < SCHEDULE[i].end) { idx = i; break; }
    }
    var block = SCHEDULE[idx];
    var variation = block.v[picks[idx]];
    els.head.textContent = variation.text;
    els.sub.textContent = variation.sub;
    // The redesigned connector has no state dot, so `block.dot` no longer paints
    // anything. Kept on the root as a data attribute so the live state is still
    // addressable if the cue comes back.
    root.setAttribute("data-state", block.dot);
  }

  render();
  // Recompute clock + status every minute (DST handled by the zone string).
  setInterval(render, 60000);
})();
