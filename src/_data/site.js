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
  ogImage: "/Assets/og/og-preview.png",
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
  analytics: { ga4: "G-JXCBH3PH93", vercel: true },
  /* Figtree everywhere, DM Mono for the Snake readout, Ribeye Marrow for the
     single word "Designer" in the hero, Caveat for the hero's handwritten
     "Pull a card out to read".

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
    "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=Caveat:wght@400;500&family=DM+Mono:wght@400&family=Ribeye+Marrow&display=swap",

  // ---- Footer — Figma 275:57838 ---------------------------------------------
  // The two link columns the comp does NOT already have data for. "Case
  // studies" is not here on purpose: it is collections.workCards, so the footer
  // and the My Work section can never list a different three.
  footer: {
    heading: "You made it to the end!",
    tagline: "If this sparked something, tell me. I'd love to talk.",
    siteName: "Pari\u2019s Portfolio",
    titles: {
      caseStudies: "Case studies",
      moreWorks: "More works",
      getInTouch: "Get in touch",
    },
    // Behance and Dribbble reuse the URLs already in contactGroups rather than
    // restating them. MEDIUM HAS NO URL: the comp lists it but no Medium
    // account appears anywhere in this file or in `sameAs`, so it renders as
    // plain text rather than a link to a guess. Add the url and it becomes a
    // link with no template change.
    moreWorks: [
      { name: "Behance", url: "https://behance.net/pariuxd", external: true },
      { name: "Dribbble", url: "https://dribbble.com/pariuxd", external: true },
      { name: "Medium", url: null },
    ],
  },

  copyrightYear: 2026,
};
