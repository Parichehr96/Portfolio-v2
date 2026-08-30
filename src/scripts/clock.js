/* Live time widget — About Me (Figma 185:2029).
 *
 * Shows the AMSTERDAM time plus a live status (headline + sub-text) derived
 * from the same Amsterdam wall clock.
 *
 * The schedule below, its phrasings and the once-per-load variation pick are
 * carried over VERBATIM from the v2 sidebar widget — the rules are Pari's and
 * are not being redesigned here. Two things did change:
 *
 *   • Selectors. This queried #ls-clock*, which the Phase 0 scaffold renamed
 *     out from under it, so the module had been silently dead: its first line
 *     returned null on every page. It now binds to the About widget's
 *     data-clock-* hooks.
 *   • The displayed time was the VISITOR's local time while the status came
 *     from Amsterdam, so the two disagreed for anyone outside NL — the clock
 *     could read 20:00 next to "Probably in deep work". Both now come from
 *     Amsterdam, which is the point of the widget: it says what Pari is doing,
 *     not what time it is for you.
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

  var root = document.querySelector("[data-clock]");
  if (!root) return; // About section not on this page

  var els = {
    time: root.querySelector("[data-clock-time]"),
    lead: root.querySelector("[data-clock-lead]"),
    head: root.querySelector("[data-clock-status]"),
    sub: root.querySelector("[data-clock-detail]"),
    hour: root.querySelector("[data-clock-hour]"),
    minute: root.querySelector("[data-clock-minute]"),
    second: root.querySelector("[data-clock-second]"),
  };
  if (!els.time || !els.head || !els.sub) return;

  /* THE HANDS' PIVOT, and it must match the hub in about.njk's SVG. The <line>s
     are authored pointing at 12 and rotated about this point; the <circle> that
     draws the hub sits on it too. Both are in the 118 x 80 viewBox from
     543:1205, so this is a coordinate in that space, not in CSS pixels. */
  var PIVOT = "52 30";

  /* THE SECOND HAND IS CSS'S, AND THIS IS THE ONLY THING JS DOES FOR IT: hand it
     a negative animation-delay equal to the seconds already elapsed, so the 60s
     sweep starts part-way through instead of snapping to 12 on load. Set ONCE —
     rewriting it on every render() would restart the animation each minute and
     the hand would visibly jump.

     Seconds are zone-independent (every IANA offset is a whole number of
     minutes), so the visitor's own clock gives the same value Amsterdam would
     and no conversion is needed here. */
  if (els.second) {
    var startedAt = new Date();
    els.second.style.setProperty(
      "--clock-second-offset",
      "-" + (startedAt.getSeconds() + startedAt.getMilliseconds() / 1000) + "s"
    );
  }

  /* The light prefix is PER STATUS, not a fixed "I'm". Most phrases follow a
     bare "I'm" and carry no `pre` of their own; the eleven that need a
     preposition declare one, because "I'm lunch break" is not a sentence. The
     phrase itself stays lowercase so prefix and phrase read as one line. */
  var DEFAULT_PRE = "I'm";

  var M = function (h, m) { return h * 60 + (m || 0); };

  // Amsterdam schedule. Each block: time window, dot state, and 3–5 phrasings.
  var SCHEDULE = [
    { start: M(0, 0), end: M(7, 0), dot: "sleep", v: [
      { text: "probably asleep", sub: "Resting and recharging. Back online after 9." },
      { text: "definitely asleep", sub: "Not a chance I'm awake right now." },
      { text: "asleep", sub: "The best design decisions happen after rest." },
      { text: "offline until morning", sub: "Even designers need to shut down sometimes." },
    ] },
    { start: M(7, 0), end: M(8, 30), dot: "away", v: [
      { text: "morning routine", pre: "I'm on my", sub: "Gym, breakfast, and planning the day." },
      { text: "getting ready", sub: "Probably at the gym or making breakfast." },
      { text: "starting slow", sub: "Coffee hasn't kicked in yet." },
      { text: "warming up", sub: "Gym first, then the hard problems." },
    ] },
    { start: M(8, 30), end: M(9, 0), dot: "active", v: [
      { text: "starting the day", sub: "Coffee, inbox, and setting priorities." },
      { text: "planning mode", pre: "I'm in", sub: "Figuring out what matters most today." },
      { text: "inbox zero attempt", pre: "I'm on an", sub: "Coffee in hand, priorities taking shape." },
      { text: "first coffee", pre: "I'm on my", sub: "Reviewing yesterday's decisions with fresh eyes." },
    ] },
    { start: M(9, 0), end: M(12, 30), dot: "active", v: [
      { text: "probably in deep work", sub: "Designing, prototyping, or solving complex product problems." },
      { text: "deep work mode", pre: "I'm in", sub: "Headphones on, flows open, solving something." },
      { text: "in the zone", sub: "Probably arguing with a flow that almost works." },
      { text: "focused", sub: "Somewhere between wireframes and high-fidelity." },
      { text: "building something", sub: "Prototyping, testing ideas, or refining structure." },
    ] },
    { start: M(12, 30), end: M(13, 30), dot: "away", v: [
      { text: "probably at lunch", sub: "Away from the screen. Back in an hour." },
      { text: "lunch break", pre: "I'm on a", sub: "Recharging with food, not pixels." },
      { text: "away for lunch", sub: "The best ideas come after eating." },
      { text: "offline briefly", sub: "Even the cursor needs a break." },
    ] },
    { start: M(13, 30), end: M(16, 30), dot: "active", v: [
      { text: "probably collaborating", sub: "Meetings, design reviews, and working with product and engineering." },
      { text: "in collaboration mode", sub: "Reviewing designs, aligning with engineering, or in a product sync." },
      { text: "working with the team", sub: "Design reviews, feedback sessions, or whiteboarding." },
      { text: "talking through problems", sub: "The afternoon is for alignment and shared decisions." },
    ] },
    { start: M(16, 30), end: M(18, 0), dot: "active", v: [
      { text: "wrapping up the day", sub: "Finishing features and documenting design decisions." },
      { text: "end of day push", pre: "I'm on the", sub: "Polishing the last details before closing the laptop." },
      { text: "documenting", sub: "Making sure tomorrow-me understands today's decisions." },
      { text: "tying up loose ends", sub: "Cleaning up files, writing notes, shipping what's ready." },
    ] },
    { start: M(18, 0), end: M(20, 0), dot: "away", v: [
      { text: "learning something new", sub: "Exploring AI workflows, building side projects, or reading." },
      { text: "experimenting", sub: "Probably building something no one asked for." },
      { text: "side project", pre: "I'm on a", sub: "The playground where constraints don't exist." },
      { text: "curiosity hour", pre: "I'm in my", sub: "Reading, tinkering, or going down a rabbit hole." },
    ] },
    { start: M(20, 0), end: M(22, 30), dot: "away", v: [
      { text: "offline for the evening", sub: "Cooking, relaxing, or spending time with friends." },
      { text: "off the clock", sub: "Probably cooking something ambitious." },
      { text: "personal time", pre: "I'm in", sub: "Design brain is off. Human brain is on." },
      { text: "done for today", sub: "Somewhere between the kitchen and the couch." },
    ] },
    { start: M(22, 30), end: M(24, 0), dot: "sleep", v: [
      { text: "winding down", sub: "Probably reading before bed." },
      { text: "almost offline", sub: "A book, some quiet, then sleep." },
      { text: "shutting down", sub: "Tomorrow's problems can wait." },
      { text: "end of the day", pre: "I'm at the", sub: "Reading, reflecting, and letting the day go." },
    ] },
  ];

  // Pick one phrasing per block on load — stable for the session, fresh on reload.
  var picks = SCHEDULE.map(function (b) {
    return Math.floor(Math.random() * b.v.length);
  });

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

    els.time.textContent = ams.str; // Amsterdam, same clock as the status

    /* The analog hands, from the SAME Amsterdam reading — never a second Date,
       or the face and the digits could disagree across a minute boundary. The
       hour hand carries the minutes too (0.5 deg per minute), which is what
       stops it sitting exactly on the hour mark at :59. */
    if (els.hour) {
      els.hour.setAttribute("transform",
        "rotate(" + (((ams.h % 12) * 30) + ams.m * 0.5) + " " + PIVOT + ")");
    }
    if (els.minute) {
      els.minute.setAttribute("transform", "rotate(" + (ams.m * 6) + " " + PIVOT + ")");
    }

    // Active block by Amsterdam minutes → its pre-picked phrasing + state.
    var mins = ams.h * 60 + ams.m;
    var idx = 0;
    for (var i = 0; i < SCHEDULE.length; i++) {
      if (mins >= SCHEDULE[i].start && mins < SCHEDULE[i].end) { idx = i; break; }
    }
    var block = SCHEDULE[idx];
    var variation = block.v[picks[idx]];
    if (els.lead) els.lead.textContent = variation.pre || DEFAULT_PRE;
    els.head.textContent = variation.text;
    els.sub.textContent = variation.sub;
    // Drives the indicator's colour and pulse rate from _about.css. Values are
    // the schedule's own: "active" | "away" | "sleep".
    root.setAttribute("data-state", block.dot);
  }

  render();
  // Recompute clock + status every minute (DST handled by the zone string).
  setInterval(render, 60000);
})();
