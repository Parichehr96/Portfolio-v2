/* ONTON CASE STUDY — Figma 193:4660.
 *
 * Every string here is VERBATIM from the comp, punctuation included. Two things
 * about that are deliberate and will look like typos if you skim:
 *
 *   • The comp mixes apostrophes. Almost everything uses a straight ' — but
 *     "didn’t" in the reflection's closing paragraph is a typographic one. Both
 *     are reproduced as found rather than normalised, because the alternative
 *     is silently rewriting Pari's copy.
 *   • Several tone splits land mid-sentence. `Role` breaks before its full
 *     stop and `Outcome` before a comma. That is where Figma puts the colour
 *     change, so that is where it goes.
 *
 * TWO-TONE BODIES ARE THE SYSTEM HERE, not a one-off. Every body paragraph in
 * 193:4660 opens at #1a1a1a and drops to #727272 partway through — the same
 * pattern the hero cards use. Bodies are therefore arrays of {text, tone}
 * rather than strings, and a plain string is still accepted for any future
 * single-tone paragraph.
 *
 * MEDIA IS PLACEHOLDER-FIRST AND GATED ON DISK. Nothing here fabricates
 * artwork. Each slot declares its type, its exact Figma box and the filename it
 * expects; `present` is resolved by looking for that file, so the page renders
 * a labelled placeholder today and the real asset the moment one is dropped in,
 * with no template or data edit. Same contract as the My Work thumbnails in
 * projects.js, and the two VIDEO slots carry data-work-motion so the existing
 * scripts/work-motion.js drives them — poster on approach, play at 25% visible,
 * pause off-screen, and never a byte fetched under reduced motion.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const onDisk = (url) => fs.existsSync(path.join(ROOT, url));

/* A still slot. `w`/`h` are the Figma box — they set the placeholder's ratio
   and the real image's width/height attributes, so the space is reserved
   identically either way and dropping the file in shifts nothing.

   NOTHING USES THIS RIGHT NOW. All four large slots turned out to be motion,
   so every one of them is a video(). Kept because media-slot.njk still renders
   `kind: "image"` and the next still to land on this page should go through
   here rather than reinventing the gating. */
function image(file, w, h, label, alt) {
  const url = "/Assets/images/onton/" + file;
  return { kind: "image", url, file, w, h, label, alt, present: onDisk(url) };
}

/* A motion slot. Two encodes plus a poster, exactly like MOTION in projects.js.
   `present` requires at least one encode; the poster is optional because a
   missing one simply leaves the media box's own background showing, which is
   what work-motion.js already falls back to.

   W AND H ARE THE ENCODE'S OWN PIXELS, NOT THE FIGMA BOX. They set the slot's
   aspect-ratio, and the two agree for three of the four clips. The phone does
   not: Figma draws its box 434x886 (0.490) where the export is 390x838
   (0.465). Sizing the slot from the export means `object-fit: cover` has
   nothing to crop — take the Figma box instead and the phone loses ~46px off
   its height, which on a UI walkthrough is the status bar or the button. The
   band keeps the comp's height either way; see the showcase rule in
   _case-study-v2.css, which pins that slot by height and lets width follow. */
function video(base, w, h, label, alt, opts) {
  opts = opts || {};
  const webm = "/Assets/videos/onton/" + base + ".webm";
  const mp4 = "/Assets/videos/onton/" + base + ".mp4";
  const poster = "/Assets/images/onton/" + base + "-poster.jpg";
  return {
    kind: "video",
    base,
    webm,
    mp4,
    poster,
    w,
    h,
    label,
    alt,
    // Loop unless a clip says otherwise; see `changed` below for the one that
    // does, and why its poster is built from a different frame because of it.
    loop: opts.loop !== false,
    replayOnEnter: !!opts.replayOnEnter,
    present: onDisk(webm) || onDisk(mp4),
    posterPresent: onDisk(poster),
  };
}

/* The small marks — logos and persona keys. Same gating, no invented artwork.
   These are listed as their own kind because they render inline at a fixed
   pixel size rather than as a ratio box.

   THE PERSONA MARKERS DO NOT COME THROUGH HERE. They looked like small assets
   at first, but the comp draws them as plain filled circles in five Figma
   accents/* colours — nothing to export. They are CSS dots now; only the ONTON
   lockup and the five competitor logos are still real files awaiting export. */
