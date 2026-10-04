"""Generate Assets/embeds/onton/hero-animation.html from the Figma frame exports.

The exports outline every string, so a "typed" sentence is built by splitting
its compound path into one path per glyph (subpaths grouped by x-overlap, which
keeps counters and i-dots with their letter) and recording a typing step per
glyph, per word gap and per line break.
"""
import base64, copy, json, os, re, subprocess, sys, tempfile
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Everything is relative to this folder: the frame exports in sources/, the
# template next to this file, and the page written into the repo's Assets/.
S = os.path.dirname(os.path.abspath(__file__))
DL = S + "/sources/downloads/ONTON_animation_%s.svg"        # the first exports (frames 01-10)
ROOT = os.path.dirname(os.path.dirname(S))
NUM = re.compile(r"-?\d*\.?\d+(?:e-?\d+)?")


def frame(n):
    return open(DL % n).read()


def raw_paths(src):
    """Every <path …/> element, verbatim, in document order."""
    return re.findall(r"<path [^>]*/>", src)


def subpaths(d):
    out = []
    for sp in re.findall(r"M[^M]+", d):
        xs, ys = [], []
        for cmd, args in re.findall(r"([MLCQHVZ])([^MLCQHVZ]*)", sp):
            a = [float(n) for n in NUM.findall(args)]
            if cmd == "H": xs += a
            elif cmd == "V": ys += a
            else: xs += a[0::2]; ys += a[1::2]
        out.append(dict(d=sp.strip(), x0=min(xs), x1=max(xs), y0=min(ys)))
    return out


def typed(lines, cls, caret_y, space):
    """lines: per line, its subpaths → (glyph markup, steps, start x). `space` is
    the gap, in SVG units, above which two glyphs have a word space between."""
    paths, steps, gi = [], [], 0
    for li, items in enumerate(lines):
        items = sorted(items, key=lambda i: i["x0"])
        glyphs = []
        for it in items:
            g = glyphs[-1] if glyphs else None
            if g and it["x0"] < g["x1"] - 0.3 and it["fill"] == g["fill"]:
                g["d"].append(it["d"]); g["x1"] = max(g["x1"], it["x1"])
            else:
                glyphs.append(dict(d=[it["d"]], fill=it["fill"], x0=it["x0"], x1=it["x1"]))
        if li > 0:
            steps.append([None, round(glyphs[0]["x0"] - 2, 1), li])
        for k, g in enumerate(glyphs):
            if k and g["x0"] - glyphs[k - 1]["x1"] > space:
                steps.append([None, round(g["x0"] - 2, 1), li])
            paths.append('<path class="%s" d="%s" fill="%s"/>' % (cls, " ".join(g["d"]), g["fill"]))
            steps.append([gi, round(g["x1"] + 1.5, 1), li]); gi += 1
        if li == 0:
            start = round(glyphs[0]["x0"] - 2, 1)
    return paths, dict(steps=steps, lineY=caret_y), start


def elements(src):
    """Top-level drawables of a frame (masks and groups whole), defs dropped."""
    body = src[src.index(">") + 1:src.index("<defs>")] if "<defs>" in src else src[src.index(">") + 1:src.rindex("</svg>")]
    return re.findall(r"<mask\b.*?</mask>|<g\b[^>]*>.*?</g>|<[a-z]+\b[^>]*/>", body, re.S)


from figmalib import FigmaFrame, shrink, SVG_NS, XL_NS  # noqa: E402


def def_of(src, ident):
    """One <defs> child of a frame, by id (gradients, clips, filters)."""
    return re.search(r'<(linearGradient|clipPath|filter) id="%s".*?</\1>' % ident, src, re.S).group(0)


def d_of(el):
    return re.search(r' d="([^"]+)"', el).group(1)


def items_of(d, fill):
    return [dict(it, fill=fill) for it in subpaths(d)]


# ---- 01: the question (black + one blue word, two lines) -------------------
f1 = re.findall(r'<path d="([^"]+)" fill="([^"]+)"', frame("01"))
q_items = [i for d, f in f1 for i in items_of(d, f)]
q_paths, q_seq, q_start = typed(
    [[i for i in q_items if i["y0"] < 205], [i for i in q_items if i["y0"] >= 205]],
    "g", [[174, 197], [211, 234]], space=4)

# ---- 02: idle card + the caption under it ----------------------------------
f2 = raw_paths(frame("02"))
idle = f2[:4]                                   # Upload media, Click to browse, icon ×2
cap_d = re.search(r'd="([^"]+)"', f2[4]).group(1)
c_paths, c_seq, c_start = typed([items_of(cap_d, "#13212F")], "c", [[348, 367]], space=3)

