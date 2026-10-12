/* WOW design system — component kit (HTML builders) for the visual options.
 * Loads after case.js, which provides I(), sleep(), whenSeen(), fitCanvas()
 * and C2W.system (the library's real groups and variant counts). */
(function () {
  var W = window.W = {};
  W.btn = function (label, p, st, icon) { return '<span class="w-btn p-' + (p || "primary") + (st ? " s-" + st : "") + '">' + (icon ? I(icon, 15) : "") + (label || "") + "</span>"; };
  W.field = function (label, val, st, help, icon) {
    return '<div class="w-field' + (st ? " s-" + st : "") + '"><label>' + label + '</label><div class="box">' + (icon ? I(icon, 14) : "") + '<span class="v">' + val + "</span>" +
      (st === "error" ? '<span style="margin-left:auto;color:var(--w-red)">' + I("hugeicons:alert-02", 14) + "</span>" : "") + '</div><span class="help">' + (help || "") + "</span></div>";
  };
  W.pill = function (t, c) { return '<span class="w-pill ' + (c || "blue") + '">' + t + "</span>"; };
  W.chip = function (t, on) { return '<span class="w-chip' + (on ? " on" : "") + '">' + t + "</span>"; };
  W.av = function (i, c, s) { s = s || 28; return '<span class="w-av" style="width:' + s + "px;height:" + s + "px;font-size:" + s * .36 + "px;background:" + c + '">' + i + "</span>"; };
  W.who = function (i, c, name, sub) { return '<div class="w-who">' + W.av(i, c) + "<div><b>" + name + "</b><small>" + sub + "</small></div></div>"; };
  W.req = function (p) {
    return '<div class="w-card w-req">' + W.who("RM", "#7A5AF8", "2 welders · North Pad", "Requested by Ryan Mitchell · Sep 25–27") +
      '<div style="display:flex;gap:6px">' + W.pill("Awaiting approval", "orange") + W.pill("Engineering", "blue") + "</div>" +
      '<div style="display:flex;gap:6px"><span class="w-btn p-outline sm" style="flex:1">Decline</span><span class="w-btn p-' + (p || "primary") + ' sm" style="flex:1">Approve</span></div></div>';
  };
  W.toast = function (t) { return '<span class="w-toast"><i></i>' + (t || "Saved successfully") + "</span>"; };
  W.banner = function (t, k) { return '<div class="w-banner ' + (k || "warn") + '">' + I("hugeicons:alert-02", 15) + (t || "Scheduled maintenance tonight, 22:00") + "</div>"; };
  W.modal = function () { return '<div class="w-modal"><h4>Delete this record?</h4><p>This can’t be undone.</p><div style="display:flex;gap:6px;justify-content:flex-end">' + W.btn("Cancel", "outline", "", "") + W.btn("Delete", "danger") + "</div></div>"; };
  W.tabs = function () { return '<div class="w-tabs"><span class="on">Overview</span><span>Payroll</span><span>Documents</span><span>Certificates</span></div>'; };
  W.table = function () {
    return '<table class="w-table"><tr><th>Name</th><th>Site</th><th>Status</th></tr>' +
      [["Mark Rushmore", "North Pad", W.pill("Active")], ["Aiden Kowalski", "North Pad", W.pill("Contractor", "purple")], ["Tom Becker", "Camp 3", W.pill("Review", "orange")]].map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>"; }).join("") + "</table>";
  };
  W.icons = function () { return Object.keys(window.ICONS || {}); };

  /* Tokens shown in the foundations visuals — the revisited set. */
  W.TOKENS = {
    primitives: [["blue/700", "#1D4ED8"], ["blue/600", "#2563EB"], ["blue/300", "#93B4F5"], ["blue/100", "#E6EEFC"], ["grey/900", "#1D2433"], ["grey/500", "#6B7280"], ["grey/200", "#E5E7EB"], ["grey/100", "#F3F4F6"], ["red/700", "#C81E1E"], ["green/700", "#15803D"]],
    semantic: [["action/primary", "blue/600"], ["action/primary-hover", "blue/700"], ["surface/selected", "blue/100"], ["text/primary", "grey/900"], ["text/secondary", "grey/500"], ["border/default", "grey/200"], ["surface/subtle", "grey/100"], ["status/error", "red/700"], ["status/success", "green/700"]],
    component: [["button/primary/bg", "action/primary"], ["button/primary/bg-hover", "action/primary-hover"], ["nav-item/selected/bg", "surface/selected"], ["field/border", "border/default"], ["field/label", "text/secondary"], ["pill/error/fg", "status/error"]]
  };
  /* The four systems from the research, with what WOW took from each. */
  W.RESEARCH = [
    { name: "Carbon", c: "#161616", comp: "Inline, toast, actionable, callout", sev: "Info · success · warning · error", def: "Toasts persist; can auto-dismiss at 5 s", took: "One status vocabulary across every variant; the 5-second toast and an error that never dismisses itself" },
    { name: "Material", c: "#1A73E8", comp: "Snackbar, banner, badge, dialog", sev: "Minimal; snackbars are neutral", def: "Snackbar auto-dismisses; banner persists", took: "Brevity, as a caution: too thin on severity for an ERP, where an error must never look like a confirmation" },
    { name: "Polaris", c: "#008060", comp: "Banner, toast, badge, inline", sev: "Info · success · warning · critical", def: "Toast auto-dismisses; banner persists", took: "Severity as structure, not decoration; its critical tone shaped the high-attention alert" },
    { name: "Atlassian", c: "#0052CC", comp: "Flag, banner, section and inline message", sev: "Info · warning · error · success · discovery", def: "Flags transient or persistent; banner system-wide", took: "Splitting alerts by source and scope, which became one of WOW's four axes" }
  ];
})();
