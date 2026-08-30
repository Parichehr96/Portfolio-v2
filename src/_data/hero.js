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
// 457:58676. THIS IS THE ONLY PLACE THE BOARD HEIGHT IS WRITTEN, and it has to
// track --hero-board-h in tokens.css or every pctY() below silently lies. It sat
// at 897 for one revision after the node was shortened to 753, which is exactly
// what put the mockup captions on top of their images: caption y divides by this,
// the mockups' own y values were hardcoded percentages of the old height, and the
// two drifted apart by different amounts. Change both files together.
const BOARD_H = 753;

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
    // ORDER IS THE SCROLL ORDER, and 446:37196 draws it that way: index.njk
    // includes work before about, so My Work comes first. This array shipped
    // reversed for a while — About Me, then My Work — which put the bar out of
    // step with the page under it. Reorder here only if the sections move.
    links: [
      { label: "My Work", href: "/#featured-works" },
      // #about-me, not the v2 #all-about-me — that id belonged to the milestone
      // timeline, which the cleanup sweep removed. partials/about.njk carries
      // this one.
      { label: "About Me", href: "/#about-me" },
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
    // Was Ribeye Marrow, an outlined face; that font is retired, so this is
    // Figtree at regular weight against the bold "Product". The key name keeps
    // its -outline suffix to stay in step with the .hero__role-outline class.
    roleOutline: "Designer",
  },

  tagline:
    "I solve problems through digital products, from research to ready-to-build specs",

  /* THE FOLDER-FRONT LABEL replaces the old "(2021 - 2026)" / "Pull a card out"
     pair that sat BELOW the folder. 432:11655 puts a single white pill ON the
     flap instead, and the instruction moved to the arrow (see `arrow`), so the
     two captions had nothing left to say. */
  expertise: { label: "My Expertise" },

  /* THE ARROW IS ONE ELEMENT NOW. It used to be two: arrow-pull.svg was the
     drawn curve ONLY, and the words beside it were live HTML in Caveat, because
     Figma sets them in Figma Hand (367:42807) — a face that ships inside the
     Figma app and cannot be licensed as a webfont.

     THE RE-EXPORT OUTLINES THEM. 465:61243 now comes out of Figma as one
     262 x 64 graphic with the letterforms as vector paths, which is the only way
     to get the real Figma Hand shapes onto the page. Caveat was always a stand-in
     for them; this is the thing itself. The trade is that the words are no longer
     selectable text — the <img>'s alt carries them instead, so the sentence is
     still announced and still indexed.

     There is no `text` key here on purpose. Anything that renders one would draw
     the words a SECOND time, on top of the ones in the artwork. */

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
      // Y IS CARD 3'S MIRROR, AND THE METADATA IS WRONG HERE. 434:11714 reports a
      // centre-y of 65.5793% of the cards frame, which would sink this card ~38px
      // below card 3. The RENDER of 457:58676 shows the two outer cards level with
      // each other, and where the numbers and the picture disagree the picture
      // wins — Figma reports the axis-aligned box of a ROTATED node, and at -11.02
      // degrees that box's centre is not the card's visual centre.
      //
      // THIS HAS BEEN ROUND-TRIPPED ONCE. 65.5793 was applied on the reasoning
      // that the file's own value should be trusted, and it visibly dropped the
      // left card out of the fan. It was reverted. Do not re-apply it from the
      // metadata a third time without looking at the render first.
      //
      // X and ROTATE keep the tighter-on-the-left values. X is the file's own;
      // mirroring it to 15.73% pushed the card left until its title cleared card
      // 2 entirely, where the comp keeps that title half-hidden behind it.
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
  /* EVERY BOARD CHILD CARRIES TWO POSITIONS, and `m` is the second one.
     566:38397 is not a reflow of the desktop board — it is 356 x 753 portrait
     against 1272 x 753 landscape, so the aspect inverts and no percentage
     survives the change. hero.njk writes both sets as custom properties and the
     <=480 block in _hero.css switches which one each rule reads; nothing here is
     chosen at runtime. `m` values are percentages of the 356 x 753 board, the
     same convention `x`/`y`/`size` use for the desktop one. */
  icons: [
    { slug: "notion", label: "Notion", file: "icon-notion.svg", x: 13.76, y: 11.48, size: pctX(56),
      m: { x: 46.180, y: 7.888, size: 12.584 } },
    { slug: "figma", label: "Figma", file: "icon-figma.svg", x: 83.02, y: 10.81, size: pctX(56),
      m: { x: 75.112, y: 14.396, size: 12.584 } },
    { slug: "jira", label: "Jira", file: "icon-jira.svg", x: 89.78, y: 46.49, size: pctX(60),
      m: { x: 11.236, y: 75.963, size: 13.483 } },
    { slug: "claude", label: "Claude", file: "icon-claude.svg", x: 23.98, y: 90.86, size: pctX(64),
      m: { x: 11.124, y: 92.244, size: 14.382 } },
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
      // 465:61243 — the WHOLE arrow-pull frame (curve + outlined words), centred
      // on the comp's box: (619, 115) 262 x 64 on the 1272 x 753 board. The old
      // numbers here placed the 60-wide curve alone; the words carried their own
      // pair. One graphic, one position now.
      slug: "arrow",
      file: "arrow-pull.svg",
      alt: "Pull a card out to read",
      x: 58.9623,
      y: 19.5219,
      w: 20.5975,
      // 566:37698 — 262 x 64 at (130, 178) on the 356-wide mobile board.
      //
      // NARROWER THAN THE NODE'S FRAME, AND IT HAS TO BE. The comp's frame IS
      // 262 (73.596%), but its Arrow Text child is only 156 wide at x=60, so the
      // words stop at 346 and only empty frame bleeds past 356. Our asset is the
      // DESKTOP export, whose text is 195 wide and runs to the frame's own right
      // edge — at 262 the last glyph would land at 392 and .hero__board's
      // overflow would eat 36px of "read".
      //
      // So the frame is sized to the WORDS instead of to the node's box: 216 wide
      // (60.674%) centred at 238 (66.854%) keeps the left edge at 130, exactly
      // where the comp starts the curve, and lands the last glyph at 346 —
      // exactly where the comp lands its own. The curve comes out ~50 wide
      // rather than 60; that is the price of one asset serving both widths, and
      // it is the half of the graphic that has slack. Re-export a mobile arrow
      // with the smaller text baked in and these two numbers go back to the
      // node's 73.315 / 73.596.
      m: { x: 66.854, y: 27.888, w: 60.674 },
    },
    {
      // 450:37220 inside Phone Mockup 450:37860 — image centre (126.50, 466.248)
      // on the 1272 x 753 board. y was 55.21, a percentage of the old 897.
      slug: "campaign",
      file: "campaign_landing.png",
      x: 9.9450,
      y: 61.9188,
      w: pctX(95.04),
      m: { x: 13.719, y: 13.590, w: 19.222 }, // 566:37704
    },
    {
      // 392:14768 inside Container 434:11677 — image centre (984.2052, 638.64).
      // BOTH axes were stale: y was a percentage of 897, and x still placed the
      // container at its old x=950. The node moved it to 863 when the board was
      // shortened, which is why the laptop sat 87px too far right.
      slug: "website",
      file: "website_landing.png",
      x: 77.3746,
      y: 84.8127,
      w: pctX(242.41),
      m: { x: 64.597, y: 83.255, w: 54.474 }, // 566:37685
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
      // TOP, not centre (see the note above). 450:37859 sits at 363 + 214.496 =
      // 577.496 on the 753 board — 8px under the image's bottom at 569.496,
      // which is the gap the comp draws under both mockups.
      y: pctY(577.496),
      w: pctX(131),
      // 566:38271. y is a TOP here, like the desktop pair.
      m: { x: 13.719, y: 24.228, w: 26.405 },
    },
    {
      slug: "website",
      text: "website_landing.svg",
      x: pctX(984.2052), // centre-x — follows the mockup's 87px move left
      // 392:14769 at 570 + 145.280 = 715.280; the image bottom is 707.280, so
      // the same 8px gap as the phone.
      y: pctY(715.280),
      w: pctX(242.4104),
      m: { x: 64.597, y: 91.398, w: 54.474 }, // 566:37697
    },
  ],

  /* The "My Expertise" pill (432:11655), sitting ON the folder front. Expressed
     relative to the FLAP box because the pill is a child of the flap button, not
     of the board — converting once here keeps the CSS a plain percentage offset
     instead of a calc() chain across two coordinate spaces.

     RE-SOLVED FOR THE 0.8 FLAP. The pill itself did not change size — it is 197 x
     62 in the comp before and after, and in CSS it is sized by its own text and
     padding, not by a percentage of the flap. What changed is the box underneath
     it: the flap went 685.68 x 302.40 -> 548.54 x 241.92, so the same absolute
     centre is now a different fraction of it. y moved 54.7863 -> 51.1277; x is
     unchanged to within a rounding step because the flap scaled about its own
     centre horizontally. */
  expertisePos: { x: 49.1816, y: 51.1277 },

  // Folder art. Insets are percentages of the 864 × 864 glyph box — the same
  // model as before, re-solved against 457:58676 (the box was 720 at 1272x668).
  folder: {
    back: { file: "folder-back.svg", inset: "21.25% 20% 23.07% 10%" },
    front: { file: "folder-front.svg", inset: "43.25% 9.59% 21.75% 11.05%" },
  },

  // Where the hand-exported Figma assets live (passthrough-copied verbatim).
  assetPath: "/Assets/images/hero",
};
