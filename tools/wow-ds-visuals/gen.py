"""Writes one WOW visual option. Each option is a standalone page drawn at 600
px wide (the case column) on the shared kit: case.css/case.js (portfolio
tokens, fit, motion helpers, icons) and wow.css/wow.js (the product kit)."""
import os
D = os.path.join(os.path.dirname(__file__), "v")
HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="{desc}">
<title>WOW design system — {title}</title>
<link rel="stylesheet" href="/Assets/embeds/connect2wow/v4/case.css">
<link rel="stylesheet" href="wow.css">
<script src="/Assets/embeds/connect2wow/v4/icons.js"></script>
<script src="/Assets/embeds/connect2wow/v4/case.js"></script>
<script src="wow.js"></script>
<style>
  .canvas {{ height: {h}px; }}
{css}
</style>
</head>
<body>
<div class="frame{frame}" id="f">
  <div class="canvas" id="c">
{html}
  </div>
</div>
<script>
  var f = document.getElementById("f"), c = document.getElementById("c");
{js}
</script>
</body>
</html>
'''
def page(name, title, desc, h, css, html, js, frame=""):
    open(os.path.join(D, name + ".html"), "w").write(HEAD.format(title=title, desc=desc.replace('"', "&quot;"), h=h, css=css, html=html, js=js, frame=frame))