/* A BRAND MARK — the round logo beside a product name in a table, or the one in
   the cover eyebrow. Every one of these is drawn inside a circle in the comp,
   so `shape` says so once here rather than at each of the call sites. The
   artwork is this case study's, so it lives under this case study. */
function mark(file, size, label) {
  const url = "/Assets/images/onton/logos/" + file;
  return { kind: "mark", url, file, size, label, shape: "circle", present: onDisk(url) };
}

/* A UI ICON, NOT A LOGO. Square, contained rather than cropped, and identical
   on every page that has a back link — so it sits in the site's shared icon
   folder instead of being copied into each case study's. */
function icon(file, size, label) {
  const url = "/Assets/images/icons/" + file;
  return { kind: "mark", url, file, size, label, shape: "icon", present: onDisk(url) };
}

module.exports = {
  /* Front-matter values live here too, so the page template carries no copy at
     all — the whole case study is this file. */
  meta: {
    title: "ONTON · Case Study",
    description:
      "Every other user was dropping at the same point. Cutting Telegram Mini App event creation from four steps to two, without losing the on-chain edge.",
  },

  /* ---- 1. Cover — 193:4672 ---------------------------------------------- */
  cover: {
    /* ---- Breadcrumb — 550:11647 / 553:55014 / 553:55050 ------------------
       ONE ROW, REPLACING TWO. The cover used to open with a "Back to home" link
       and then an eyebrow lockup on its own line; the comp folds both into a
       single 100-tall trail. `eyebrow` and `mark` are the same two values they
       always were — they render inside the trail now instead of under it, which
       is why neither had to change shape.

       THE CHEVRON DOES NOT GO WHERE "Home" GOES, and that separation is the
       point of the row. "Home" is the site root. The chevron is *back* — it
       returns the reader to the exact My Work row they clicked to get here, via
       the id components/project-card.njk writes onto every card. A static
       anchor rather than history.back() or a stored referrer, because it is
       right on a cold arrival too — from search, or a shared link — where there
       is no history and nothing stored to read. */
    backHref: "/#work-onton",
    /* The chevron carries no visible text, so this is its accessible name. It
       names the destination rather than the gesture: "back" on its own tells a
       screen reader nothing about where back is. */
    backLabel: "Back to ONTON in My Work",
    chevron: icon("chevron.svg", 20, "SVG — chevron_backward, 20×20"),
    crumbs: [
      { label: "Home", href: "/" },
      { label: "My Work", href: "/#featured-works" },
    ],
    /* 96x96 so the 32px box is retina-sharp. PNG, not SVG: these are the exports
       that exist, and the .svg the old reference named never did — which is why
       this mark rendered as a dashed placeholder on all three pages until now. */
    mark: mark("onton-eyebrow.png", 32, "PNG — ONTON logo mark, 96×96 at 32"),
    eyebrow: "ONTON",
    media: video(
      "cover",
      // 1270 x 661 — the box 475:26231 / 553:55022 / 553:55058 draw, aspect
      // 1.9213. media-slot.njk turns these two into the figure's
      // aspect-ratio, so this is the frame the cover reserves, not the
      // clip's own size.
      1270,
      661,
      "VIDEO — cover",
      "ONTON's event screens and component set, animating"
    ),
    headline: "Every other user was dropping at the same point",
    // 193:5314 — the middle sentence is the one in ink. It is the thesis of the
    // whole write-up, which is why the comp lifts it out of the surrounding grey.
    intro: [
      {
        text: "ONTON is a Telegram Mini App where crypto communities run events and reward attendance with an on-chain badge, a Soulbound Token that proves you showed up. ",
        tone: "muted",
      },
      {
        text: "This story is about the first step of that promise: creating the event.",
        tone: "lead",
      },
      {
        text: " For a while, it was a hard part. Organizers weren't only stuck getting the details right, they were stuck making all of them, every single time too.",
        tone: "muted",
      },
    ],
  },

  /* ---- 2. Challenge / Objective / Role / Outcome — 193:4689 -------------- */
  /* A 2x2 grid in the comp, in this order. The left column of each row carries
     the vertical divider and the second row carries the horizontal one; both
     are drawn in CSS from this order rather than declared per cell. */
  facets: [
    {
      label: "Challenge",
      body: [
        {
          text: "Creating a simple event meant moving through four dense steps and deciding on details most organizers didn't need, a process that took around 7 minutes and pushed people to abandon at step 2 or 3.",
          tone: "lead",
        },
        {
          text: ' Repeated "cannot be changed after creation" warnings turned every choice into a high-stakes one. And because nothing carried over, organizers who ran events regularly had to build each one from zero, every time.',
          tone: "muted",
        },
      ],
    },
    {
      label: "Objective",
      body: [
        {
          text: "Cut event creation down to the smallest set of decisions an organizer actually needs to publish with confidence.",
          tone: "lead",
        },
        {
          text: " Hide the complexity most people never touch without taking it away from those who do. And make sure no one has to start from scratch for an event they've essentially made before.",
          tone: "muted",
        },
      ],
    },
    {
      label: "Role",
      // The split lands BEFORE the full stop — Figma's own boundary, not a typo.
      body: [
        {
          text: "Sole designer across the whole flow, I ran the organizer interviews, synthesized the patterns, and redesigned the creation experience end to end",
          tone: "lead",
        },
        {
          text: ". I built the shared components it relied on and iterated on the live analytics after launch. I worked directly with the founder and four developers to ship it.",
          tone: "muted",
        },
      ],
    },
    {
      label: "Outcome",
      // Likewise: the split is before a comma.
      body: [
        {
          text: "Four steps became two, with advanced settings hidden by default and expandable on demand. Event-creation completion climbed over the following month and retention rose 21%",
          tone: "lead",
        },
        {
          text: ", and with only 15% of organizers ever opening the expanded settings, the core bet held: almost no one needed what the old flow forced on everyone. I hold the numbers loosely, since seasonal demand and ONTON being the only SBT option likely played a part too.",
          tone: "muted",
        },
      ],
    },
  ],

  /* ---- 3. Competitor Analysis — 193:5341 -------------------------------- */
  competitors: {
    heading: "Competitor Analysis",
    // 208:2370 — the closing phrase is bold in the comp.
    deck: [
      { text: "Before redesigning, I benchmarked where ONTON stood on the thing that was breaking; " },
      { text: "the moment of creating an event", em: true },
      { text: "." },
    ],
    /* THE FIRST HEADER CELL IS EMPTY, AND THAT IS THE COMP. Figma holds the
       word "ONTON" there at opacity 0 purely to size the column — an artefact
       of a fixed-width canvas that a table lays out for itself. Rendering the
       word would put a stray label above the product names; rendering nothing
       is what the comp actually shows. */
    columns: [
      "",
      "On-chain reward",
      "Steps to publish",
      "Hide advanced",
      "Duplicate/template",
      "~Time",
    ],
    rows: [
      {
        name: "ONTON",
        mark: mark("onton-eyebrow.png", 20, "PNG — ONTON mark, 96×96 at 20"),
        // THE SUBJECT ROW IS BOLD in the comp — it is the product being
        // benchmarked, so it reads first and the rest read as context.
        highlight: true,
        cells: ["Only one", "4 + review", "—", "—", "~7 min"],
      },
      {
        name: "Luma",
        mark: mark("mark-luma.png", 20, "PNG — Luma mark, 60×60 at 20"),
        cells: ["—", "1 screen", "Yes", "Yes", "<1 min"],
      },
      {
        name: "Partiful",
        mark: mark("mark-partiful.png", 20, "PNG — Partiful mark, 60×60 at 20"),
        cells: ["—", "1 screen", "Yes", "Yes", "<1 min"],
      },
      {
        name: "EventBrite",
        mark: mark("mark-eventbrite.png", 20, "PNG — EventBrite mark, 60×60 at 20"),
        cells: ["—", "Many", "Partial", "Yes", "High"],
      },
      {
        name: "POAP",
        mark: mark("mark-poap.png", 20, "PNG — POAP mark, 60×60 at 20"),
        cells: ["(badge only)", "Few", "—", "Yes", "Low"],
      },
    ],
    takeaway:
      "ONTON's on-chain reward was the moat, and also the only reason organizers tolerated a flow far heavier than any consumer tool. The job wasn't new features. It was reaching consumer-grade simplicity without losing the on-chain edge.",
  },

  /* ---- 4. The old flow — 193:5389 --------------------------------------- */
  oldFlow: {
    media: video(
      "old-flow",
      640,
      640,
      "VIDEO — the old four-step flow",
      "Walkthrough of ONTON's original four-step event creation"
    ),
    heading: "How Organizers used to create event",
    body: "Four steps, 20+ fields, and a warning on almost every screen that your choices were permanent.",
  },

  /* ---- 5. The real problem — 193:5395 ----------------------------------- */
  problem: {
    heading: "What was the real problem",
    lead: "Five interviews, one pattern in two halves:",
    /* Two bold lines, each separated from the last by a blank line — the comp
       renders a five-line block from three lines of copy. The blanks are set in
       CSS as one line of margin rather than as empty paragraphs, which keeps
       the rhythm without putting empty elements in the document. */
    halves: ["Organizers were over-asked, ", "Then asked all over again."],
    clusters: [
      {
        label: "Cluster 2 · Over-asked",
        quote:
          '"I didn\'t even know what I was being asked to decide. Subtitle mandatory? Why?" — ',
        // Italic in the comp — the speaker, not part of the quote.
        attribution: "First-Timer",
        takeaway:
          "→ Simple events were forced through tickets, fees, and approval nobody needed.",
      },
      {
        label: "Cluster 5 · Re-asked",
        quote:
          '"I rebuild the same event from scratch every week, there\'s no way to duplicate." — ',
        attribution: "Power User",
        takeaway:
          "→ Nothing carried over, so frequent organizers started from zero every time.",
      },
    ],
  },

  /* ---- 6. What changed — 271:42681 -------------------------------------- */
  changed: {
    heading: "What changed? ...",
    deck: "Two steps instead of four, defaults that stick, and one final confirmation instead of a warning on every screen.",
    /* THE ONLY CLIP THAT DOES NOT LOOP. It draws itself in from an empty black
       frame and the finished diagram — both columns, the connectors, the payoff
       panel — is the whole argument of this section. Looping would throw that
       away every eight seconds and start again from nothing, which is the exact
       snap the homepage's ONTON row avoids the same way.

       IT DOES REPLAY, though, unlike that row: scroll back to this band and the
       map draws again. That is data-motion-replay in work-motion.js, and it is
       opt-in precisely so the homepage keeps holding forever.

       ITS POSTER IS THE LAST FRAME, NOT THE FIRST. Frame 0 here is blank black.
       The poster is what a reduced-motion visitor sees instead of the video and
       what everyone sees before playback, so for a clip that holds its ending
       the resting frame IS the ending — built with `--poster last`. */
    media: video(
      "what-changed",
      1270,
      670,
      "VIDEO — from four steps to two, flow map",
      "Map of the four-step event flow folding into two, with what was kept, demoted and removed",
      { loop: false, replayOnEnter: true }
    ),
  },

  /* ---- 7. How — 193:5401 ------------------------------------------------ */
  /* Heading left, phone right, and no body copy — the comp gives this band
     1092px of height and one line of text, because the media is the argument. */
  how: {
    heading: "How? ...",
    media: video(
      "new-flow",
      390,
      838,
      "VIDEO — the new two-step flow",
      "Walkthrough of the redesigned two-step event creation"
    ),
  },

  /* ---- 8. ...and Why — 271:42680 ---------------------------------------- */
  /* NO DECK. The comp repeats section 6's line here verbatim, which reads as a
     copy-paste left in the file; Pari confirmed it should appear once, on
     section 6 only. Heading, table, persona key. */
  why: {
    heading: "... and Why?",
    /* ORDER FOLLOWS THE COMP, and it changed with the relayout: the persona
       column moved between the two text columns (557:11539 / 576:59171), so the
       header reads Change · Persona · Why to match the cells beneath it. */
    columns: ["Change", "Persona", "Why, in their words"],
    /* The persona column is rendered VERBATIM as the comp has it — the values
       do not map onto the five-persona key below, and confirming that was the
       point: it stays as designed rather than being "fixed" here. */
    /* THE PERSONA COLUMN IS A DOT, AND ONLY A DOT. Figma does hold a string in
       each of these cells — "—", "Yes", "1" — but every one of them is set to
       opacity 0, the same trick the competitor table uses to size its first
       header column. An earlier pass read those through the layer names and
       rendered them as content; they are not content, they are invisible
       spacers, and the comp shows nothing there but the coloured dot.

       `persona` is therefore the slug of the persona that row's dot points at,
       read from the dot's own fill in Figma, not a label. Two personas repeat
       and one — Campaign Manager — never appears in the table at all. */
    rows: [
      {
        change: "4 steps → 2",
        quote: '"…long for a simple giveaway."',
        persona: "trading-group-admin",
      },
      {
        change: "Advanced hidden, expandable",
        quote: '"The rest I\'d happily let default."',
        persona: "dao-steward",
      },
      {
        change: "Dropped mandatory subtitle; required-only fields",
        quote: '"Everything felt mandatory even when it wasn\'t."',
        persona: "first-timer",
      },
      {
        change: "Duplicate past event",
        quote: '"I rebuild the same event from scratch every week."',
        persona: "power-user",
      },
      {
        change: "Defaults persist across events",
        quote: '"I shouldn\'t have to decide it again."',
        persona: "power-user",
      },
      {
        change: "One final confirmation, not per-screen warnings",
        quote:
          '"A clear \'this is final\' summary once, not a warning on every screen."',
        persona: "dao-steward",
      },
      {
        change: "Preview before publish",
        quote: '"I published and waited for the first person to claim."',
        persona: "trading-group-admin",
      },
    ],
    personaKeyHeading: "Persona key",
    /* THE MARKERS ARE SOLID COLOURED DOTS, not artwork — that is what the comp
       draws, and the colour is the only thing linking a table row above to a
       persona here. `slug` selects the colour in _case-study-v2.css.

       THE BOLD SPLIT IS NOT UNIFORM, and it is copied rather than tidied: the
       comp puts the colon inside the bold for three of these and outside for
       two, and First-Timer carries the following space in bold as well. */
    personas: [
      { slug: "dao-steward", name: "DAO Steward",
        text: ": A crypto-native organizer running occasional community events who wants precise control without the clutter." },
      { slug: "trading-group-admin", name: "Trading-Group Admin",
        text: ": A semi-technical admin who just wants to reward loyal members with a fast, simple giveaway." },
      { slug: "campaign-manager", name: "Campaign Manager:",
        text: " A brand/partnerships lead with low personal crypto literacy who needs verifiable proof-of-attendance." },
      { slug: "first-timer", name: "First-Timer: ",
        text: "A non-technical organizer here only because ONTON is the only way to give out SBTs, easily overwhelmed." },
      { slug: "power-user", name: "Power User:",
        text: " A high-volume organizer running weekly events for a large community, where every friction compounds." },
    ],
  },

  /* ---- 9. Reflection — 193:5407 ----------------------------------------- */
  reflection: {
    heading: "Reflection",
    deck: "The bet, that almost no one needed the old flow's depth, held.",
    stats: [
      { value: "4 → 2 ", label: "Steps" },
      { value: "+21%", label: "Retention" },
      { value: "15%", label: "Ever opened advanced settings" },
      { value: "~7 min → <1min", label: "Time to create" },
    ],
    // Two paragraphs. The typographic apostrophe in "didn’t" is the comp's.
    closing: [
      "The clearest proof is the 15%. Majority of users didn’t need what the old flow forced on everyone, and the ones that did, could find it. ",
      "I hold the rest loosely: seasonal demand and ONTON being the only SBT option likely helped too, and removing steps meant a few organizers lost access to settings they might've wanted. That's the trade I chose, and the first thing I'd revisit as the organizer base matures.",
    ],
  },
};
