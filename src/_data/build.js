/* Build-time facts, available to templates as `build.*`.
 *
 * `updated` is the V4 footer's "Last updated" stamp (Figma 911:679), in the
 * comp's format: "Dec 27, 2025, 10:33 AM [CET]". It is Amsterdam time, and it
 * is the moment the site was built, so it moves on every deploy by itself.
 */
module.exports = function () {
  const now = new Date();
  const tz = "Europe/Amsterdam";
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, month: "short", day: "numeric", year: "numeric",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true,
  }).format(now);
  // Node's ICU names Amsterdam's zone "GMT+1" / "GMT+2"; the comp writes the
  // abbreviation, so map the offset back to CET / CEST.
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
    .formatToParts(now)
    .find((p) => p.type === "timeZoneName").value;
  const zone = { "GMT+1": "CET", "GMT+2": "CEST" }[offset] || offset;

  return {
    updated: `${date}, ${time} [${zone}]`,
    year: new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric" }).format(now),
  };
};
