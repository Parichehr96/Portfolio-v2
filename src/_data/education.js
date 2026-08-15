/* Degrees, newest last to match the timeline's chronology.
 *
 * `field` is the emphasised line, `credential` the smaller one beneath it —
 * the same visual hierarchy the stat cards use, which is why both render
 * through the shared card component.
 */
module.exports = function () {
  return [
    {
      field: "Industrial Design",
      credential: "Bachelor at AUI",
      institution: "Art University of Isfahan",
      years: "2017–2021",
    },
    {
      field: "Interaction Design",
      credential: "Master at HvA",
      institution: "Amsterdam University of Applied Sciences",
      years: "2025–2026",
    },
  ];
};
