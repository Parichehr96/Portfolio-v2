"""Reading Figma frame exports: shared by build.py (the event-creation flow)
and build_hero.py (the hero screens)."""
import base64, copy, os, re, subprocess, tempfile
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"
XL_NS = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG_NS)
ET.register_namespace("xlink", XL_NS)


class FigmaFrame:
    """A frame exported from Figma (download_assets, svg). Unlike the Downloads
    exports, these carry the section's canvas around the frame and reuse the
    same def ids (clip0_4_3 …) in every frame, so defs are renamed with a
    per-frame prefix, layers are pulled by their Figma layer name, and layer
    names are stripped from the output (they are not valid ids)."""

    def __init__(self, path, frame_name, prefix):
        self.root = ET.parse(path).getroot()
        self.frame = self.root.find(".//{%s}g[@id='%s']" % (SVG_NS, frame_name))
        self.defs = self.root.find("{%s}defs" % SVG_NS)
        self.ren = {e.get("id"): prefix + e.get("id") for e in self.defs.iter() if e.get("id")}

    def layer(self, name):
        return self.frame.find(".//*[@id='%s']" % name)

    def _out(self, el, keep=()):
        el = copy.deepcopy(el)
        for e in el.iter():
            if e.get("id") and e.get("id") not in keep:
                del e.attrib["id"]
        s = ET.tostring(el, encoding="unicode")
        return self._rename(s)

    def _rename(self, s):
        for old in sorted(self.ren, key=len, reverse=True):
            new = self.ren[old]
            s = s.replace("#%s)" % old, "#%s)" % new).replace('"#%s"' % old, '"#%s"' % new)
            s = s.replace('id="%s"' % old, 'id="%s"' % new)
        return s.replace(' xmlns="%s"' % SVG_NS, "").replace(' xmlns:xlink="%s"' % XL_NS, "")

    def svg(self, el, as_id=None):
        """Markup for one layer; as_id gives it an id of ours."""
        el = copy.deepcopy(el)
        if as_id:
            el.set("id", as_id)
        return self._out(el, keep=(as_id,) if as_id else ())

    def defs_svg(self, max_px=300, only=None):
        """Every def, renamed, with embedded bitmaps cut to max_px: nothing in
        these frames is drawn above ~90px, and the phone's raw PNGs alone are
        2 MB. width/height stay as declared, so patterns still map 1:1."""
        out = []
        if only is not None:
            # `only`: markup to serve. Keep the defs it points at, and the defs
            # those point at (a pattern's image), until nothing new turns up.
            want, text = set(), only
            while True:
                new = {d.get("id") for d in self.defs if d.get("id") not in want
                       and "#" + self.ren.get(d.get("id"), d.get("id")) in text}
                new |= {d.get("id") for d in self.defs if d.get("id") not in want
                        and "#" + d.get("id") in text}
                if not new:
                    break
                want |= new
                text = "\n".join(ET.tostring(d, encoding="unicode") for d in self.defs if d.get("id") in new)
        for d in self.defs:
            if only is not None and d.get("id") not in want:
                continue
            d = copy.deepcopy(d)
            for img in d.iter("{%s}image" % SVG_NS):
                href = img.get("{%s}href" % XL_NS) or ""
                m = re.match(r"data:image/(\w+);base64,(.*)", href, re.S)
                if m and len(m.group(2)) > 60000:
                    img.set("{%s}href" % XL_NS, shrink(m.group(1), m.group(2), max_px))
            out.append(self._out(d, keep=(d.get("id"),) + tuple(e.get("id") for e in d.iter() if e.get("id"))))
        return "\n".join(out)


def shrink(fmt, b64, max_px):
    ext = "jpg" if fmt == "jpeg" else fmt
    with tempfile.TemporaryDirectory() as t:
        src, dst = os.path.join(t, "in." + ext), os.path.join(t, "out." + ext)
        open(src, "wb").write(base64.b64decode(b64))
        args = ["sips", "-Z", str(max_px)]
        if ext == "jpg":
            args += ["-s", "formatOptions", "82"]
        subprocess.run(args + [src, "--out", dst], check=True, capture_output=True)
        return "data:image/%s;base64,%s" % (fmt, base64.b64encode(open(dst, "rb").read()).decode())


