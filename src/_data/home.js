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

  // ---- Work — 1155:10689 (label), 911:730 (project rows) ----------------------
  // One entry per row, in display order; v4/project-row.njk renders each.
  // `lead` is the dark first sentence of the description, `body` the rest.
  // A panel with no `src` renders as an empty placeholder, like the comp's
  // unfinished panels; give it a `src` (and `alt`) when its image exists.
  work: {
    label: "Selected project",
    projects: [
      {
        id: "connect2wow",
        name: "Connect2WOW",
        href: "/work/connect2wow/",
        verified: true,
        years: "2024-2025",
        lead: "Designed how an ERP decides what deserves attention.",
        body: "Co-built a 40–50 component design system and the model that decides how every alert looks and behaves.",
        panels: [
          { src: "/Assets/v4/work/connect2wow/panel-1.jpg", alt: "Connect2WOW HR module: a worker profile with the Report to me view open" },
          // 1126:30583 and 1126:29537 sit past the Homepage frame's edge, which
          // clips them, so they cannot be exported yet.
          {},
          {},
        ],
      },
    ],
  },
};
