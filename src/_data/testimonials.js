/* Testimonials, verbatim from LinkedIn recommendations.
 *
 * `quote` holds the FULL text; the card clamps it with the `truncate` filter and
 * the `link` carries the reader to the unabridged version. Never pre-truncate
 * here — the data should stay complete and let the view decide how much to show.
 *
 * `avatar` is null where no headshot has been supplied; avatar-less cards fall
 * back to initials.
 */
module.exports = function () {
  return [
    {
      name: "Amir Tavakoli",
      role: "Technical Product Manager | SPM at Heli Technology | Co-founder of Virazh, DevCord, HamfekrSirjan | 10+ years in Digital Product Development",
      avatar: "/Assets/images/Amir_Tavakoli.jpeg",
      link: "https://www.linkedin.com/in/parichehr-talebzadeh/",
      linkLabel: "Full version on Linkedin",
      quote:
        "I've had the pleasure of working with Parichehr across two different organizations: at Tafarda, where I was the Product Manager, and earlier at Rdsysco, where I led the Design and Design Systems team. Throughout both experiences, she consistently stood out as an exceptional designer and colleague. With a solid academic background in Industrial Design, Parichehr brings a rare combination of creative sensibility and systems thinking to her work. She has a remarkable ability to turn complex, often ambiguous problems into intuitive, structured, and aesthetically thoughtful design solutions. Her work consistently impressed both our internal teams and external stakeholders. One of her standout strengths is her meticulous attention to detail and her strong grasp of information architecture. She's highly skilled at extracting structure from complexity and transforming it into clean, user-centered experiences. Her command of design systems is especially strong—not just in execution, but in strategic thinking around consistency, reusability, and scale.",
    },
    {
      name: "Kirsten Oliemans",
      role: "Sales & UX/UI Design at Webpaste",
      avatar: "/Assets/images/Kirsten_Oliemans.jpeg",
      link: "https://www.linkedin.com/in/parichehr-talebzadeh/",
      linkLabel: "Full version on Linkedin",
      quote:
        "It was an absolute pleasure to work with Pari during a 10-week Mobility Design Project. Her design skills and ability to explore and refine ideas were a huge asset to our team. She has a strong eye for translating concepts into thoughtful, user-focused solutions and often helped guide us toward the right design direction when we felt stuck. Beyond her design expertise, Pari played an important role in keeping the team moving forward. She was great at stepping up when decisions needed to be made, helping organize work, and ensuring we stayed on track despite tight deadlines. What stood out most to me was her collaborative approach. Pari is a great listener who genuinely values different perspectives, and when she has a different opinion, she explains it thoughtfully and with clear reasoning. This made discussions productive, balanced, and enjoyable. I'd be really happy to work with her again!",
    },
    {
      name: "Mobina Hosseini",
      role: "Product Designer | UI/UX Designer",
      avatar: null,
      link: "https://www.linkedin.com/in/parichehr-talebzadeh/",
      linkLabel: "Full version on Linkedin",
      quote:
        "I had the pleasure of working with Parichehr for over two years at Connect2Wow, and throughout that time she consistently impressed me with her professionalism, dedication, and problem-solving mindset. As a Product Designer, Parichehr has a great ability to understand both user needs and business goals, turning them into thoughtful and practical design solutions. She is highly responsible, hardworking, and always committed to delivering high-quality work. One of her strongest qualities is her ability to collaborate effectively with everyone involved in the product development process. Whether working with clients, cross-functional teammates, or engineering teams, she communicates clearly, builds trust, and helps move projects forward smoothly. Beyond her technical and design skills, Parichehr is someone you can truly rely on. She takes ownership of her work, approaches challenges with a positive attitude, and is always willing to go the extra mile. I genuinely enjoyed working with Parichehr and would highly recommend her to any team looking for a talented, collaborative, and dependable Product Designer.",
    },
  ];
};
