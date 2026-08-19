/* Every project, in display order.
 *
 * This array is the single source of truth for BOTH the homepage carousel and
 * the /projects page — the two differ only by the `featured` filter, never by a
 * second hand-maintained list.
 *
 * FIELDS
 *   slug        stable id; also the src/work/<slug>.njk filename when a case
 *               study exists
 *   title       project / client name, used in the "Explore <title>" link
 *   caption     the hook line — a problem statement, not a summary. Used by the
 *               /projects list as its fallback subtitle.
 *   card        { title, body } for the My Work section (Figma 184:13749), on
 *               the three featured case studies only.
 *
 *               DELIBERATELY SEPARATE FROM `caption`. The comp reframes all
 *               three hooks — Challenquiz goes from "A Blank Waiting Screen Was
 *               Reading as a Broken App" to "A multiplayer game that everyone
 *               played alone", which is a different angle on the project, not a
 *               reworded one. Overwriting `caption` would silently change
 *               /projects to match a section it has nothing to do with, so the
 *               two coexist and each page uses the copy written for it.
 *   url         where the card links; null when no case study is written yet
 *   featured    shows in the homepage carousel
 *   status      "live" (case study published) | "soon" (placeholder card)
 *   thumb       card image; null renders the tinted empty Info Section, which is
 *               the current design — thumbnails were deliberately removed
 *   year/role/domain  metadata for the /projects listing
 */
module.exports = function () {
  return [
    {
      slug: "onton",
      card: {
        title: "Every other user was dropping at the same point",
        body:
          "Sole designer on an on-chain event App that made Web3 event check-in feel native; grew it from 87 to 1,500 daily active users.",
      },
      title: "ONTON",
      caption: "Every Other User Was Dropping at the Exact Same Point",
      url: "/work/onton/",
      featured: true,
      status: "live",
      thumb: null,
      year: "2023–2025",
      role: "Sole Product Designer",
      domain: "Web3",
      summary:
        "Web3 consumer product on Telegram. Grew from 87 to 1,500 daily active users over 13 months as the only designer.",
    },
    {
      slug: "challenquiz",
      card: {
      // NOT THE COMP. Figma 184:13768 still holds "Lorem ipsum lajoscocn" —
      // this card's body was never written. Falling back to the `summary`
      // below, which is real approved copy, rather than shipping placeholder
      // text or inventing a sentence. Replace when the real line exists.
        title: "A multiplayer game that everyone played alone",
        body:
          "Quiz game where the matchmaking wait read as a crash. Restructured navigation, profile and in-game states.",
      },
      title: "Challenquiz",
      caption: "A Blank Waiting Screen Was Reading as a Broken App",
      url: "/work/challenquiz/",
      featured: true,
      status: "live",
      thumb: null,
      year: "2023",
      role: "Product Designer",
      domain: "Consumer",
      summary:
        "Quiz game where the matchmaking wait read as a crash. Restructured navigation, profile and in-game states.",
    },
    {
      slug: "ezam",
      card: {
        title: "How an ERP decides what deserves your attention",
        body:
          "Composed a design system for an enterprise ERP for the oil & gas industry, turning tangled, interconnected workflows into clear, role-based screens.",
      },
      title: "Ezam Part",
      caption: "Agents Bore the Cost of Everyone Else's Convenience",
      url: "/work/ezam/",
      featured: true,
      status: "live",
      thumb: null,
      year: "2022–2023",
      role: "Product Designer",
      domain: "Enterprise",
      summary:
        "B2B auto-parts ecosystem: consumer site, agent dashboard and repairman app on one shared design system.",
    },
    {
      slug: "wow-global",
      title: "WOW Global Solution",
      caption: "Case Study Coming Soon",
      url: null,
      featured: true,
      status: "soon",
      thumb: null,
      year: "2021–2022",
      role: "Product Designer",
      domain: "Enterprise",
      summary: "Enterprise ERP for the oil and gas industry.",
    },
    // Designed but not yet written up — listed on /projects, not the carousel.
    {
      slug: "viavia",
      title: "ViaVia",
      caption: "Case Study Coming Soon",
      url: null,
      featured: false,
      status: "soon",
      thumb: null,
      year: "2025",
      role: "Product Designer",
      domain: "Consumer",
      summary: "",
    },
    {
      slug: "mindful-meet",
      title: "Mindful Meet",
      caption: "Case Study Coming Soon",
      url: null,
      featured: false,
      status: "soon",
      thumb: null,
      year: "2025",
      role: "Product Designer",
      domain: "Consumer",
      summary: "",
    },
  ];
};
