/* V4 homepage copy — Figma B8Kfu0nGgUIG0REVlQTD5C, node 911:527 "Homepage".
 *
 * Every string the V4 homepage renders lives here, so copy edits never touch
 * markup. Grouped by section, top to bottom, in the comp's order. Identity that
 * is shared with the rest of the site (name, email) is read from site.js, not
 * repeated here.
 */
module.exports = {
  // ---- Toast — 1126:30853 ----------------------------------------------------
  // Shown on every load; closes itself after 10s or on the × (v4/toast.njk).
  toast: {
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

  // ---- About — 911:727 (label), 911:854 (text), 918:32037 + 918:32133 --------
  // The comp leaves a tall empty band between the label and the text (where a
  // photo stack was planned); it renders as a placeholder until that exists.
  about: {
    label: "Parichehr (about me)",
    paragraphs: [
      "I'm drawn to complex products. Industrial Design taught me to think in systems. My Master's in Interaction Design taught me to ground those systems in evidence.",
      "Over five years I've shipped consumer apps, B2B platforms and Web3 products, often as the sole or lead designer. I've cut a core task from 7 minutes to under 1, halved time-to-start in a game, and built design systems that outlived my time on the team.",
      "I care about structure before pixels, evidence over opinion, and shipping something useful over polishing something theoretical.",
      "I'm looking for a team in the Netherlands building ambitious products, where design shapes the direction and not just the surface.",
      "Click to open the folder and see my ...",
    ],
    // The two folders — 918:32037 / 1194:17746 (Tools, open state revised 29 Sep) and 1190:16880 /
    // 1194:17745 (Services). Click opens, click again closes; see
    // v4/folder.njk for how the pieces are layered and animated.
    //
    // Every position is a CENTRE in px from the folder's top-left, closed
    // (`from`) and open (`to`), read off the comp. `size` is the exported
    // icon's box (the tilted ones are exported already rotated).
    folders: [
      {
        id: "tools",
        label: "Tools",
        width: 196.3,
        back: "/Assets/v4/about/folders/tools-back.svg",
        // The comp's own render of the closed folder, shown at rest.
        still: { src: "/Assets/v4/about/folders/tools-closed.webp", x: 0, w: 196.3 },
        front: { src: "/Assets/v4/about/folders/tools-front.svg", x: 0, y: 21.34, w: 196.3, h: 173.66,
          path: "M0 13.718C0 6.14176 6.14175 0 13.718 0H38.7485C43.8522 0 48.8198 1.64641 52.9132 4.69466C57.0067 7.7429 61.9742 9.38931 67.078 9.38931H159.718C179.921 9.38931 196.299 25.7673 196.299 45.9706V137.079C196.299 157.283 179.921 173.661 159.718 173.661H36.5813C16.378 173.661 0 157.283 0 137.079V13.718Z" },
        sheet: { x: 20, y: 12, w: 155, h: 147 },
        // The white sheet the icons sit on while the folder is closed.
        card: { x: 14, y: 17, w: 166, h: 156 },
        // Listed in the comp's stacking order: later icons lie on top.
        icons: [
          { name: "Notion", src: "notion", size: 46, from: [93, 142], to: [61, 42] },
          { name: "Figma", src: "figma", size: 46, from: [95, 43], to: [86, -5] },
          { name: "Miro", src: "miro", size: 61, from: [41.13, 138.18], to: [118.18, 35.18] },
          { name: "Claude", src: "claude", size: 60, from: [47.63, 40.43], to: [172.63, 46.62] },
          { name: "GitHub", src: "github", size: 46, from: [151, 140], to: [186, -4] },
          { name: "ChatGPT", src: "chatgpt", size: 57, from: [121.21, 95.19], to: [136.21, -16.79] },
          { name: "Linear", src: "linear", size: 61, from: [155.18, 43.16], to: [8.16, 43.16] },
          { name: "Jira", src: "jira", size: 46, from: [66, 87], to: [27, -2] },
        ],
      },
      {
        id: "services",
        label: "Services",
        width: 384.7,
        back: "/Assets/v4/about/folders/services-back.svg",
        still: { src: "/Assets/v4/about/folders/services-closed.webp", x: -0.3, w: 385 },
        front: { src: "/Assets/v4/about/folders/services-front.svg", x: -0.3, y: 32, w: 385, h: 163,
          path: "M0 13.718C0 6.14176 6.14175 0 13.718 0H85.0899C89.2746 0 93.4282 0.718006 97.37 2.12277L110.186 6.69015C114.128 8.09492 118.282 8.81292 122.466 8.81292H348.419C368.622 8.81292 385 25.1909 385 45.3942V126.419C385 146.622 368.622 163 348.419 163H36.5813C16.378 163 0 146.622 0 126.419V13.718Z" },
        sheet: { x: 39.2, y: 12, w: 304, h: 147 },
        // Cards: top-left corner, closed (`from`) and open (`to`). The second
        // waits hidden behind the first until the folder opens, and stays
        // under it once open (the first card overlaps its top, as in the comp).
        cards: [
          {
            title: "Interaction and UX Design",
            text: "I design the flows, states, and micro-decisions that make complex products feel obvious. Starting from user research and real behavioral data, I turn ambiguous problems into structured, testable interfaces, and stay close to engineering so what ships matches what was designed.",
            from: [27.4, 17], to: [18.7, -18],
          },
          {
            title: "Strategic product redesign",
            text: "I connect design decisions to product and business goals. I help teams decide what to build and in what order; mapping systems, aligning stakeholders early, and building design systems that keep quality and speed high as the product scales. That means auditing the existing system, cutting what doesn't earn its place, and restructuring information so the next feature makes things simpler, not heavier.",
            from: [39.2, 12], to: [40.7, 87], hidden: true,
          },
        ],
      },
    ],
  },

  // ---- My process — 911:681 ---------------------------------------------------
  process: {
    label: "My process",
    steps: ["Define", "Research", "Design", "Validate"],
  },

  // ---- Experience — 911:593 ---------------------------------------------------
  // Newest first. `href` is optional: roles with a case study link to it.
  experience: {
    label: "Experience",
    // 911:595. A role without a summary (the open "You Tell Me" slot) is a
    // shorter row; see _experience.css.
    roles: [
      {
        company: "You Tell Me",
        logo: "/Assets/v4/experience/question.svg",
        dates: "2027",
      },
      {
        company: "Freelance",
        href: "https://www.nomadicai.com/",
        logo: "/Assets/v4/experience/freelance.svg",
        dates: "Sep 2025 - March 2026",
        summary: "Nomadic is a vision-AI platform for autonomous-vehicle video data. Co-redesigned the website and brand visual identity.",
      },
      {
        company: "Onton",
        href: "/work/onton/",
        logo: "/Assets/v4/experience/onton.svg",
        dates: "Dec 2023 - Jun 2025",
        summary: "Event management platform serving organizers and attendees (30,000+ users). Sole designer, owning end-to-end product design from discovery to delivery.",
      },
      {
        company: "ChallenQuiz",
        href: "/work/challenquiz/",
        logo: "/Assets/v4/experience/challenquiz.svg",
        logoDark: true,
        dates: "Jul 2023 - Dec 2023",
        summary: "Real-time multiplayer gaming platform. Product designer focused on onboarding, navigation, and the in-game experience.",
      },
      {
        company: "TeFarda Studio",
        href: "https://tafarda.com/",
        logo: "/Assets/v4/experience/tefarda.svg",
        dates: "Nov 2022 - Jun 2023",
        summary: "Digital supply chain platform for automotive spare-part distribution.",
      },
      {
        company: "RDSysCo",
        logo: "/Assets/v4/experience/rdsysco.svg",
        dates: "May 2021 - Sep 2022",
        summary: "Enterprise platform for large-scale oil & gas project management, using 7 modules.",
      },
      {
        company: "Poytek",
        href: "https://poytek.com/",
        logo: "/Assets/v4/experience/poytek.svg",
        dates: "Apr 2021 - Nov 2022",
        summary: "End-to-end experiences for an IoT smart home application and visual design for a children's interactive reading platform.",
      },
    ],
  },

  // ---- Footer — 911:654 ---------------------------------------------------------
  // "Last updated" and the copyright year are filled in at build time.
  footer: {
    title: "Have a complex problem worth solving?",
    body: "I’m always open to thoughtful conversations, interesting product challenges, and teams that care about making complicated things feel simple. If that sounds like what you’re working on, I’d love to hear about it.",
    cta: { label: "Book a Call", url: "https://calendar.app.google/esnBYXwJEYMbRyxb6" },
    socials: [
      { name: "Dribbble", url: "https://dribbble.com/pariuxd", icon: "/Assets/v4/footer/dribbble.svg" },
      { name: "Behance", url: "https://behance.net/pariuxd", icon: "/Assets/v4/footer/behance.svg" },
      { name: "LinkedIn", url: "https://linkedin.com/in/parichehr-talebzadeh", icon: "/Assets/v4/footer/linkedin.svg" },
    ],
    owner: "Pari’s portfolio",
  },
};
