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
 *   card        { title, body } for the My Work section (Figma 184:13749). Its
 *               presence is what puts a project in that section — see the
 *               `workCards` collection in .eleventy.js. NOT a proxy for "has a
 *               case study": Connect2WOW is row 03 of the comp and its
 *               write-up has not been built yet.
 *
 *               DELIBERATELY SEPARATE FROM `caption`. The comp reframes all
 *               three hooks — Challenquiz goes from "A Blank Waiting Screen Was
 *               Reading as a Broken App" to "A multiplayer game that everyone
 *               played alone", which is a different angle on the project, not a
 *               reworded one. Overwriting `caption` would silently change
 *               /projects to match a section it has nothing to do with, so the
 *               two coexist and each page uses the copy written for it.
 *   url         where the card links. May name a page that has not been built
 *               yet — see Connect2WOW below. null omits the My Work row's Read
 *               more button entirely, which is the right render only when there
 *               is no intended destination at all, not merely no page yet.
 *   motion      { webm, mp4, poster, loop, w, h } for the animated thumbnail, or
 *               null when the encodes are not on disk. Built by motionFor()
 *               below, never hand-written. `loop` is false where the source
 *               animation does not return to its first frame.
 *   featured    shows in the homepage carousel
 *   status      "live" (case study published) | "soon" (placeholder card)
 *   thumb       card image; null renders the tinted empty Info Section, which is
 *               the current design — thumbnails were deliberately removed
 *   year/role/domain  metadata for the /projects listing
 */
const fs = require("fs");
const path = require("path");

/* Motion thumbnails — the Figma Motion loops in file B8Kfu0nGgUIG0REVlQTD5C.
 *
 * GATED ON THE FILES ACTUALLY BEING ON DISK. The exports come through a Figma
 * MCP quota that is not always available, so the section has to build both
 * ways: with the encodes present each row plays its loop, without them each row
 * falls back to the static poster and nothing 404s. Drop the files into
 * Assets/videos/work/, rebuild, and the video appears — no data or template
 * edit, which is what keeps this from being a half-landed feature in the repo.
 *
 * The dimensions are the ENCODE size, not the Figma node's native size: each
 * loop is rendered to 1.5x the card box height (476 -> 714) and keeps its full
 * native width so `object-fit: cover` still does the comp's crop rather than
 * having it baked in. Same reasoning as the stills — see
 * Assets/images/work/README.md.
 */
const MOTION = {
  // ONTON LOOPS BY REQUEST, AND THE SOURCE STILL DOES NOT WRAP CLEANLY. Its
  // keyframes end where they did not begin — the phone finishes upright, scaled
  // 1.15 and scrolled 462px on, with the star faded out — so the clip snaps back
  // every 6.85s. Measured on the encode itself: the last->first wrap moves 38.87
  // mean abs pixel value against 4.34 for an ordinary adjacent-frame step, i.e.
  // 9x. It held its final frame for exactly that reason until this was flipped.
  //
  // THE FIX IS IN FIGMA, NOT HERE. Add closing keyframes to 417:66339 so the
  // animation returns to its opening state, re-export, and the snap goes away
  // with no code change — this flag is already true and the template already
  // emits `loop`.
  onton: { node: "417:66339", w: 1104, h: 714, durationMs: 6832, loop: true },
  challenquiz: { node: "314:54396", w: 1038, h: 714, durationMs: 19997, loop: true },
  connect2wow: { node: "432:11086", w: 1190, h: 714, durationMs: 6000, loop: true },
};

// Repo-root Assets/, not src/Assets — see the note in .eleventy.js on why the
// folder keeps its capital A at the root.
const ROOT = path.join(__dirname, "..", "..");

function motionFor(slug) {
  const spec = MOTION[slug];
  if (!spec) return null;

  const webm = "/Assets/videos/work/" + slug + "-card.webm";
  const mp4 = "/Assets/videos/work/" + slug + "-card.mp4";
  const onDisk = (url) => fs.existsSync(path.join(ROOT, url));

  const has = { webm: onDisk(webm), mp4: onDisk(mp4) };
  if (!has.webm && !has.mp4) return null;

  return {
    webm: has.webm ? webm : null,
    mp4: has.mp4 ? mp4 : null,
    poster: "/Assets/images/work/" + slug + "-card.jpg",
    loop: spec.loop,
    w: spec.w,
    h: spec.h,
  };
}

module.exports = function () {
  return [
    {
      slug: "onton",
      card: {
        title: "Every other user was dropping at the same point",
        body:
          "Sole designer on an on-chain event App that made Web3 event check-in feel native; grew it from 87 to 1,500 daily active users.",
      },
      motion: motionFor("onton"),
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
      motion: motionFor("challenquiz"),
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
      slug: "connect2wow",
      card: {
        // ROW 03 OF THE COMP, AND IT WAS FILED UNDER `ezam` UNTIL NOW. Figma
        // 184:13779 reads "an enterprise ERP for the oil & gas industry",
        // which is this project's `summary` verbatim — Ezam Part is the B2B
        // auto-parts ecosystem and has never been an ERP. The copy was always
        // this project's; only the entry it hung off was wrong.
        title: "How an ERP decides what deserves your attention",
        body:
          "Composed a design system for an enterprise ERP for the oil & gas industry, turning tangled, interconnected workflows into clear, role-based screens.",
      },
      motion: motionFor("connect2wow"),
      // Renamed from "WOW Global Solution". The slug moved with it — nothing
      // was pinned to the old one (no case-study page, no /projects URL, and
      // the thumbnail assets had not been exported yet), so this was the last
      // moment it could be renamed without leaving a stale filename behind.
      title: "Connect2WOW",
      caption: "Case Study Coming Soon",
      // RESOLVES NOW. This 404'd for a long time on purpose — the case studies
      // are their own epic and none had been rebuilt in the new design, and an
      // unbuilt path was preferable to a placeholder page that would enter the
      // sitemap looking finished. src/work/connect2wow.njk exists as of the
      // new-design rebuild, so the link lands.
      url: "/work/connect2wow/",
      featured: true,
      status: "live",
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