# ---- 03: uploading state. "25%" is dropped for a live counter --------------
f3 = raw_paths(frame("03"))
busy = f3[:2]                                   # Uploading …, Event_poster.jpg

# ---- 04: event card (poster + progress highlight), name field, caption -------
f4 = elements(frame("04"))
poster_b64 = base64.b64encode(open(S + "/poster.jpg", "rb").read()).decode()  # 180px: 3x the 60 box
poster_border = f4[3]
field = f4[4:9]                                 # box fill, box stroke, "Name", placeholder, clear icon
field[3] = field[3].replace("<path ", '<path id="ph" ', 1)
n_paths, n_seq, n_start = typed([items_of(d_of(f4[9]), "#13212F")], "n", [[348, 365]], space=3)

# ---- 05: the name, typed into the field ------------------------------------
f5 = elements(frame("05"))
v_paths, v_seq, v_start = typed([items_of(d_of(f5[7]), "#13212F")], "v", [[199, 218]], space=3)

# ---- 06: the name in the card, start/end date + time, caption ---------------
f6 = elements(frame("06"))
title = f6[4].replace("<path ", '<path id="title" ', 1)
masks = [e for e in f6[5:36] if e.startswith("<mask")]
start_row = [e for e in f6[5:20] if not e.startswith("<mask")]
end_row = [e for e in f6[20:36] if not e.startswith("<mask")]   # the dashed rail rides with END
# Each row splits into its chrome (boxes, labels, icons — these fade) and the
# values that travel into the card's date line. START's clock icon is grouped
# on its own: it is "tapped" to open the wheel.
S_DATE, S_TIME, E_DATE, E_TIME = start_row[5], start_row[11], end_row[5], end_row[11]
start_chrome = [e for e in start_row[:-2] if e not in (S_DATE, S_TIME)] + \
    ['<g id="clock">%s</g>' % "".join(start_row[-2:])]
end_chrome = [e for e in end_row if e not in (E_TIME,)]          # END's date folds with the chrome
start_row = ['<g class="dt-chrome">%s</g>' % "".join(start_chrome),
             '<g id="sdate" class="dtv">%s</g>' % S_DATE,
             '<g id="stime-old">%s</g>' % S_TIME]
end_row = ['<g class="dt-chrome">%s</g>' % "".join(end_chrome),
           '<g id="etime" class="dtv">%s</g>' % E_TIME]


def bbox(d):
    xs, ys = [], []
    for cmd, args in re.findall(r"([MLCQHVZ])([^MLCQHVZ]*)", d):
        a = [float(n) for n in NUM.findall(args)]
        if cmd == "H": xs += a
        elif cmd == "V": ys += a
        else: xs += a[0::2]; ys += a[1::2]
    return min(xs), min(ys), max(xs), max(ys)
d_paths, d_seq, d_start = typed([items_of(d_of(f6[36]), "#13212F")], "d", [[348, 367]], space=3)

# ---- 07: the date/time wheel ----------------------------------------------
# NOT elements(): the wheel sits in a clip group with a nested group, which the
# flat element regex splits. Indices below are into that flat list, and the
# clip group is rebuilt in the template around the rows instead.
src7 = frame("07")
f7 = elements(src7)
# Only the date column stays outlined. Hour, minute and AM/PM are live text in
# the template so they can spin to the chosen time, which the export can't do.
date_col = f7[38:45]
picker_fades = f7[61:63]
current_time = f7[63]
picker_defs = [def_of(src7, "paint0_linear_1280_21459"), def_of(src7, "paint1_linear_1280_21459"),
               def_of(src7, "clip1_1280_21459")]

# ---- 08: date line in the card, location field, caption ---------------------
f8 = elements(frame("08"))
when = f8[5:7]                                   # clock icon, "29 Nov · 21:00 – 00:00"
# Where each field value lands on that line: its glyphs clustered into runs
# ("29", "Nov", "·", "21:00", "–", "00:00"), each value centred on its run(s)
# and scaled by the cap-height ratio of line to field (7.9 / 10.2).
_runs = []
for it in sorted(subpaths(d_of(f8[6])), key=lambda i: i["x0"]):
    if _runs and it["x0"] - _runs[-1][2] < 2.2:
        _runs[-1][2] = max(_runs[-1][2], it["x1"])
    else:
        _runs.append([it["x0"], 0, it["x1"]])
