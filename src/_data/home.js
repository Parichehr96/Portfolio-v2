/* V4 homepage copy — Figma B8Kfu0nGgUIG0REVlQTD5C, node 911:527 "Homepage".
 *
 * Every string the V4 homepage renders lives here, so copy edits never touch
 * markup. Grouped by section, top to bottom, in the comp's order. Identity that
 * is shared with the rest of the site (name, email) is read from site.js, not
 * repeated here.
 */
module.exports = {
  // ---- Toast — 1126:30853 ----------------------------------------------------
  // Dismissible; the dismissal is remembered per visitor by scripts/v4-toast.js.
  // Bump `id` when the message changes so returning visitors see the new one.
  toast: {
    id: "portfolio-26-progress",
    progress: 60,
    title: "Portfolio '26 is in progress.",
    body: "Case studies, writings, and details are actively rolling in.",
  },

  // ---- Left rail — 911:530 ---------------------------------------------------
  // `target` is the id of the section the item scrolls to and highlights for.
  rail: [
    { label: "Home", target: "top" },
    { label: "Works", target: "work" },
    { label: "Parichehr", target: "about" },
  ],

  // ---- Intro — 911:547 -------------------------------------------------------
  // The bio is three runs so the middle one can be set bold, as the comp does.
  intro: {
    bio: {
      before: "I make complex products simple to use. ",
      strong: "5+ years",
      after: " designing Web3, consumer and enterprise products, often as the only designer on the team.",
    },
    location: "Based in the Netherlands",
  },

  // ---- Status clock — 911:577 ------------------------------------------------
  // The build-time fallback only. scripts/clock.js overwrites all three strings
  // with the live Amsterdam time and schedule as soon as it runs.
  status: {
    time: "09:00",
    lead: "I'm",
    headline: "probably in deep work",
    detail: "Designing, prototyping, or solving complex product problems.",
  },

  // ---- Work — 1155:10689 and 911:730 (the four project rows) -----------------
  // One entry per row, in display order; v4/project-row.njk renders each.
  //
  // `label` is the small uppercase heading a row may carry above it ("Selected
  // project" over the first, "My works" over the rest, as in the comp).
  //
  // `desc` is a list of runs so each can be set the way the comp sets it:
  //   lead  the dark opening claim            (medium, near-black)
  //   stat  a number worth catching the eye   (bold, navy)
  //   anything else is plain muted body copy.
  //
  // A panel with no `src` renders as the comp's empty placeholder (a white
  // card on grey). Give it a `src` and `alt` once its image exists.
  work: {
    projects: [
      {
        id: "connect2wow",
        label: "Selected project",
        name: "Connect2WOW",
        href: "/work/connect2wow/",
        verified: true,
        years: "2024-2025",
        desc: [
          { style: "lead", text: "Designed how an ERP decides what deserves attention." },
          { text: " Co-built a 40–50 component design system and the model that decides how every alert looks and behaves." },
        ],
        panels: [
          { src: "/Assets/v4/work/connect2wow/panel-1.jpg", alt: "Connect2WOW HR module: a worker profile with the Report to me view open" },
          { src: "/Assets/v4/work/connect2wow/panel-2.png", alt: "Connect2WOW request cards: an offboarding request with Decline and Approve, and an HR collaboration notification" },
          { src: "/Assets/v4/work/connect2wow/panel-3.jpg", alt: "Connect2WOW HR module: the worker profile screen, second view" },
        ],
      },
      {
        id: "onton",
        label: "My works",
        name: "Onton",
        href: "/work/onton/",
        verified: true,
        years: "2024-2025",
        desc: [
          { text: "Redesigned a Web3 event experience to make check-in feel familiar and effortless, helping grow the product from " },
          { style: "stat", text: "87 to 1,500" },
          { text: " daily active users." },
        ],
        panels: [
          { src: "/Assets/v4/work/onton/panel-1.png", alt: "Telegram linked to Onton" },
          { src: "/Assets/v4/work/onton/panel-2.png", alt: "Onton in Telegram: creating a new event, and adding a ticket" },
          {},
        ],
      },
      {
        id: "challenquiz",
        name: "Challenquiz",
        href: "/work/challenquiz/",
        verified: true,
        years: "2024-2025",
        desc: [
          { style: "lead", text: "Made a multiplayer game feel multiplayer" },
          { text: ". Redesigned the in-game flow. In usability testing, time-to-start halved and completion went from 60% to 100%" },
        ],
        panels: [{}, {}, {}],
      },
      {
        // The comp repeats Connect2WOW's copy here; placeholder until the real
        // WOW design system text is written.
        id: "wow-design-system",
        name: "WOW design system",
        verified: true,
        years: "2024-2025",
        desc: [
          { style: "lead", text: "Designed how an ERP decides what deserves attention." },
          { text: " Co-built a 40–50 component design system and the model that decides how every alert looks and behaves." },
        ],
        panels: [{}, {}, {}],
      },
    ],
  },
};
