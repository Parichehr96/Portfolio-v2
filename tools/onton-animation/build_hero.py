"""Generate Assets/embeds/onton/hero-screens.html: the ONTON case study's hero,
from Figma section 1329:26318 ("ONTON_animation(Hero)").

Frame 1 is the whole phone, small; frame 2 is the phone large and cropped by
the frame. They are NOT the same layout at two sizes (frame 2's screen runs
taller, its tags 11 lower and 6 wider than frame 1's scaled up), so the zoom
is a morph: both renders are drawn, frame 1 scaling up onto frame 2 while
frame 2 scales up from frame 1's size, cross-fading. Each part named below is
moved on its own path so it lands exactly on its counterpart; the template's
script measures them at runtime and keeps the two renders locked together.
"""
import copy, json, os, sys
import xml.etree.ElementTree as ET

S = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, S)
from figmalib import FigmaFrame, SVG_NS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(S))
HERO = S + "/sources/hero/"

A = FigmaFrame(HERO + "h01.svg", "ONTON_animation_1", "ha-")
B = FigmaFrame(HERO + "h02.svg", "ONTON_animation_2", "hb-")
C = FigmaFrame(HERO + "h03.svg", "ONTON_animation_3", "hc-")   # 2 → 3 zooms back out onto this
D = FigmaFrame(HERO + "h04.svg", "ONTON_animation_4", "hd-")   # 3 → 4: the Event tab
E = FigmaFrame(HERO + "h05.svg", "ONTON_animation_5", "he-")   # 4 → 5: the ticket
F6 = FigmaFrame(HERO + "h06.svg", "ONTON_animation_6", "hf-")  # 6: the scan line
F7 = FigmaFrame(HERO + "h07.svg", "ONTON_animation_7", "hg-")  # 7: checked in

# Layers present in both frames, each moved onto its counterpart. Frame 1's
# extra rows (5-7) and tab bar have no counterpart: they ride the zoom out
# of the bottom of the frame.
PARTS = ["3-frame", "camera", "0-antenna", "Modal Stack", "Body", "Greeting Section",
         "Filter Button", "Filter Button_2", "Filter Button_3",
         "Body_2", "Line 542", "Event Row_2", "Line 543", "Event Row_3", "Line 544", "Event Row_4"]
STRETCH = {"3-frame"}          # the bezel's proportions differ; everything else scales evenly


def layer(F, key, extra=None, keep_ids=(), slots=(), parts=PARTS):
    """The frame's phone as one group, each part wrapped in a <g> of its own
    (key-p0 ...) so it can be moved without touching its ancestors."""
    fr = copy.deepcopy(F.frame)
    frame_g = fr.find("{%s}g" % SVG_NS)                       # "Frame 2131328529"
    frame_g.attrib.pop("clip-path", None)                    # the stage crops; see docstring
    parents = {c: p for p in fr.iter() for c in p}
    keep = list(keep_ids)
    for i, name in enumerate(parts):
        el = frame_g.find(".//*[@id='%s']" % name)
        assert el is not None, (key, name)
        par = parents[el]
        idx = list(par).index(el)
        wrap = ET.Element("{%s}g" % SVG_NS, {"id": "%s-p%d" % (key, i)})
        par.remove(el)
        wrap.append(el)
        par.insert(idx, wrap)
        parents[el] = wrap
        keep.append(wrap.get("id"))
    for name, new in (extra or {}).items():
        el = frame_g.find(".//*[@id='%s']" % name)
        assert el is not None, (key, name)
        el.set("id", new)
        keep.append(new)
    # empty <g> markers inside named layers, replaced by other frames' markup
    for slot, inside in slots:
        host = frame_g.find(".//*[@id='%s']" % inside)
        assert host is not None, (key, inside)
        ET.SubElement(host, "{%s}g" % SVG_NS, {"id": slot})
        keep.append(slot)
    return F._out(frame_g, keep=tuple(keep))


def pieces(F, names, gid, extra=None):
    """Some of a frame's layers, together in one <g id=gid>."""
    g = ET.Element("{%s}g" % SVG_NS, {"id": gid})
    for n in names:
        el = F.frame.find(".//*[@id='%s']" % n)
        assert el is not None, n
        g.append(copy.deepcopy(el))
    keep = [gid]
    for name, new in (extra or {}).items():
        el = g.find(".//*[@id='%s']" % name)
        assert el is not None, name
        el.set("id", new)
        keep.append(new)
    return F._out(g, keep=tuple(keep))