_wy0, _wy1 = bbox(d_of(f8[6]))[1::2]
def _target(i, j):
    return ((_runs[i][0] + _runs[j][2]) / 2, (_wy0 + _wy1) / 2)
def _src(el):
    x0, y0, x1, y1 = bbox(d_of(el)); return ((x0 + x1) / 2, (y0 + y1) / 2)
_k = (_wy1 - _wy0) / 10.2
DT_FLY = {
    "sdate": [*_src(S_DATE), *_target(0, 1), _k],
    "stime": [*_src(S_TIME), *_target(3, 3), _k],     # the live "9:00 PM" sits on 7:30 PM's box
    "etime": [*_src(E_TIME), *_target(5, 5), _k],
}
assert len(_runs) == 6, _runs
loc = f8[7:14]                                   # box fill, box stroke, label, placeholder, pin ×3
loc[1] = loc[1].replace("<rect ", '<rect id="loc-stroke" ', 1)
loc[3] = loc[3].replace("<path ", '<path id="loc-ph" ', 1)
l_paths, l_seq, l_start = typed([items_of(d_of(f8[14]), "#13212F")], "l", [[348, 367]], space=3)

# ---- 09: the field focused. Its suggestions menu is rebuilt in the template as
# a live venue search, so only the menu's shadow is taken from the export.
src9 = frame("09")
dropdown_defs = [def_of(src9, "filter0_dd_1280_21685")]

# ---- 10: the location in the card, last caption -----------------------------
# The location is only outlined at the card's size. It is TYPED in the field
# with that same outline scaled up (the transform lives in the template), and
# flies back to scale 1 to land in the card.
f10 = elements(frame("10"))
where_icon = f10[7]
# The card's pin, reused as each search result's icon.
pin_symbol = '<symbol id="pin" viewBox="227.2 88 9.6 11">%s</symbol>' % re.sub(r"^<g[^>]*>|</g>$", "", where_icon.strip())
where_text = f10[8].replace("<path ", '<path id="where-text" ', 1)
w_paths, w_seq, w_start = typed([items_of(d_of(f10[8]), "#13212F")], "w", [[87.5, 99.5]], space=2.5)
r_paths, r_seq, r_start = typed([items_of(d_of(f10[9]), "#13212F")], "r", [[348, 367]], space=3)

# ---- 11 / 12: pulled straight from Figma (section 1290:23685) -------------
# 10 is no longer drawn from an export: it is the card composed above, centred.
FIG = S + "/sources/figma/"
f11 = FigmaFrame(S + "/sources/figma/n11.svg", "ONTON_animation_11", "f11-")
# 10 → 11 pairs each part of the small card with its counterpart here, so
# these get ids of ours.
_c11 = copy.deepcopy(f11.layer("Event Item Container"))
_c11.set("id", "card11")
C11_PARTS = {"Left Table Row Item": "c11-thumb", "Event Name": "c11-title",
             "Event Date": "c11-when", "Event Location": "c11-where", "Event Status Container": "c11-badge"}
for name, new in C11_PARTS.items():
    _c11.find(".//*[@id='%s']" % name).set("id", new)
card11 = f11._out(_c11, keep=("card11",) + tuple(C11_PARTS.values()))
card11 = re.sub(r'<rect (x="70" y="[\d.]+")', r'<rect id="card11-bg" \1', card11, count=1)
assert 'id="card11-bg"' in card11
toast = f11.svg(f11.layer("Frame 2131328644"))

f12 = FigmaFrame(FIG + "f12.svg", "ONTON_animation_12", "f12-")
phone_root = copy.deepcopy(f12.frame)
clip_g = phone_root[0]                           # <g clip-path=frame>: white bg + phone
clip_g.remove(clip_g[0])                         # the frame's own white rect — ours is behind
item = phone_root.find(".//*[@id='Event Item Container']")
item.set("id", "phone-item")
phone = f12._out(clip_g, keep=("phone-item",))
fig_defs = f11.defs_svg() + "\n" + f12.defs_svg()

