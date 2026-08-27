/* ABOUT ME — Figma 185:2029 "Bio Container".
 *
 * Copy is verbatim from the comp. Geometry notes live next to the values they
 * explain in _about.css; this file is content only.
 *
 * STATS REUSE stats.js rather than restating the numbers. That array is also
 * consumed by the Summary block (index.njk), where it renders in a different
 * order and with "5+" rather than "5" — so it is re-mapped here instead of
 * edited, which would silently change a section this phase must not touch.
 * The numbers stay in one place; only the presentation differs.
 */
const stats = require("./stats.js")();

const byLabel = (needle) =>
  stats.find((s) => s.label.toLowerCase().indexOf(needle) === 0);

module.exports = {
  heading: { lead: "About", rest: "Me" },

  // Figma order, Figma labels. Values come from stats.js except the years,
  // which the comp writes bare ("5") where the Summary block writes "5+".
  stats: [
    { value: byLabel("shipped").value, label: "Shipped Products" },
    { value: byLabel("side").value, label: "Side Projects" },
    { value: "5", label: "Years of Experience" },
  ],

  bio: [
    "I'm a product designer who's drawn to complexity — the kind that lives beneath every interaction in products real people rely on. My background in Industrial Design taught me to think in systems; my Master's in Interaction Design taught me to ground those systems in evidence. I work best where the problem is ambiguous and no one quite owns it yet.",
    "Across five years I've shipped consumer apps, B2B platforms, and Web3 products — often as the sole or lead designer. I've grown a product from 87 to 1,500 daily active users, cut task times through progressive disclosure, and built design systems that outlived my time on the team. I care about structure before pixels, evidence over opinion, and shipping something viable over polishing something theoretical.",
    "Right now I'm looking for a team building ambitious products where design meaningfully shapes the direction, not just the surface. If that's you, I'd love to talk.",
  ],

  location: "Based in the Netherlands",

  illustration: {
    file: "/Assets/images/about/illustration-pari.png",
    alt: "Line illustration of Parichehr, arms folded",
    /* The frame is a SEPARATE asset, not a CSS border and not baked into the
       illustration. Figma draws it as an OPEN path: the bottom edge stops at
       x=73.85 and resumes at x=425, leaving a gap the folded arms pass
       through. No border-radius can reproduce that, which is why it ships as
       artwork. Both files share one 528x622 coordinate space, so they line up
       with no fudge factors. */
    frame: "/Assets/images/about/frame-pari.svg",

    /* THE EYES, MEASURED OFF THE ARTWORK rather than eyeballed. Every number
       here came from scanning the PNG column by column for its dark runs and
       mapping them through the transform _about.css applies: the raster is
       drawn into x 53..493 at 440x622 and mirrored, so image x maps to
       493 - x * 440/1181 and image y to y * 622/1332.

       WHAT THE SCAN SHOWED, and it is the reason these are not the obvious
       numbers. The lash and the pupil are one fused blob, so the blob's centre
       is NOT the pupil's: the pupil's top half is hidden inside the lash. Read
       the columns where the two separate — the lash is its own short run,
       consistently ending at image y 353 — and the pupil's VISIBLE part is
       image y 354..377. That is what these centres describe, which is why cy
       sits at 170.5 rather than at the blob's 169.

       ONE ELLIPSE, USED TWICE. The patch and the pupil are the same shape at
       the same place, which is the whole trick: at rest they coincide exactly,
       so nothing of either is visible and the eye is the eye. Only when the
       pupil slides does the patch behind it show — as the white the pupil
       vacated, which is what an eye looking sideways actually does.

       An earlier version made the patch bigger than the pupil "to be safe" and
       got a white ring around a dot for its trouble. Bigger is not safer here;
       identical is.

       THE ELLIPSE IS DELIBERATELY FULLER THAN THE INK IT COVERS. The baked
       pupil is a teardrop — widest immediately under the lash, tapering below —
       and no ellipse of the same size contains it: match its extents and its
       shoulders spill out at the sides. So rx/ry are inflated until the ellipse
       swallows the teardrop whole, at the cost of a pupil a shade rounder and
       fuller than the drawing's. That is the visible trade, and it is the one
       worth making: a stray crescent of the original showing at full deflection
       reads as two pupils, which is unmissable.

       rx IS PER EYE because the two are not the same width in the drawing: the
       viewer's left is the fuller of the two, being the further from the turn
       of the head. ry is shared, and is set by the deflection rather than the
       ink: the pupil has to still meet the lash at its lowest, so its top is
       drawn well up under the swoosh where nothing can see it.

       clip IS THE SHAPE OF THE LASH'S UNDERSIDE, and the first two attempts
       both foundered on assuming it was a straight line. It very nearly is —
       flat at y 164.8 across the width of the pupil — but at the outer corner
       the lash tail thickens and dives, reaching 169 within two units. A flat
       clip there ate the tail and left the eye looking thin. Hence a polygon:
       level over the pupil, then dropping away to clear the tail.

       Viewer's left first; it is the one with the larger x, the illustration
       being mirrored. */
    eyes: [
      {
        cx: 318.9,
        cy: 170.5,
        rx: 4.8,
        ry: 7.0,
        clip: "313.5,164.8 321,164.8 323.4,169.4 323.4,190 313.5,190",
      },
      {
        cx: 280.4,
        cy: 170.9,
        rx: 4.4,
        ry: 7.0,
        clip: "275.5,165.4 282.5,165.4 284.6,169.4 284.6,190 275.5,190",
      },
    ],
  },

  /* TIME WIDGET — static markup only. These are the comp's mocked values; a
     later phase points scripts/clock.js at the data-clock-* hooks in about.njk
     and they become live. The sub-line is verbatim the first variation of that
     script's 09:00-12:30 block, so the two already agree. */
  clock: {
    atLabel: "At",
    time: "02:18",
    statusLead: "I'm",
    status: "probably in deep work",
    detail: "Designing, prototyping, or solving complex product problems.",
  },
};
