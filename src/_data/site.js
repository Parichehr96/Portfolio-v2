/* Global site data — identity, SEO defaults, socials, contact, analytics.
 *
 * Anything that appears in more than one place, or that a human might need to
 * change without touching markup, lives here. Templates read it as `site.*`.
 */
module.exports = {
  // ---- Identity -------------------------------------------------------------
  name: "Parichehr Talebzadeh",
  shortName: "Pari",
  // The name is rendered split: "Pari" large, the remainder small.
  nameSplit: { lead: "Pari", rest: "chehr Talebzadeh" },
  role: "Product Designer",
  location: { city: "Amsterdam", country: "NL", countryName: "the Netherlands" },
  flag: "/Assets/images/flag-nl.svg",

  // ---- SEO defaults ---------------------------------------------------------
  // Per-page front matter overrides title/description; these are the fallbacks.
  url: "https://parichehr.design",
  title: "Parichehr Talebzadeh · Product Designer",
  description:
    "Product designer building interaction systems. Based in Amsterdam. Currently exploring roles.",
  ogDescription: "Product designer building interaction systems. Based in Amsterdam.",
  ogImage: "/Assets/images/og-image.jpg",
  ogImageAlt: "Parichehr Talebzadeh, Product Designer building interaction systems",
  themeColor: "#111323",
  locale: "en_US",
  lang: "en",

  // ---- Availability ---------------------------------------------------------
  availability: "Available immediately",
  domains: ["Web3", "Enterprise", "Consumer", "EdTech"],
  resume: {
    url: "/Assets/documents/Parichehr_Talebzadeh_Resume.pdf",
    filename: "Parichehr_Talebzadeh_Resume.pdf",
    label: "Download Resume",
  },

  // ---- Bio ------------------------------------------------------------------
  intro:
    "I design complex products that real people actually use. Five years across consumer apps, B2B platforms, and Web3, usually as the only designer in the room. I build design systems, structure multi-audience flows, and turn messy problems into products that hold together at scale. Based in Amsterdam, looking for a team building something worth the complexity.",
  lead: {
    visible: "I solve problems",
    muted: "through digital products, from research to ready-to-build specs.",
    // Revealed by the cursor spotlight on the hero.
    hidden: ["Good design is invisible.", "I spend my days creating invisibility."],
  },

  // ---- Contact --------------------------------------------------------------
  // `groups` drives the expanded footer; `primary` drives the collapsed state.
  email: "info@parichehr.design",
  phone: "+31-657248971",
  whatsapp: "https://wa.me/31657248971",
  contactGroups: [
    {
      label: "Most Direct (Suggested)",
      links: [
        { name: "Email", value: "info@parichehr.design", url: "mailto:info@parichehr.design" },
        { name: "Whatsapp", value: "+31-657248971", url: "https://wa.me/31657248971", external: true },
      ],
    },
    {
      label: "Social Media",
      links: [
        {
          name: "Linkedin",
          value: "/parichehr-talebzadeh",
          url: "https://linkedin.com/in/parichehr-talebzadeh",
          external: true,
        },
        { name: "Twitter (X)", value: "/PariUXD", url: "https://x.com/PariUXD", external: true },
      ],
    },
    {
      label: "More In Depth",
      links: [
        { name: "Behance", value: "/pariuxd", url: "https://behance.net/pariuxd", external: true },
        { name: "Dribbble", value: "/pariuxd", url: "https://dribbble.com/pariuxd", external: true },
        { name: "GitHub", value: "/Parichehr96", url: "https://github.com/Parichehr96", external: true },
      ],
    },
  ],
  // Collapsed footer state — a short subset, in this order.
  contactPrimary: [
    { name: "Email", url: "mailto:info@parichehr.design" },
    { name: "Whatsapp", url: "https://wa.me/31657248971", external: true },
    { name: "Linkedin", url: "https://linkedin.com/in/parichehr-talebzadeh", external: true },
  ],

  // Feeds the JSON-LD `sameAs` array.
  sameAs: [
    "https://www.linkedin.com/in/parichehr-talebzadeh/",
    "https://twitter.com/PariUXD",
    "https://www.behance.net/pariuxd",
    "https://dribbble.com/pariuxd",
    "https://github.com/Parichehr96",
  ],
  knowsAbout: [
    "Product Design",
    "UX Design",
    "Design Systems",
    "User Research",
    "Interaction Design",
  ],

  // ---- Navigation -----------------------------------------------------------
  // ORDER MATTERS: scripts/nav.js picks the active item by walking these targets
  // in document order and keeping the last one whose top has crossed the line.
  nav: [
    { label: "Summary", target: "#summary" },
    { label: "Projects", target: "#featured-works" },
    { label: "About me", target: "#all-about-me" },
    { label: "Contact", target: "#contact", modifier: "contact" },
  ],

  // ---- Third party ----------------------------------------------------------
  analytics: { ga4: "G-JXCBH3PH93", clarity: "ybg1l63t5n", vercel: true },
  /* Figtree everywhere, DM Mono for the Snake readout, Caveat for the hero's
     handwritten "Pull a card out to read".

     RIBEYE MARROW IS GONE. It used to be requested here for the single word
     "Designer" in the hero; that word, and the display numerals that matched
     it, are Figtree now. Nothing on the site asks for it, so it is out of this
     URL too — don't add it back.

     CAVEAT STANDS IN FOR FIGMA HAND. The comp sets that line in Figma Hand
     (367:42807), which ships inside the Figma app and is not licensable as a
     webfont — so the exported arrow-pull.svg is the arrow ONLY and the words
     are live HTML. Caveat is the nearest freely-available hand face at a
     similar weight and slant. Swap the family in --font-hand if a licensed
     Figma Hand file ever arrives; nothing else has to change.

     WEIGHT 700 IS LOAD-BEARING: the hero sets "Pari.", "Product" and the folder
     card titles bold. Without it in this list the browser synthesises a faux
     bold, which is visibly wrong next to the real 600. Roboto was dropped here
     when the comp moved to Figtree — nothing references it any more. */
  fonts:
    "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=Caveat:wght@400;500&family=DM+Mono:wght@400&display=swap",

  // ---- Footer — Figma 275:57838 ---------------------------------------------
  // The two link columns the comp does NOT already have data for. "Case
  // studies" is not here on purpose: it is collections.workCards, so the footer
  // and the My Work section can never list a different three.
  // 404 — Figma 295:11180. Curly apostrophes are the comp's, not smart-quote
  // autocorrect: the sentence is set as written in the node.
  notFound: {
    subtitle:
      "Looks like this page isn\u2019t here! no problem, let\u2019s get you back ...",
    cta: "To the homepage",
  },

  footer: {
    heading: "You made it to the end!",
    tagline: "If this sparked something, tell me. I'd love to talk.",
    siteName: "Pari\u2019s Portfolio",
    // THE TWO ACTIONS AND THE THREE SOCIALS ARE WHAT THE COLUMNS BECAME.
    // 568:39273 replaced the three link columns (Case studies / More works /
    // Get in touch) with one pair of actions and a row of brand chips, so
    // `titles` and `moreWorks` are gone rather than merely unrendered — nothing
    // reads them any more. The two URLs that were in `moreWorks` survive here,
    // on the chips.
    //
    // contactPrimary IS DELIBERATELY LEFT ALONE one screen up. The footer was
    // its only consumer, so it is unreferenced as of this change, but it is the
    // canonical contact list and the mailto below is the same address it holds
    // — deleting it would throw away the record to save three lines.
    //
    // WHATSAPP AND MEDIUM ARE THE TWO THINGS THAT LEAVE THE PAGE. Neither is in
    // the new comp: Whatsapp was a Get in touch row and Medium was a More works
    // row that never had a URL to begin with.
    actions: [
      { name: "Email Me", url: "mailto:info@parichehr.design" },
      {
        name: "Set a Meeting",
        url: "https://calendar.app.google/esnBYXwJEYMbRyxb6",
        external: true,
      },
    ],

    // `icon` keys into the map in components/icon.njk. Name doubles as the
    // link's accessible name — the chips are glyphs with no text.
    socialTitle: "Find me on",
    socials: [
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/parichehr-talebzadeh",
        icon: "linkedin",
      },
      { name: "Dribbble", url: "https://dribbble.com/pariuxd", icon: "dribbble" },
      { name: "Behance", url: "https://behance.net/pariuxd", icon: "behance" },
    ],
  },

  copyrightYear: 2026,
};
