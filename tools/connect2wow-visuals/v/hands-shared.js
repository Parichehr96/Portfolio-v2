/* Three hands, one product — the same approval card as three designers might
 * have drawn it without a system, and once with it. Shared by hands-a/b/c.
 * Differences are deliberate and plausible: radius, button colour and shape,
 * label case, avatar shape, weight, spacing. */
(function () {
  var V = [
    { r: 4, pad: 10, bg: "#FFFFFF", bd: "#D0D5DD", font: "Arial, sans-serif", tw: 700, ts: 12, sub: "#667085", av: "4px", avc: "#7A5AF8",
      ok: ["#12B76A", "#fff", "4px", "APPROVE"], no: ["#fff", "#D92D20", "4px", "DECLINE", "#D92D20"], label: "Resource Request" },
    { r: 14, pad: 14, bg: "#F8FAFF", bd: "#E0E7FF", font: "Georgia, serif", tw: 600, ts: 13, sub: "#6B7280", av: "50%", avc: "#E2558E",
      ok: ["#4F46E5", "#fff", "999px", "Approve"], no: ["transparent", "#4F46E5", "999px", "Decline", "transparent"], label: "resource request" },
    { r: 0, pad: 12, bg: "#FFFFFF", bd: "#111827", font: "Courier New, monospace", tw: 700, ts: 11.5, sub: "#4B5563", av: "0", avc: "#0E9384",
      ok: ["#111827", "#fff", "0", "OK"], no: ["#fff", "#111827", "0", "No", "#111827"], label: "Request: Resource" }
  ];
  var SYS = { r: 8, pad: 12, bg: "#FFFFFF", bd: "#E6E9EF", font: "Roboto, sans-serif", tw: 500, ts: 12, sub: "#5B6475", av: "50%", avc: "#7A5AF8",
    ok: ["#3374F5", "#fff", "5px", "Approve"], no: ["transparent", "#1F2430", "5px", "Decline", "#E6E9EF"], label: "Resource request" };

  function card(v) {
    return '<div class="hc" style="border-radius:' + v.r + "px;padding:" + v.pad + "px;background:" + v.bg + ";box-shadow:0 0 0 1px " + v.bd + ";font-family:" + v.font + '">' +
      '<div style="display:flex;gap:9px;align-items:center">' +
      '<span style="width:28px;height:28px;border-radius:' + v.av + ";background:" + v.avc + ';color:#fff;display:grid;place-items:center;font:600 10px/1 Figtree;flex:none">RM</span>' +
      '<div style="min-width:0"><div style="font-weight:' + v.tw + ";font-size:" + v.ts + 'px;color:#1F2430">2 welders · North Pad</div>' +
      '<div style="font-size:10px;color:' + v.sub + '">' + v.label + " · Sep 12–26</div></div></div>" +
      '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px">' +
      '<span style="padding:6px 10px;font-size:10px;border-radius:' + v.no[2] + ";background:" + v.no[0] + ";color:" + v.no[1] + ";box-shadow:inset 0 0 0 1px " + v.no[4] + '">' + v.no[3] + "</span>" +
      '<span style="padding:6px 10px;font-size:10px;border-radius:' + v.ok[2] + ";background:" + v.ok[0] + ";color:" + v.ok[1] + '">' + v.ok[3] + "</span></div></div>";
  }
  window.HANDS = { V: V, SYS: SYS, card: card };
})();
