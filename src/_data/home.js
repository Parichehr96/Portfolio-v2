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
    progress: 75,
    title: "Portfolio 2026 is still in progress.",
    body: "Case studies, writings, and details are actively rolling in.",
  },

  // ---- 404 — src/404.njk: the hero's window, a night sky that spells 404 ---
  notFound: {
    hint: "Hover to open the window.",
    hintOpen: "Nope, not out there either. Just stars.",
    title: "This page flew out the window.",
    body: "The link might be old, or the page moved somewhere new. Let’s get you back to something real.",
    home: "Back to the homepage",
    work: "See the work",
  },

  // ---- Consent banner — v4/consent.njk, on every V4 page until answered ------
  consent: {
    title: "I’m a designer, so I’m curious. Mind if I peek out the window?",
    body: "I’m only using your approximate location (city-ish, never your address), which pages you visit, and where you click. Anonymous, no ads, and it helps me make this portfolio better for the next person.",
    yes: "Sure, peek away",
    no: "Keep the curtains closed",
    settings: "Cookie settings",
  },

  // ---- Left rail — 911:530 ---------------------------------------------------
  // `target` is the id of the section the item scrolls to and highlights for.
  rail: [
    { label: "Home", target: "top" },
    { label: "Works", target: "work", caseLabel: "Work" },
    { label: "Pari", target: "about" },
    { label: "Contact", target: "contact" },
  ],

  // ---- Intro — 911:547 -------------------------------------------------------
  // The bio is three runs so the middle one can be set bold, as the comp does.
  // ---- Hero — redesign 1669:6413 (the first screen) --------------------------
  hero: {
    hello: { before: "Hi, I’m ", name: "Pari", after: ", I’m a" },
    title: ["Product", "Designer"],
    scroll: "Scroll Down",
    resume: "Download my Resume",
  },

  intro: {
    bio: {
      before: "I make complex products simple to use. ",
      strong: "5+ years",
      after: " designing Web3, consumer and enterprise products, often owning design end to end alongside founders, engineers and researchers.",
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
  // `soon: true`: the case study is not ready. The name is not a link and a
  // small "(Coming Soon)" follows it. Swap it for `href` once it is live.
  //
  // `label` is the small uppercase heading a row may carry above it; only the
  // first has one ("Selected projects"). The comp's "My works" over the rest
  // is dropped: one heading for the whole list is enough.
  //
  // `desc` is a list of runs so each can be set the way the comp sets it:
  // `industry` is the small uppercase label over the name, joined by " · ".
  //
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
        // Redesign card (1669:8786): its tab's logo, where and the tags.
        logo: "/Assets/v5/logos/rdsysco.svg", logoActive: "/Assets/v5/logos/rdsysco-active.svg", logoAlt: "RDSysCo",
        location: "Canada (Remote)",
        tags: ["Modular enterprise", "Human resources", "Desktop"],
        label: "Selected projects",
        name: "Connect2WOW",
        industry: ["Enterprise", "Oil & gas"],   // the small label over the name
        href: "/work/connect2wow/",
        verified: true,
        years: "2021-2022",
        desc: [
          { style: "lead", text: "Redesigned an oil and gas ERP end to end," },
          { text: " from how its modules are organized to a working prototype, so office staff and field workers find what they need in one product." },
        ],
        panels: [
          // Thumbnail motion, played only on the thumbnail at the front
          // (_work.css, scripts/v4-strip.js). "video": a loop recorded from the
          // prototype by tools/connect2wow-thumbs (<video>.webm / .mp4, its
          // first frame <video>.jpg). "layers": transparent layers on bg that
          // rise in one by one.
          {
            motion: "video",
            video: "/Assets/v4/work/connect2wow/record",
            alt: "Connect2WOW: the main navigation moving through Human resource, HSE, Courses and Engineering, each module's menu and page changing with it",
          },
          {
            motion: "layers",
            bg: "#F3F6F8",
            box: "15% 3.33%",   // the white ground under the cards, 12 round them
            layers: [
              "/Assets/v4/work/connect2wow/panel-2-requests.png",
              "/Assets/v4/work/connect2wow/panel-2-hiring.png",
              "/Assets/v4/work/connect2wow/panel-2-partner.png",
            ],
            alt: "Connect2WOW Home: offboarding and hiring requests with Decline and Approve, and a partner's connection request",
          },
          {
            motion: "video",
            video: "/Assets/v4/work/connect2wow/top",
            alt: "Connect2WOW top bar on the worker record: the profile menu opens and scrolls to its end, then the notifications",
          },
        ],
      },
      {
        id: "onton",
        // Redesign card (1669:8786): its tab's logo, where and the tags.
        logo: "/Assets/v5/logos/onton.svg", logoActive: "/Assets/v5/logos/onton.svg", logoAlt: "ONTON",
        location: "Finland (Remote)",
        tags: ["Web3", "Events", "Mobile"],
        name: "Onton",
        industry: ["Web3", "Events"],   // the small label over the name
        navLabel: "ONTON",
        href: "/work/onton/",
        verified: true,
        years: "2023-2025",
        desc: [
          { style: "lead", text: "Redesigned a Web3 event platform end to end," },
          { text: " making event creation as simple as in any other event app, so organizers stopped dropping off and the product grew from " },
          { style: "stat", text: "87 to 1,500" },
          { text: " daily active users." },
        ],
        panels: [
          // An inline SVG with its own animation (Figma 1490:21842), played at the front.
          { motion: "anim", svg: "v4/work/onton-link.njk", alt: "An event linked to TON: Event and TON join, then come together" },
          // A loop recorded from the Figma flow by tools/onton-thumbs.
          { motion: "video", video: "/Assets/v4/work/onton/flow", alt: "Onton in Telegram: adding a VIP ticket, then creating the event, which lands in your events" },
          // Section 10's animation, "The new flow" (hero-animation.html), one 17.5s
          // cycle recorded by tools/cq-showcase.
          { motion: "video", video: "/Assets/v4/work/onton/new-flow", alt: "Creating an event in the new ONTON flow: name, poster, time and place, then the event created and in your list" },
        ],
      },
      {
        id: "challenquiz",
        // Redesign card (1669:8786): its tab's logo, where and the tags.
        logo: "/Assets/v5/logos/challenquiz.svg", logoActive: "/Assets/v5/logos/challenquiz.svg", logoAlt: "Challenquiz",
        location: "Finland (Remote)",
        tags: ["Consumer", "Gaming", "Mobile"],
        name: "Challenquiz",
        industry: ["Consumer", "Gaming"],   // the small label over the name
        href: "/work/challenquiz/",
        verified: true,
        years: "2023",
        desc: [
          { style: "lead", text: "Made a multiplayer game feel multiplayer" },
          { text: ". Redesigned the in-game flow. In usability testing, time-to-start halved and games finished cleanly went from 60% to 100%." },
        ],
        // The case study's own visuals, recorded by tools/cq-showcase: the insight,
        // the moment the result lands, and the outcome.
        panels: [
          { motion: "video", video: "/Assets/v4/work/challenquiz/cq-insight", alt: "The old game's list, match and result with no other players on screen, each turning into the redesign where the room is back" },
          { motion: "video", video: "/Assets/v4/work/challenquiz/cq-reward", alt: "Lena's result settling: the amount counts up to 294 CQ, +94 on her entry" },
          { motion: "video", video: "/Assets/v4/work/challenquiz/cq-results", alt: "535 to 1,451 new players finishing a game in a month, above the usability study's before and after" },
        ],
      },
      {
        id: "wow-design-system",
        // Redesign card (1669:8786): its tab's logo, where and the tags.
        logo: "/Assets/v5/logos/rdsysco.svg", logoActive: "/Assets/v5/logos/rdsysco-active.svg", logoAlt: "RDSysCo",
        location: "Canada (Remote)",
        tags: ["Design system", "Enterprise", "Desktop"],
        name: "WOW design system",
        industry: ["Enterprise", "Design system"],   // the small label over the name
        href: "/work/wow-design-system/",
        navLabel: "Connect2WOW (Design system)",
        verified: true,
        years: "2021-2022",
        desc: [
          { style: "lead", text: "Made three designers draw like one." },
          { text: " Co-built the library behind Connect2WOW: 65 component sets, 370 icons, and the rules that decide how everything looks and behaves." },
        ],
        // Loops of the case study's own visuals, recorded by tools/wow-ds-thumbs.
        panels: [
          { motion: "video", video: "/Assets/v4/work/wow-design-system/themes", alt: "WOW components in a bento re-skinning from light to dark" },
          { motion: "video", video: "/Assets/v4/work/wow-design-system/layers", alt: "A WOW request card opening into its layers: surface, identity, status and actions, each with its tokens" },
          { motion: "video", video: "/Assets/v4/work/wow-design-system/components", alt: "The WOW components as a periodic table, coloured by family, each shown live in turn" },
        ],
      },
    ],
  },

  // ---- About — 911:727 (label), 911:854 (text), 918:32037 + 918:32133 --------
  // ---- Sky — 1497:23078: the two lines under the visitor's sky ------------
  sky: {
    // Under the closed window, two lines; open, the first goes and the second says what to do.
    lead: "In case you’ve been so busy to look up, hover to open the window.",
    leadTouch: "In case you’ve been so busy to look up, tap to open the window.",   // phones: nothing to hover
    line: "This is your sky, as it looks right now.",
    lineOpen: "This is your sky, drag the light to see how it changes.",
    // After "Keep the curtains closed" (v4/consent.njk): my sky, not theirs; a click on the window asks again.
    leadMine: "You kept the curtains closed, so here’s my sky instead. Click the window if you change your mind.",
    lineMine: "This is my sky in Amsterdam, as it looks right now.",
  },

  // ---- Tools and services — redesign 1669:6580, over the two folders ------
  folders: {
    label: "Hover on folders to see my …",
  },

  about: {
    label: "Parichehr (about me)",
    // 1174:95301 and 1215:17958: the photo wheel under the label, in wheel
    // order (it turns right to left). Each image is the comp's own crop, baked
    // to the 224 × 270 card at 2x. Add more and the wheel grows.
    // photoStart: the photo in the middle at load (Master Graduation).
    photoStart: 3,
    photos: [
      { src: "/Assets/v4/about/photos/thingscon.webp", alt: "Parichehr at her stand at ThingsCon", caption: "THINGs Con- 2025" },
      { src: "/Assets/v4/about/photos/feedback-feast.webp", alt: "Visitors trying a video-call prototype at Feedback Feast", caption: "Feedback Feast - 2025" },
      { src: "/Assets/v4/about/photos/society-5.webp", alt: "Parichehr at the Society 5.0 Festival", caption: "Society 5.0 Event - 2025" },
      { src: "/Assets/v4/about/photos/master-graduation.webp", alt: "Parichehr with flowers and her diploma at her Master's graduation", caption: "Master Graduation - 2026" },
      { src: "/Assets/v4/about/photos/ai-hackathon.webp", alt: "A small gold trophy from an AI hackathon", caption: "AI Hackathon - 2026" },
      { src: "/Assets/v4/about/photos/feedback-feast-2026.webp", alt: "Parichehr beside her demo laptops at Feedback Feast", caption: "Feedback Feast - 2026" },
      { src: "/Assets/v4/about/photos/ikea-sustainability.webp", alt: "A group outside at night by a Christmas tree after the IKEA sustainability event", caption: "Ikea Sustainability Event - 2025" },
      { src: "/Assets/v4/about/photos/frontrunners.webp", alt: "The FrontRunners group holding boards covered in sticky notes", caption: "FrontRunners - 2025" },
      { src: "/Assets/v4/about/photos/ux-shiraz.webp", alt: "Parichehr with two others in front of the UX Shiraz conference banner", caption: "UX Shiraz - 2024" },
      { src: "/Assets/v4/about/photos/presentation.webp", alt: "Parichehr presenting slides on portfolios to a small audience", caption: "Presentation - 2023" },
      { src: "/Assets/v4/about/photos/fof-hackathon.webp", alt: "Parichehr speaking by a flip chart at the Friends of Figma hackathon", caption: "Friends of Figma Hackathon - 2025" },
      { src: "/Assets/v4/about/photos/feedback-feast-team.webp", alt: "Parichehr and her team beside their video-call stand at Feedback Feast", caption: "Feedback Feast - 2025" },
    ],
    paragraphs: [
      "I'm drawn to complex products. Industrial Design taught me to think in systems. My Master's in Interaction Design taught me to ground those systems in evidence.",
      "Over five years I've shipped consumer apps, B2B platforms and Web3 products, often owning design end to end alongside founders, engineers and researchers. I've cut a core task from 7 minutes to about 1, halved time-to-start in a game, and built design systems that outlived my time on the team.",
      "I care about structure before pixels, evidence over opinion, and shipping something useful over polishing something theoretical.",
      "I'm looking for a team in the Netherlands building ambitious products, where design shapes the direction and not just the surface.",
      "Hover to see my ...",
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
        // Drawn by <tool-folder> (scripts/vendor/tool-folder.js, a friend's
        // component from Figma 1322:16543): hover tosses the icons out with
        // spring and gravity physics, tap does it on touch. The layered data
        // below is the old click-to-open version, kept for going back to it.
        component: "tool-folder",
        width: 196.3,
        back: "/Assets/v4/about/folders/tools-back.svg",
        // The comp's own render of the closed folder, shown at rest.
        still: { src: "/Assets/v4/about/folders/tools-closed.webp", x: 0, w: 196.3 },
        front: { src: "/Assets/v4/about/folders/tools-front.svg", x: 0, y: 21.34, w: 196.3, h: 173.66,
          path: "M0 13.718C0 6.14176 6.14175 0 13.718 0H38.7485C43.8522 0 48.8198 1.64641 52.9132 4.69466C57.0067 7.7429 61.9742 9.38931 67.078 9.38931H159.718C179.921 9.38931 196.299 25.7673 196.299 45.9706V137.079C196.299 157.283 179.921 173.661 159.718 173.661H36.5813C16.378 173.661 0 157.283 0 137.079V13.718Z" },
        sheet: { x: 20, y: 12, w: 155, h: 147 },
        // The white sheet the icons sit on. Open (1194:17746) it rises above
        // the flap and widens to hold the icons in a 3-3-2 grid.
        card: { x: 14, y: 17, w: 166, h: 156, open: { x: 5.02, y: 12, w: 186.04, h: 156 } },
        // Listed in the comp's stacking order: later icons lie on top. Closed,
        // some lie tilted (rot, degrees); open, all stand straight in the grid.
        icons: [
          { name: "Notion", src: "notion", size: 46, from: [93, 142], to: [123, 140] },
          { name: "Figma", src: "figma", size: 46, from: [95, 43], to: [98, 40] },
          { name: "Miro", src: "miro", size: 46, rot: 23.1, from: [41.13, 138.18], to: [73, 140] },
          { name: "Claude", src: "claude", size: 46, rot: -20.62, from: [47.63, 40.43], to: [48, 40] },
          { name: "GitHub", src: "github", size: 46, from: [151, 140], to: [148, 90] },
          { name: "ChatGPT", src: "chatgpt", size: 46, rot: -15.14, from: [121.21, 95.19], to: [98, 90] },
          { name: "Linear", src: "linear", size: 46, rot: 23, from: [155.18, 43.16], to: [48, 90] },
          { name: "Jira", src: "jira", size: 46, from: [66, 87], to: [148, 40] },
        ],
      },
      {
        id: "services",
        label: "Services",
        // Hover tosses the cards out like the Tools folder's <tool-folder>
        // (scripts/v4-folder-physics.js); tap on touch, Enter/Space too.
        physics: true,
        width: 384.7,
        back: "/Assets/v4/about/folders/services-back.svg",
        still: { src: "/Assets/v4/about/folders/services-closed.webp", x: -0.3, w: 385 },
        front: { src: "/Assets/v4/about/folders/services-front.svg", x: -0.3, y: 32, w: 385, h: 163,
          path: "M0 13.718C0 6.14176 6.14175 0 13.718 0H85.0899C89.2746 0 93.4282 0.718006 97.37 2.12277L110.186 6.69015C114.128 8.09492 118.282 8.81292 122.466 8.81292H348.419C368.622 8.81292 385 25.1909 385 45.3942V126.419C385 146.622 368.622 163 348.419 163H36.5813C16.378 163 0 146.622 0 126.419V13.718Z" },
        sheet: { x: 39.2, y: 12, w: 304, h: 147 },
        // Cards: top-left corner, closed (`from`) and open (`to`). The second
        // waits hidden behind the first until the folder opens, and stays
        // under it once open (the first card overlaps its top by 6, as in the
        // comp). Only the cards' places relative to each other count: open,
        // scripts/v4-folder-physics.js lifts the pair to float just above the
        // folder, however tall their text makes them.
        cards: [
          {
            title: "Interaction and UX Design",
            text: "I design the flows, states, and micro-decisions that make complex products feel obvious. Starting from user research and real behavioral data, I turn ambiguous problems into structured, testable interfaces, and stay close to engineering so what ships matches what was designed.",
            from: [27.4, 17], to: [18.7, -73],
          },
          {
            title: "Strategic product redesign",
            text: "I connect design decisions to product and business goals. I help teams decide what to build and in what order; mapping systems, aligning stakeholders early, and building design systems that keep quality and speed high as the product scales. That means auditing the existing system, cutting what doesn't earn its place, and restructuring information so the next feature makes things simpler, not heavier.",
            from: [39.2, 12], to: [40.7, 50], hidden: true,
          },
        ],
      },
    ],
  },

  // ---- My process — 911:681 ---------------------------------------------------
  process: {
    label: "My process",
    // Figma 1631:1807: number, name (set uppercase) and one line under each gate.
    steps: [
      { n: "01", title: "Discover", text: "Gather real user data and behavioral insights" },
      { n: "02", title: "Define", text: "Map the system and align the stakeholders" },
      { n: "03", title: "Develop", text: "Restructure information to simplify function" },
      { n: "04", title: "Deliver", text: "Test interface to measure the success metrics" },
    ],
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
        dates: "Sep 2025 - Present",
        summary: "Nomadic is a vision-AI platform for autonomous-vehicle video data. Co-redesigned the website and brand visual identity.",
      },
      {
        company: "Onton",
        href: "/work/onton/",
        logo: "/Assets/v4/experience/onton.svg",
        dates: "Dec 2023 - Jul 2025",
        summary: "Event management platform serving organizers and attendees (30,000+ users). Sole designer, owning end-to-end product design from discovery to delivery.",
      },
      {
        company: "ChallenQuiz",
        logo: "/Assets/v4/experience/challenquiz.svg",
        logoDark: true,
        dates: "Jul 2023 - Dec 2023",
        summary: "Multiplayer quiz game on Telegram. Product designer focused on onboarding, navigation, and the in-game experience.",
      },
      {
        company: "Tafarda Studio",
        href: "https://tafarda.com/",
        logo: "/Assets/v4/experience/tefarda.svg",
        dates: "Nov 2022 - Jun 2023",
        summary: "Digital supply chain platform for automotive spare-part distribution.",
      },
      {
        company: "RDSysCo",
        logo: "/Assets/v4/experience/rdsysco.svg",
        dates: "May 2021 - Sep 2022",
        summary: "Enterprise platform for large-scale oil & gas project management, using 4 modules.",
      },
      {
        company: "Poytek",
        href: "https://poytek.com/",
        logo: "/Assets/v4/experience/poytek.svg",
        dates: "Apr 2021 - Nov 2021",
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
      { name: "Email", url: "mailto:info@parichehr.design", icon: "/Assets/v4/footer/mail.svg" },
      { name: "LinkedIn", url: "https://linkedin.com/in/parichehr-talebzadeh", icon: "/Assets/v4/footer/linkedin.svg" },
      { name: "Dribbble", url: "https://dribbble.com/pariuxd", icon: "/Assets/v4/footer/dribbble.svg" },
      { name: "Behance", url: "https://behance.net/pariuxd", icon: "/Assets/v4/footer/behance.svg" },
    ],
    owner: "Pari’s portfolio",
  },
};
