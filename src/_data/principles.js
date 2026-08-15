/* "How I Think" — the Not this / This comparison table.
 *
 * NOT in the original structure spec, but this is content, and the spec's rule
 * is that all content lives in _data. It was previously hardcoded as five
 * near-identical markup rows in index.html; here it is five objects rendered by
 * one component (contrast-pair.njk).
 *
 * The numbering (01, 02, …) is derived from array position at render time — do
 * not store it, or reordering silently breaks the sequence.
 */
module.exports = function () {
  return [
    { not: "Adding features to solve problems", this: "Reducing system complexity" },
    { not: "Designing screens", this: "Identifying decision points" },
    { not: "Visual design first", this: "Structure before pixels" },
    { not: "Designing in isolation", this: "Aligning constraints with team early" },
    { not: "Measuring output volume", this: "Evaluating success through clarity" },
  ];
};
