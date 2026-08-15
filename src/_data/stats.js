/* At-a-glance headline numbers.
 *
 * Deliberately three: the row is a fixed 3-up on desktop and a 3-up on mobile
 * too. Adding a fourth is a layout decision, not a data one — check
 * _stat-card.css before you do it.
 */
module.exports = function () {
  return [
    { label: "Years of experience", value: "5+" },
    { label: "Shipped Products", value: "6" },
    { label: "Side Projects", value: "8" },
  ];
};
