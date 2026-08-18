/* HEADER + HERO CONTENT — Figma file B8Kfu0nGgUIG0REVlQTD5C.
 *   Header       184:13318
 *   Hero Section 184:13327
 *   Card canvas  362:42393
 *
 * Every string here is VERBATIM from Figma (extracted 2026-08-16). Two of them
 * differ from how they are usually written and are correct as-is:
 *   • "Interaction and UX Design" — not "Interaction Design".
 *   • "(2021 - 2026)" — a plain hyphen, not an en-dash.
 *
 * GEOMETRY. The board is a fixed 1272 × 668 frame in Figma and every position
 * below is a PERCENTAGE of it, so the whole composition scales with the
 * viewport instead of pinning to a magic pixel. Card `x`/`y` are the card's
 * CENTRE (the CSS centres each card on that point), which is what makes the
 * ±rotation read as a fan around a stable pivot rather than drifting.
 */

// Board frame in Figma units — the divisor for every percentage below.
const BOARD_W = 1272;
const BOARD_H = 668;

const pctX = (px) => +((px / BOARD_W) * 100).toFixed(4);
const pctY = (px) => +((px / BOARD_H) * 100).toFixed(4);

module.exports = {
  header: {
    logo: { file: "logo-mark.svg", size: 40 },
    name: { lead: "Pari", rest: "chehr Talebzadeh" },
    // Absolute hrefs so the header works from /work/* and /projects too.
    links: [
      { label: "About Me", href: "/#all-about-me" },
      { label: "My Work", href: "/#featured-works" },
    ],
    cta: { label: "Contact", href: "/#contact" },
  },

  title: {
    greeting: "I’m",
    name: "Pari.",
    roleLead: "Product",
    // Rendered in Ribeye Marrow, which is drawn outlined by the typeface
    // itself — there is deliberately no CSS text-stroke on this.
    roleOutline: "Designer",
  },

  tagline:
    "I solve problems through digital products, from research to ready-to-build specs",

  caption: {
    years: "(2021 - 2026)",
    hint: "Click to drag a card",
  },

  /* Cards, in DOM order = z-order (1 backmost, 3 frontmost), matching the Figma
     layer stack inside 390:469.

     x/y are each card's CENTRE as a percentage of the 475 x 263 cards frame,
     derived from the Figma ROTATION BOUNDING BOX (centre = x + w/2, y + h/2) —
     not the box's top-left, which is what makes the ±rotation fan around a
     stable pivot. Verified against fresh figma-dev-mode metadata; every value
     below is within 0.05 board units of the comp. */
  cards: [
    {
      title: "Interaction and UX Design",
      body: "I design the flows, states, and micro-decisions that make complex products feel obvious. Starting from user research and real behavioral data, I turn ambiguous problems into structured, testable interfaces, and stay close to engineering so what ships matches what was designed.",
      x: 29.034,
      // DELIBERATELY NOT THE COMP. Figma places this card's centre at 67.6141,
      // which sits it ~47 units below card 3 and makes the resting fan look
      // lopsided — the two outer tilted cards read as mismatched rather than
      // as a pair. Levelled with card 3 (49.8036) so the fan is symmetric.
      // Revisit only alongside the comp; re-syncing it from Figma will
      // reintroduce the imbalance.
      y: 49.8036,
      rotate: -11.31,
    },
    {
      title: "Product Redesign",
      body: "I take products that grew organically, inconsistent patterns, bloated flows, unclear hierarchy, and rebuild them around how people actually use them. That means auditing the existing system, cutting what doesn't earn its place, and restructuring information so the next feature makes things simpler, not heavier.",
      x: 50.095,
      y: 41.9558,
      rotate: 0,
    },
    {
      title: "Strategic Design",
      body: "I connect design decisions to product and business goals. I help teams decide what to build and in what order; mapping systems, aligning stakeholders early, and building design systems that keep quality and speed high as the product scales.",
      x: 79.9365,
      y: 49.8036,
      rotate: 11.02,
    },
  ],

  /* Floating marks. `size` is a percentage of board WIDTH; the CSS keeps them
     square via aspect-ratio, so one number does both axes. All four are real
     brand marks and are named for assistive tech.

     THE CURSOR ARROW IS DELIBERATELY ABSENT. Figma draws one at (883.48,
     401.48) as static decoration, but the interaction phase makes that same SVG
     the board's live CSS cursor — rendering it here as well would leave a
     frozen second arrow on screen. Assets/images/hero/icon-cursor.svg is
     therefore still shipped and still needed; it is just not an element. This
     is a knowing divergence from the comp, not an omission. */
  icons: [
    { slug: "notion", label: "Notion", file: "icon-notion.svg", x: pctX(78), y: pctY(99), size: pctX(80) },
    { slug: "claude", label: "Claude", file: "icon-claude.svg", x: pctX(226), y: pctY(529), size: pctX(80) },
    { slug: "figma", label: "Figma", file: "icon-figma.svg", x: pctX(936), y: pctY(90), size: pctX(80) },
    { slug: "jira", label: "Jira", file: "icon-jira.svg", x: pctX(1117), y: pctY(370), size: pctX(60) },
  ],

  // Folder art. Insets are percentages of the 720 × 720 glyph box (367:42712).
  folder: {
    back: { file: "folder-back.svg", inset: "21.25% 20% 23.07% 10%" },
    front: { file: "folder-front.svg", inset: "43.25% 9.59% 21.75% 11.05%" },
  },

  // Where the hand-exported Figma assets live (passthrough-copied verbatim).
  assetPath: "/Assets/images/hero",
};