# ---- THE LIST (Figma 1316:24717) -----------------------------------------
# The narration captions are gone. Upload, Name, Start/End and Location sit in
# one list at 0 / 92 / 174 / 334 (window 124,143.05 · 372 x 240) that scrolls
# each one to the top in turn. Upload and Name got wider (372), so they come
# from the new frames; Start/End and Location only moved, and reuse the pieces
# above (checked path-for-path against the new frames: +3.05 and -24.95 when
# each is at the top).
N2 = S + "/sources/figma/"
n02 = FigmaFrame(N2 + "n02.svg", "ONTON_animation_02", "n02-")
n03 = FigmaFrame(N2 + "n03.svg", "ONTON_animation_03", "n03-")
n04 = FigmaFrame(N2 + "n04.svg", "ONTON_animation_04", "n04-")
n05 = FigmaFrame(N2 + "n05.svg", "ONTON_animation_05", "n05-")
up_idle = n02.layer("Frame 2131328439")
idle = "".join(n02.svg(ch) for ch in up_idle if ch.tag != "{%s}rect" % SVG_NS)
up_busy = n03.layer("Frame 2131328439")
busy = n03.svg(up_busy.find("{%s}g" % SVG_NS))        # "Uploading …" + the file name
list_fade = n02.svg(n02.layer("Frame 2131328697"))
# Name: at the top when the list is scrolled 92, so these coordinates are
# already the on-screen ones for the step that uses them.
name_el = copy.deepcopy(n04.layer("Container"))
name_el.find(".//*[@id='Placeholder']").set("id", "ph")
field = n04._out(name_el, keep=("ph",))
v_el = n05.layer("Container").find(".//*[@id='Placeholder']")
v_items = items_of(v_el.get("d"), v_el.get("fill"))
vx0, vy0, vx1, vy1 = bbox(v_el.get("d"))
v_paths, v_seq, v_start = typed([v_items], "v", [[vy0 - 3, vy1 + 3]], space=3)
tx0, ty0, tx1, ty1 = bbox(d_of(f6[4]))            # the card's title
val_fly = "translate(%.2fpx,%.2fpx) scale(%.4f) translate(%.2fpx,%.2fpx)" % (
    tx0, ty0, (tx1 - tx0) / (vx1 - vx0), -vx0, -vy0)
fig_defs += "\n" + "\n".join(f.defs_svg() for f in (n02, n03, n04))
LIST = dict(dt_dy=174 + 3.0498, dt_net=3.0498, loc_dy=334 - 24.949, loc_net=-24.949)

tpl = open(S + "/template.html").read()
J = "\n        ".join
for k, v in {
    "%%Q_GLYPHS%%": J(q_paths), "%%Q_START%%": str(q_start),
    "%%IDLE%%": idle, "%%BUSY%%": busy, "%%LIST_FADE%%": list_fade,
    "%%POSTER%%": poster_b64, "%%POSTER_BORDER%%": poster_border,
    "%%FIELD%%": field, "%%VAL_FLY%%": val_fly,
    "%%V_GLYPHS%%": J(v_paths), "%%V_START%%": str(v_start),
    "%%TITLE%%": title, "%%MASKS%%": J(masks),
    "%%START_ROW%%": J(start_row), "%%END_ROW%%": J(end_row),
    "%%DEFS7_9%%": J(picker_defs + dropdown_defs),
    "%%DATE_COL%%": '<g class="col">%s</g>' % "".join(date_col), "%%PIN%%": pin_symbol,
    "%%PICKER_FADES%%": J(picker_fades), "%%CURRENT_TIME%%": current_time,
    "%%WHEN%%": J(when), "%%LOC%%": J(loc),
    "%%W_GLYPHS%%": J(w_paths), "%%W_START%%": str(w_start),
    "%%WHERE%%": J([where_icon, where_text]),
    "%%CARD11%%": card11, "%%TOAST%%": toast, "%%PHONE%%": phone, "%%FIG_DEFS%%": fig_defs,
    # targets are absolute; the values sit in the list, which at that step is
    # offset dt_net from where these pieces were drawn
    "%%DT_FLY%%": json.dumps({k: [round(v, 2) for v in vs[:3]] + [round(vs[3] - LIST["dt_net"], 2), round(vs[4], 4)]
                              for k, vs in DT_FLY.items()}),
    "%%DT_DY%%": "%.4f" % LIST["dt_dy"], "%%LOC_DY%%": "%.4f" % LIST["loc_dy"],
    "%%SEQ%%": json.dumps(dict(q=q_seq, c=c_seq, n=n_seq, v=v_seq, d=d_seq,
                               w=w_seq)),
}.items():
    assert k in tpl, k
    tpl = tpl.replace(k, v)
open(ROOT + "/Assets/embeds/onton/hero-animation.html", "w").write(tpl)
for k, s in dict(q=q_seq, v=v_seq, w=w_seq).items():
    print(k, len(s["steps"]), "steps,", sum(1 for st in s["steps"] if st[0] is None), "spaces/breaks")
