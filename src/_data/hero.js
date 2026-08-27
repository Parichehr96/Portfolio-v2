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
 * GEOMETRY. The board is a fixed 1272 × 897 frame in Figma and every position
 * below is a PERCENTAGE of it, so the whole composition scales with the
 * viewport instead of pinning to a magic pixel. Card `x`/`y` are the card's
 * CENTRE (the CSS centres each card on that point), which is what makes the
 * ±rotation read as a fan around a stable pivot rather than drifting.
 */

// Board frame in Figma units — the divisor for every percentage below.
const BOARD_W = 1272;
// 457:58676. The rebuilt board is 897 tall, not the 668 of the first pass —
// every pctY() below re-derives from this, so it is the only number to change.
const BOARD_H = 897;

const pctX = (px) => +((px / BOARD_W) * 100).toFixed(4);
const pctY = (px) => +((px / BOARD_H) * 100).toFixed(4);

module.exports = {
  header: {
    logo: { file: "logo-mark.svg", size: 40 },
    name: { lead: "Pari", rest: "chehr Talebzadeh" },
    // Absolute hrefs so the header works from /work/* and /projects too.
    // THREE ITEMS, CONTACT INCLUDED. It used to be a `cta` rendered as a filled
    // accent pill; Figma 446:37196 has no pill in either variant — all three are
    // instances of the same Nav_item component, 71px wide and 32px apart. So
    // Contact is a link like the others and the pill styling is gone.
    links: [
      // #about-me, not the v2 #all-about-me — that id belonged to the milestone
      // timeline, which the cleanup sweep removed. partials/about.njk carries
      // this one.
      { label: "About Me", href: "/#about-me" },
      { label: "My Work", href: "/#featured-works" },
      // #contact HAS NO TARGET YET — the footer (289:2233) is unbuilt. The
      // scroll-spy is written to cope: it observes whichever ids actually
      // resolve, so this lights up on its own the day the section lands.
      { label: "Contact", href: "/#contact" },
    ],
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

  /* THE FOLDER-FRONT LABEL replaces the old "(2021 - 2026)" / "Pull a card out"
     pair that sat BELOW the folder. 432:11655 puts a single white pill ON the
     flap instead, and the instruction moved to the arrow (see `arrow`), so the
     two captions had nothing left to say. */
  expertise: { label: "My Expertise" },

  /* THE ARROW IS TWO ELEMENTS, and has to be. arrow-pull.svg is the drawn arrow
     ONLY — Figma keeps the words in a separate text node (367:42807) set in
     Figma Hand, which ships inside the Figma app and cannot be licensed as a
     webfont. So the words are live HTML in Caveat and the SVG stays wordless.
     Baking them in would need the font to outline them, which is the same
     blocker one step earlier. */
  arrow: {
    file: "arrow-pull.svg",
    text: "Pull a card out to read",
  },

  /* Cards, in DOM order = z-order (1 backmost, 3 frontmost), matching the Figma
     layer stack inside 390:469.

     ALL THREE CARDS ARE 240 x 260. There is no per-card size and there must not
     be one: an earlier pass read Figma's w/h for cards 1 and 3 as their own
     dimensions and hardcoded 286x302 and 285x301, which stretched them ~19%
     wide and ~16% tall. Those numbers are ROTATED BOUNDING BOXES —
     get_metadata reports the axis-aligned box for a rotated node, and
     w' = w·cosθ + h·sinθ reproduces both to 0.02px from 240 x 260 at the
     angles below. Rotation belongs in the transform chain, never in the size.

     THE FAN IS SYMMETRIC, AND IT IS MATCHED BY EYE, NOT BY COORDINATE. Card 2
     sits upright and highest; cards 1 and 3 drop the same ~20px below it and
     tilt equal-and-opposite either side. Card 1 is placed as card 3's mirror.

     Figma's metadata disagrees: it puts card 1 some 47px below card 3. That
     reading is an artefact of how rotated nodes report their position — the
     same class of error that made cards 1 and 3 appear to be different SIZES
     — and the rendered comp plainly shows the two outer cards at nearly the
     same height. Where the numbers and the picture disagree here, the picture
     wins. Do not "correct" these back to the reported centres.

     THIS IS NOT THE SIZE BUG RETURNING. Per-card *size* was wrong because
     Figma reports rotated bounding boxes; per-card *position* is real, and the
     two are independent. Size stays uniform in the CSS; only x/y/rotate vary.

     x and y are percentages of the cards frame,
     derived from the Figma ROTATION BOUNDING BOX (centre = x + w/2, y + h/2) —
     not the box's top-left, which is what makes the ±rotation fan around a
     stable pivot. Verified against fresh figma-dev-mode metadata; every value
     below is within 0.05 board units of the comp. */
  cards: [
    {
      title: "Interaction and UX Design",
      body: [
        {
          text: "I design the flows, states, and micro-decisions that make complex products feel obvious.",
          tone: "lead",
        },
        {
          text: " Starting from user research and real behavioral data, I turn ambiguous problems into structured, testable interfaces, and stay close to engineering so what ships matches what was designed.",
          tone: "muted",
        },
      ],
      // HEIGHT AND TILT MIRROR CARD 3; X DOES NOT. Figma's reported centre-Y
      // sinks this card ~47px below card 3, which the rendered comp plainly
      // contradicts — the two outer cards sit at nearly the same height there.
      // So y and rotate are taken as card 3's mirror.
      //
      // X IS THE FILE'S OWN VALUE and was already right. Mirroring it too
      // (15.73%) pushed the card left until its title cleared card 2 entirely;
      // in the comp that title is half-hidden behind card 2, which is what
      // 23.96% reproduces. The fan is symmetric in height and tilt, and
      // deliberately tighter on the left — matched against the render, not
      // read off the coordinates.
      x: 23.9558,
      y: 49.8472,
      rotate: -11.02,
    },
    {
      title: "Product Redesign",
      // TWO SPANS, like all three. Every card splits its body the same way in
      // Figma — an opening sentence at #1a1a1a, the remainder at #727272 — and
      // only this one was built that way at first. The template still accepts a
      // plain string, so a future single-tone card needs no new branch.
      body: [
        {
          text: "I take products that grew organically, inconsistent patterns, bloated flows, unclear hierarchy, and rebuild them around how people actually use them. ",
          tone: "lead",
        },
        {
          text: "That means auditing the existing system, cutting what doesn't earn its place, and restructuring information so the next feature makes things simpler, not heavier.",
          tone: "muted",
        },
      ],
      x: 50.0870,
      // 397.24 board px — the highest; the only card whose top is the
      // frame's own top, because it is the one that is not rotated.
      y: 43.0457,
      rotate: 0,
    },
    {
      title: "Strategic Design",
      body: [
        {
          text: "I connect design decisions to product and business goals.",
          tone: "lead",
        },
        {
          text: " I help teams decide what to build and in what order; mapping systems, aligning stakeholders early, and building design systems that keep quality and speed high as the product scales.",
          tone: "muted",
        },
      ],
      x: 84.4478,
      // 417.78 board px — between the other two.
      y: 49.8472,
      rotate: 11.02,
    },
  ],

  /* Floating marks — 457:58676 resting CENTRES, as a percentage of the board.
     `size` is a percentage of board WIDTH; the CSS keeps them square via
     aspect-ratio, so one number does both axes.

     THESE ARE CENTRES, NOT TOP-LEFTS, which changed with this rebuild. The CSS
     now pulls each icon back by half its own box, so the wiggle orbits the
     Figma position rather than starting from its corner — and an icon's
     resting point stays put whatever its size. */
  icons: [
    { slug: "notion", label: "Notion", file: "icon-notion.svg", x: 13.76, y: 11.48, size: pctX(56) },
    { slug: "figma", label: "Figma", file: "icon-figma.svg", x: 83.02, y: 10.81, size: pctX(56) },
    { slug: "jira", label: "Jira", file: "icon-jira.svg", x: 89.78, y: 46.49, size: pctX(60) },
    { slug: "claude", label: "Claude", file: "icon-claude.svg", x: 23.98, y: 90.86, size: pctX(64) },
  ],

  /* Static decoration. None of this wiggles, drags or animates — it is artwork
     the composition needs and the interaction layer must not touch.

     THERE IS NO CURSOR MARK IN THIS LIST, AND ONE MUST NOT BE ADDED. A static
     arrow has been put here twice on the reading that the comp draws one —
     dropped in 7a1425b, reinstated, and now dropped again. 457:58676 has no
     such element: its only arrow is arrow-pull.svg, the drawn one with the
     handwritten line beside it. What the comp does show is the POINTER as an
     arrow, and _hero.css supplies that by swapping the OS cursor inside
     .hero__board. That is why icon-cursor stays on disk with no entry here —
     it is the source for the live cursor image, not for a decoration. Drawing
     both puts a frozen arrow on the board next to the one that moves.

     THE TWO MOCKUPS ARE PNG, NOT SVG. Pari's exports embed rasters: the phone
     was a 9.7 MB SVG for a 95 x 207 slot. Rendered to PNG at 3x they are 105 KB
     and 91 KB, visually identical at every size the board reaches, and the
     multi-megabyte originals never enter the repo. */
  decor: [
    {
      slug: "arrow",
      file: "arrow-pull.svg",
      x: 51.01,
      y: 21.32,
      w: pctX(59.66),
    },
    {
      slug: "campaign",
      file: "campaign_landing.png",
      x: 9.94,
      y: 55.21,
      w: pctX(95.04),
    },
    {
      slug: "website",
      file: "website_landing.png",
      x: 84.21,
      y: 85.02,
      w: pctX(242.41),
    },
  ],

  /* MOCKUP CAPTIONS — 450:37859 and 392:14769. The comp writes each mockup's
     source filename under it. An earlier pass read these as Figma annotations
     and skipped them; they are drawn text nodes inside 457:58676 like any other
     label in the board, and they render.

     x IS A CENTRE, y IS A TOP, and the mismatch is deliberate. Every other
     floating element here is centred on its Figma point, and x still is —
     each caption's centre-x is exactly its mockup's own centre-x (126.5 and
     1071.21 board px), which is what keeps the label under the artwork at any
     board width. But a Figma text node is TOP-aligned inside its box: these
     sit in fixed 20px boxes carrying a 19.2px line, so centring the two boxes
     on each other drops the text ~0.4px below where the comp draws it.
     Anchoring by the top removes that, and makes y literally the node's own
     reported y — 214.496 inside a Phone Mockup at 392, and 145.280 inside a
     Container at 694 — which is a value anyone can check against the file.

     Each box top clears the artwork above it by exactly 8px.

     PURELY DECORATIVE. A caption that names an asset file is not information a
     screen-reader user is missing — the mockups themselves are aria-hidden for
     the same reason, and these are rendered the same way. */
  captions: [
    {
      slug: "campaign",
      text: "campaign_landing.svg",
      x: pctX(126.5), // centre-x — the campaign mockup's own
      y: pctY(606.496), // top — 392 (Phone Mockup) + 214.496 (450:37859)
      w: pctX(131),
    },
    {
      slug: "website",
      text: "website_landing.svg",
      x: pctX(1071.2052), // centre-x — the website mockup's own
      y: pctY(839.28), // top — 694 (Container) + 145.280 (392:14769)
      w: pctX(242.4104),
    },
  ],

  // The words beside the arrow. Centre, as % of the board.
  arrowText: { x: 61.6, y: 17.39 },

  /* The "My Expertise" pill, sitting ON the folder front. Its centre is
     49.95% / 62.18% of the BOARD in Figma; expressed here relative to the flap
     box (298.05, 392.08, 685.68 x 302.40) because the pill is a child of the
     flap button, not of the board. Converting once here keeps the CSS a plain
     percentage offset instead of a calc() chain against two coordinate spaces. */
  expertisePos: { x: 49.1898, y: 54.7863 },

  // Folder art. Insets are percentages of the 864 × 864 glyph box — the same
  // model as before, re-solved against 457:58676 (the box was 720 at 1272x668).
  folder: {
    back: { file: "folder-back.svg", inset: "21.25% 20% 23.07% 10%" },
    front: { file: "folder-front.svg", inset: "43.25% 9.59% 21.75% 11.05%" },
  },

  // Where the hand-exported Figma assets live (passthrough-copied verbatim).
  assetPath: "/Assets/images/hero",
};
