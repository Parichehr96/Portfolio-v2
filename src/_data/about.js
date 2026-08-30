/* ABOUT ME — Figma 543:1124. Copy is verbatim from the node; geometry notes
 * live next to the values they explain in _about.css. This file is content only.
 *
 * NO STATS ARRAY ANY MORE. This used to carry three re-mapped stats.js entries
 * (Shipped Products / Side Projects / Years of Experience) rendered as a row
 * under the heading. 543:1124 has no such row: its right column runs heading
 * (y=60) -> the three paragraphs (124, 244, 412) -> the clock band (544), and
 * nothing else. The require("./stats.js") went with it, so stats.js now has no
 * consumer — it is left on disk rather than deleted, in case the "At a Glance"
 * block that index.njk records as removed ever comes back.
 *
 * NO `location` EITHER. "Based in the Netherlands" was its own line with a flag
 * icon; the node folds the country into the third paragraph as bold text, so
 * the line, the flag <img> and this key are all gone.
 */
module.exports = {
  heading: { lead: "About", rest: "Me" },

  /* RUNS, NOT STRINGS. Each paragraph is a list of {text} / {text, bold} pieces
     so the emphasis is data rather than markup — the same shape hero.js uses for
     its card bodies. about.njk joins them with no separator, so every run must
     carry its own leading or trailing space.

     THE BOLD SET IS THE NODE'S, AND IT IS SHORT ON PURPOSE. 543:1124 bolds three
     spans across the whole bio and nothing else: the role, the results, and the
     country. Paragraph 1 carries none. Adding a fourth is a design change, not a
     copy edit.

     COPY CHANGED WITH IT, in three places the node is explicit about:
       - p1 drops "— the kind that lives beneath every interaction in products
         real people rely on", which is what takes it from five lines to the
         node's four (543:1136 is 96 tall = 4 x 24);
       - p2 replaces the em-dash before "often" with a comma;
       - p3 gains "in the Netherlands" and loses the closing "If that's you, I'd
         love to talk." sentence. */
  bio: [
    [
      {
        text: "I'm a product designer who's drawn to complexity. My background in Industrial Design taught me to think in systems; my Master's in Interaction Design taught me to ground those systems in evidence. I work best where the problem is ambiguous and no one quite owns it yet.",
      },
    ],
    [
      { text: "Across five years I've shipped consumer apps, B2B platforms, and Web3 products, often as the " },
      { text: "sole or lead designer", bold: true },
      { text: ". I've grown a product from " },
      {
        text: "87 to 1,500 daily active users, cut task times through progressive disclosure, and built design systems",
        bold: true,
      },
      { text: " that outlived my time on the team. I care about structure before pixels, evidence over opinion, and shipping something viable over polishing something theoretical." },
    ],
    [
      { text: "Right now I'm looking for a team in " },
      { text: "the Netherlands", bold: true },
      { text: " building ambitious products where design meaningfully shapes the direction, not just the surface." },
    ],
  ],

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

  /* TIME WIDGET. These values are the no-JS fallback; scripts/clock.js
     overwrites all three from the live Amsterdam clock on load.

     NO `atLabel`. The widget used to read "At 02:18"; 543:1205 has no such word
     — the clock box holds the hands and the digital time and nothing else. */
  clock: {
    time: "02:18",
    statusLead: "I'm",
    status: "probably in deep work",
    detail: "Designing, prototyping, or solving complex product problems.",
  },
};
