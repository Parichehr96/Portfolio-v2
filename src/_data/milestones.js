/* Career timeline, 2017 → 2026, oldest first.
 *
 * The About section pins a sticky viewport and maps scroll progress onto this
 * array, so ORDER IS CHRONOLOGY and the array length drives the scroll runway
 * height (`--tl-count`). Adding an entry lengthens the runway automatically —
 * that number must never be hardcoded in a template again.
 *
 * `year` is the label on the rail, not necessarily a start date; `image` is the
 * 301×301 panel visual.
 */
module.exports = function () {
  return [
    {
      year: "2017",
      location: "Isfahan, Iran",
      title: "Bachelor's in Industrial Design",
      body: "Art University of Isfahan. A foundation in creative sensibility and systems thinking — learning to break big problems into designable parts.",
      image: "/Assets/images/timeline/2017-2021.png",
      alt: "Bachelor's in Industrial Design, Isfahan, 2017",
    },
    {
      year: "2021",
      location: "Remote, Canada",
      title: "Enterprise ERP for oil and gas industry",
      body: "One of the most challenging products I've worked on. Understanding interconnected systems, stakeholder needs, and product complexity wasn't optional — it was essential. Often the only designer in the room, working closely with product managers and engineers.",
      image: "/Assets/images/timeline/2021-2022.png",
      alt: "Enterprise ERP for oil and gas, Canada remote, 2021",
    },
    {
      year: "2022",
      location: "Tehran",
      title: "B2B ecosystem for auto parts",
      body: "Designed a connected three-product system — consumer site, agent dashboard, repairman app — with a shared design system. Learned to hold multiple audiences and platforms in mind simultaneously.",
      image: "/Assets/images/timeline/2022-2023.png",
      alt: "B2B ecosystem for auto parts, Tehran, 2022",
    },
    {
      year: "2023",
      location: "Remote, Finland",
      title: "Web3 consumer products on Telegram",
      body: "Sole designer on ONTON for 13 months. Grew the product from 87 to 1,500 daily active users. I naturally notice broken handoffs, conflicting requirements, and gaps between what a product promises and what users actually experience.",
      image: "/Assets/images/timeline/2023-2025.png",
      alt: "Web3 consumer products on Telegram, Finland remote, 2023",
    },
    {
      year: "2025",
      location: "Amsterdam",
      title: "Master's in Interaction Design",
      body: "Amsterdam University of Applied Sciences. Deepened my understanding of human-centered design, emerging technologies, and interactive systems. Whether designing a consumer app or an enterprise platform, I enjoy untangling complexity until it feels effortless.",
      image: "/Assets/images/timeline/2025-2026.png",
      alt: "Master's in Interaction Design, Amsterdam, 2025",
    },
    {
      year: "2026",
      location: "Amsterdam",
      title: "Looking for a team",
      body: "I'm looking for a team building ambitious products where design has a meaningful influence on product decisions, not just interfaces.",
      image: "/Assets/images/timeline/2026-.png",
      alt: "Looking for a team, Amsterdam, 2026",
    },
  ];
};