# Frame 2 starts plain: the Nearby tag unselected (styled like its
# neighbours) and the dropdown hidden; the template turns them on.
b_tag = B.layer("Filter Button")
b_tag_bg = b_tag.find("{%s}rect" % SVG_NS)
b_tag_bg.set("id", "tag-bg")
b_tag_bg.set("fill", "#475569")
b_tag_bg.set("fill-opacity", "0.04")
for name, new in (("Filter Name", "tag-label"), ("Vector_4", "tag-caret")):
    el = b_tag.find(".//*[@id='%s']" % name)
    el.set("fill", "#475569")
    el.set("id", new)
TAG_IDS = ("tag-bg", "tag-label", "tag-caret")
b_extra = {"Container": "menu", "Horizontal Filter Container": "hl",
           "Filter Option": "opt0", "Filter Option_2": "opt1", "Filter Option_3": "opt2",
           "Filter Option_4": "opt3", "Filter Option_5": "opt4", "Filter Option_6": "opt5"}

lay_a = layer(A, "a")
lay_b = layer(B, "b", b_extra, keep_ids=TAG_IDS)

# Frame 3 carries 3 → 4: frame 4's new content is put into frame 3's own
# screen (both are the small phone at the same place), so the old list can
# slide out and the new one in, clipped by the same screen; and frame 4's
# tab-bar items are laid over frame 3's to hand the selection over.
lay_c = layer(C, "c", {"Section Header": "c-list", "Button Content": "c-ev",
                       "Button Content_2": "c-disc", "Button Content_3": "c-chan"},
              slots=(("__D_CONTENT__", "Main Content"), ("__D_NAV__", "Button")))
d_content = pieces(D, ["Events Section Title", "Frame 2131328691", "Upcoming Events Section"], "d-content",
                   {"Icon_3": "d-ticket"})                     # the live event's Ticket button
d_nav = pieces(D, ["Button Content", "Button Content_2", "Button Content_3"], "d-nav",
               {"Button Content": "d-ev"})
lay_c = lay_c.replace('<g id="__D_CONTENT__" />', d_content).replace('<g id="__D_NAV__" />', d_nav)
assert "__D_" not in lay_c

# Frame 5 is the ticket over the blurred Event screen. Figma exports its
# background blur as nothing at all (it is a backdrop effect), so the screen
# under the veil is blurred here instead: e-bg1/e-bg2 get a blur filter. Frame
# 6's scan line and frame 7's checked-in QR are laid into the ticket, unseen.
QR = next(e.get("id") for e in E.frame.iter() if (e.get("id") or "").startswith("QR modules"))
lay_e = layer(E, "e", {"Main Content": "e-bg1", "Navigation": "e-bg2", "Ticket": "e-ticket",
                       "Subtract": "e-card", "iconoir:qr-code": "e-qr", "Frame 2131328708": "e-dl"},
              slots=(("__SCAN__", "e-ticket"), ("__QR7__", "e-ticket")), parts=())
scan = pieces(F6, ["Frame 2131328716"], "scan")
qr7 = pieces(F7, ["iconoir:qr-code"], "qr7", {"onton-eyebrow [Vectorized]": "chk-badge", "Icon_3": "chk"})
lay_e = lay_e.replace('<g id="__SCAN__" />', scan).replace('<g id="__QR7__" />', qr7)
assert "__SCAN__" not in lay_e and "__QR7__" not in lay_e

tpl = open(S + "/template_hero.html").read()
for k, v in {
    "%%DEFS%%": "\n".join(F.defs_svg() for F in (A, B, C, D, E)) + "\n" + F7.defs_svg(only=qr7),
    "%%LAYER_A%%": lay_a,
    "%%LAYER_B%%": lay_b,
    "%%LAYER_C%%": lay_c,
    "%%LAYER_E%%": lay_e,
    "%%PARTS%%": json.dumps({"n": len(PARTS), "stretch": [i for i, p in enumerate(PARTS) if p in STRETCH]}),
}.items():
    assert k in tpl, k
    tpl = tpl.replace(k, v)
out = ROOT + "/Assets/embeds/onton/hero-screens.html"
open(out, "w").write(tpl)
print(out, len(tpl) // 1024, "KB")
