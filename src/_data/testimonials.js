/* Testimonials, verbatim from LinkedIn recommendations.
 *
 * `quote` holds the FULL text; the card clamps it with the `truncate` filter and
 * the `link` carries the reader to the unabridged version. Never pre-truncate
 * here — the data should stay complete and let the view decide how much to show.
 *
 * `avatar` is null where no headshot has been supplied; avatar-less cards fall
 * back to initials.
 *
 * THREE DISPLAY FIELDS SIT ALONGSIDE THE ARCHIVE FIELDS, and the split is the
 * point. Figma 673:1638 draws a 480 x 327 card whose quote is exactly three
 * lines at 14/20 and whose role is one line at 16/24 — neither the full
 * recommendation nor Amir's four-clause title fits that. Rather than truncate
 * the record, the node's own wording lives here as its own field:
 *
 *   short      the 3-line pull quote, verbatim from the node's text layers
 *   roleShort  the one-line title the node prints under the name
 *   initials   derived below; what the card shows when `avatar` is null
 *
 * `quote` and `role` are untouched and still complete. Swapping a testimonial to
 * a real headshot is a ONE-LINE change: set `avatar` to the file path.
 */
module.exports = function () {
  const people = [
    {
      name: "Amir Tavakoli",
      role: "Technical Product Manager | SPM at Heli Technology | Co-founder of Virazh, DevCord, HamfekrSirjan | 10+ years in Digital Product Development",
      roleShort: "Technical Product Manager",
      short:
        "Parichehr turns complex, ambiguous problems into clean, user-centered experiences, and her command of design systems consistently raised the quality of every project.",
      avatar: "/Assets/images/Amir_Tavakoli.jpeg",
      link: "https://www.linkedin.com/in/parichehr-talebzadeh/details/recommendations/?detailScreenTabIndex=0",
      linkLabel: "Full version on Linkedin",
      quote:
        "I've had the pleasure of working with Parichehr across two different organizations: at Tafarda, where I was the Product Manager, and earlier at Rdsysco, where I led the Design and Design Systems team. Throughout both experiences, she consistently stood out as an exceptional designer and colleague. With a solid academic background in Industrial Design, Parichehr brings a rare combination of creative sensibility and systems thinking to her work. She has a remarkable ability to turn complex, often ambiguous problems into intuitive, structured, and aesthetically thoughtful design solutions. Her work consistently impressed both our internal teams and external stakeholders. One of her standout strengths is her meticulous attention to detail and her strong grasp of information architecture. She's highly skilled at extracting structure from complexity and transforming it into clean, user-centered experiences. Her command of design systems is especially strong—not just in execution, but in strategic thinking around consistency, reusability, and scale.",
    },
    {
      name: "Kirsten Oliemans",
      role: "Sales & UX/UI Design at Webpaste",
      roleShort: "Sales & UX/UI Design at Webpaste",
      short:
        "Pari guided our team to the right design direction, kept us on track under tight deadlines, and made every discussion productive with her thoughtful, collaborative approach.",
      avatar: "/Assets/images/Kirsten_Oliemans.jpeg",
      link: "https://www.linkedin.com/in/parichehr-talebzadeh/details/recommendations/?detailScreenTabIndex=0",
      linkLabel: "Full version on Linkedin",
      quote:
        "It was an absolute pleasure to work with Pari during a 10-week Mobility Design Project. Her design skills and ability to explore and refine ideas were a huge asset to our team. She has a strong eye for translating concepts into thoughtful, user-focused solutions and often helped guide us toward the right design direction when we felt stuck. Beyond her design expertise, Pari played an important role in keeping the team moving forward. She was great at stepping up when decisions needed to be made, helping organize work, and ensuring we stayed on track despite tight deadlines. What stood out most to me was her collaborative approach. Pari is a great listener who genuinely values different perspectives, and when she has a different opinion, she explains it thoughtfully and with clear reasoning. This made discussions productive, balanced, and enjoyable. I'd be really happy to work with her again!",
    },
    {
      name: "Mobina Hosseini",
      role: "Product Designer | UI/UX Designer",
      roleShort: "Product Designer | UI/UX Designer",
      short:
        "Pari consistently turned user needs and business goals into effective designs, collaborating well with clients, teammates, and engineers. A talented, reliable designer.",
      avatar: "/Assets/images/testimonials/mobina.jpg",
      link: "https://www.linkedin.com/in/parichehr-talebzadeh/details/recommendations/?detailScreenTabIndex=0",
      linkLabel: "Full version on Linkedin",
      quote:
        "I had the pleasure of working with Parichehr for over two years at Connect2Wow, and throughout that time she consistently impressed me with her professionalism, dedication, and problem-solving mindset. As a Product Designer, Parichehr has a great ability to understand both user needs and business goals, turning them into thoughtful and practical design solutions. She is highly responsible, hardworking, and always committed to delivering high-quality work. One of her strongest qualities is her ability to collaborate effectively with everyone involved in the product development process. Whether working with clients, cross-functional teammates, or engineering teams, she communicates clearly, builds trust, and helps move projects forward smoothly. Beyond her technical and design skills, Parichehr is someone you can truly rely on. She takes ownership of her work, approaches challenges with a positive attitude, and is always willing to go the extra mile. I genuinely enjoyed working with Parichehr and would highly recommend her to any team looking for a talented, collaborative, and dependable Product Designer.",
    },
  ];

  /* DERIVED, NOT AUTHORED. The fallback badge is the person's own initials, so
     it can never drift from `name` the way a hand-typed field would. Two letters
     max: "Mobina Hosseini" -> "MH". */
  return people.map((p) => ({
    ...p,
    initials: p.name
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));
};
