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
