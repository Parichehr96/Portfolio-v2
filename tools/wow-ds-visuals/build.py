"""Builds the chosen WOW options (Pari, 2026-10-13) into the site at
Assets/embeds/wow-ds/<slot>.html, from the same b1–b4 sources as the gallery.
Run: python3 build.py  (rewrites the gallery in v/ too).
`PLAIN` options sit on the page as text content (no frame), so their content
starts flush with the text column."""
import os, shutil, gen
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "..", "..", "Assets", "embeds", "wow-ds")
PICK = {
    "cover-c": "hero", "cover-b": "glance", "problem-b": "problem", "research-c": "research",
    "principles-c": "principles", "foundations-a": "foundations", "foundations-c": "foundations-build",
    "icons-c": "icons", "icons-b": "icons-sizes", "components-b": "components", "states-c": "states",
    "anatomy-b": "anatomy", "anatomy-a": "anatomy-layers", "patterns-b": "patterns",
    "notifications-c": "notifications", "themes-a": "themes", "team-c": "team", "revisited-a": "revisited",
}
PLAIN = {
    "foundations-c": ".steps { left: 0; right: 0; }",
    "icons-b": "",
    "anatomy-a": ".lab { left: 0; }",
}
HEIGHTS = {}
_page = gen.page
def page(name, title, desc, h, css, html, js, frame=""):
    _page(name, title, desc, h, css, html, js, frame)
    if name not in PICK: return
    if name in PLAIN: css += "\n  /* set as text: flush with the column */\n  " + PLAIN[name]
    HEIGHTS[PICK[name]] = h
    D = gen.D; gen.D = OUT
    try: _page(PICK[name], title, desc, h, css, html, js, frame)
    finally: gen.D = D
gen.page = page
for f in ("wow.css", "wow.js"): shutil.copy(os.path.join(ROOT, "v", f), os.path.join(OUT, f))
for b in ("b1", "b2", "b3", "b4"):
    exec(open(os.path.join(ROOT, b + ".py")).read(), {"__name__": "__main__"})
print({k: HEIGHTS[k] for k in sorted(HEIGHTS)})
