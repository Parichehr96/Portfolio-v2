/* ONTON case study, V4 — Figma B8Kfu0nGgUIG0REVlQTD5C, node 918:34271.
 *
 * Every string on /work/onton/ lives here; layouts/v4-case.njk and the
 * partials in _includes/v4/case/ decide only structure. Sections render in
 * array order and are numbered automatically (01, 02 …), so adding, removing
 * or reordering one never leaves a gap or a repeat in the numbering.
 *
 * A section's `nav` is its short name in the left menu, which lists the
 * sections and lights the one being read; its `id` (the page anchor) comes
 * from the title.
 *
 * A section's `blocks` are drawn under its paragraph, in order. Each has a
 * `type` that picks a partial: image, metrics, competitors, quotes, changes.
 * An image with no `src` renders as the comp's dotted placeholder.
 */
module.exports = {
  slug: "onton",
  name: "ONTON",
  back: { label: "Back", href: "/#work" },
  next: { label: "Next", href: "/work/challenquiz/" },

  hero: {}, // placeholder until the cover image exists

  meta: [
    { label: "Platforms", chip: "Telegram Mini App (web-based)" },
    { label: "Craft", values: ["Product design,", "UX research,", "interactive prototyping"] },
    { label: "Role", values: ["Sole product designer"] },
    { label: "Team", values: ["Founder, 4 engineers, marketing & research"] },
    { label: "Timeline", values: ["Q4 2023 - Q2 2025"] },
    { label: "Outcome", values: ["87 → 1,500+ DAU,", "event creation ~7 min → ~1 min,", "retention +21.2%"] },
  ],

  hook: "Every other organizer was dropping at the same point",

  sections: [
    {
      title: "About ONTON",
      nav: "About",
      muted: true,
      text: "ONTON is a Telegram Mini App where crypto communities run events and reward attendance with an on-chain badge, a Soulbound Token that proves you showed up. This story is about the first step of that promise: creating the event. For a while, it was a hard part. Organizers weren't only stuck getting the details right, they were stuck making all of them, every single time too.",
    },
    {
      title: "Metrics",
      nav: "Metrics",
      muted: true,
      text: "Four steps became two, with advanced settings hidden by default and expandable on demand. With only 15% of organizers ever opening the expanded settings, the core bet held: almost no one needed what the old flow forced on everyone.",
      blocks: [
        {
          type: "metrics",
          items: [
            { value: "~33%", change: "+64%", trend: "up", label: "Event-creation completion", from: "From 20%" },
            { value: "~1 min", change: "−86%", trend: "up", label: "Time to create an event", from: "From ~7 min" },
            { value: "42%", change: "NEW", label: "Events made by duplicating or repeating", from: "Not possible before" },
            { value: "4/5", change: "+100%", label: "Organizers who came back", from: "From 2 / 5" },
          ],
        },
      ],
    },
    {
      title: "Problem",
      nav: "Problem",
      text: "Creating a simple event meant four dense steps, 20+ fields, and a \"cannot be changed after creation\" warning on almost every screen. It took about 7 minutes, and organizers dropped off at step 2 or 3. Nothing carried over between events, so regular organizers started from zero every time.",
    },
    {
      title: "How ONTON compared",
      nav: "How it compared",
      text: "Creating a simple event meant moving through four dense steps and deciding on details most organizers didn't need, a process that pushed people to abandon at step 2 or 3.",
    },
    {
      title: "How did I approach it?",
      nav: "Approach",
      text: "I built the shared components it relied on and iterated on the live analytics after launch, while working directly with the founder and four developers to ship it.",
    },
    {
      title: "Competitor analysis, before redesign",
      nav: "Competitors",
      text: "Before redesigning, I benchmarked where ONTON stood on the thing that was breaking; the moment of creating an event.",
      blocks: [
        {
          type: "competitors",
          self: {
            name: "ONTON",
            logo: "/Assets/v4/case/onton/logo.svg",
            value: "~7 min",
            change: "7× the market",
            summary: "to publish one event, against under a minute everywhere else",
            rows: [
              ["Steps to publish", "4+ review"],
              ["On-chain reward", "Only me"],
              ["Hides advanced", "No"],
              ["duplicate/template", "No"],
            ],
          },
          market: {
            title: "The rest of the market",
            columns: ["Steps", "Hide advanced", "Duplicate", "Time"],
            rows: [
              ["Luma", "1 screen", "Yes", "Yes", "<1 min"],
              ["Partful", "1 screen", "Yes", "Yes", "<1 min"],
              ["Eventbrite", "Many", "Partial", "Yes", "High"],
              ["POAP", "Few", "No", "No", "Low"],
            ],
            note: "POAP is the only other product tying a reward to attendance, and it stops at a badge. The rest win on speed, not on what the guest walks away with.",
          },
        },
      ],
    },
    {
      title: "How organizers used to create event",
      nav: "The old flow",
      text: "Four steps, 20+ fields, and a warning on almost every screen that your choices were permanent.",
      blocks: [{ type: "image" }],
    },
    {
      title: "What did organizers claim?",
      nav: "Interviews",
      text: "Five interviews, one pattern in two halves: organizers were over-asked, then asked all over again.",
      blocks: [
        {
          type: "quotes",
          items: [
            {
              name: "Isabel",
              role: "First-time organizer",
              tag: "Over-asked",
              quote: "“I didn't even know what I was being asked to decide. Subtitle mandatory? Why?”",
              note: "Simple events were forced through tickets, fees, and approval nobody needed.",
            },
            {
              name: "Malena",
              role: "Weekly organizer",
              tag: "Re-asked",
              quote: "“I rebuild the same event from scratch every week, there's no way to duplicate.”",
              note: "Nothing carried over, so frequent organizers started from zero every time.",
            },
          ],
        },
      ],
    },
    {
      title: "What changed",
      nav: "What changed",
      text: "Two steps instead of four, defaults that stick, and one final confirmation instead of a warning on every screen.",
      blocks: [
        {
          type: "changes",
          title: "From four steps to two",
          subtitle: "Nothing critical was deleted, most of it was demoted.",
          legend: [
            { state: "kept", label: "Kept & surfaced" },
            { state: "moved", label: "Moved to Advanced" },
            { state: "removed", label: "Removed / automated" },
          ],
          // Field state: kept (blue dot), moved (hollow ring), gone (hollow
          // ring, struck through: removed or automated).
          after: {
            label: "After · 2 steps",
            steps: [
              { n: 1, title: "Essentials", fields: [["Name", "kept"], ["Date & time", "kept"], ["Location", "kept"], ["Cover image", "kept"]] },
              {
                n: 2,
                title: "Reward & review",
                fields: [["SBT preset", "kept"], ["Free · default", "kept"], ["Capacity · default", "kept"]],
                advanced: "Advanced — holds all 11 demoted fields",
                action: "Preview → Publish",
              },
            ],
            summary: [
              { from: "4", to: "2", label: "Steps" },
              { from: "22", to: "7", label: "Fields shown" },
              { from: "~7", to: "1", label: "Min to publish" },
            ],
            note: "Only 15.4% ever opened Advanced, the demotion held.",
          },
          badges: ["9 kept", "11 demoted", "2 automated"],
          before: {
            label: "Before · 4 steps",
            // Two columns per step, left then right, as the comp lays them out.
            steps: [
              { n: 1, title: "General", columns: [
                [["Name", "kept"], ["TON Hub", "moved"], ["Description", "moved"]],
                [["Cover image", "kept"], ["Category", "moved"], ["Subtitle (mandatory)", "gone"]],
              ] },
              { n: 2, title: "Time / Location", columns: [
                [["Date & time", "kept"], ["Country / City / Map", "kept"], ["Timezone (auto)", "gone"]],
                [["In-person / Online", "kept"], ["Duration", "moved"]],
              ] },
              { n: 3, title: "Registration", columns: [
                [["Capacity (default)", "kept"], ["Registration form", "moved"], ["Ticket details", "moved"]],
                [["Free / Paid", "kept"], ["Approval", "moved"], ["Recipient wallet", "moved"]],
              ] },
              { n: 4, title: "Reward", columns: [
                [["SBT preset", "kept"], ["Custom SBT", "moved"], ["Reward video", "moved"]],
                [["Reward image", "kept"], ["Event password", "moved"]],
              ] },
            ],
          },
        },
      ],
    },
    {
      title: "The new flow",
      nav: "The new flow",
      blocks: [
        {
          type: "animation",
          // Built from Figma 1316:24717 in Portfolio-v2 (onton-hero-animation).
          // A self-contained page; it starts when half of it is on screen.
          src: "/Assets/embeds/onton/hero-animation.html",
          title: "The new event-creation flow: a poster, a name, a start time and a venue fill one event card, which lands in the organizer's events",
        },
      ],
    },
    {
      title: "Reflection",
      nav: "Reflection",
      paragraphs: [
        "The bet, that almost no one needed the old flow's depth, held. The clearest proof is the 15%. Majority of users didn’t need what the old flow forced on everyone, and the ones that did, could find it.",
        "I hold the rest loosely: seasonal demand and ONTON being the only SBT option likely helped too, and removing steps meant a few organizers lost access to settings they might've wanted. That's the trade I chose, and the first thing I'd revisit as the organizer base matures.",
      ],
    },
  ],
};
