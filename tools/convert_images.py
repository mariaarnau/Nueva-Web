#!/usr/bin/env python3
"""One-off conversion of ProFit Mind source photos to optimized WebP."""
from PIL import Image
import os

SRC = "assets/photos/source"
DST = "assets/img"
os.makedirs(DST, exist_ok=True)

# name -> (max_width, quality)
PLAN = {
    "hero-yoga-atardecer.jpg": (2000, 80),
    "meditacion-piscina.jpg": (1600, 80),
    "oficina-yoga-empresa.jpg": (1400, 80),
    "entrenamiento-personal.jpg": (1200, 80),
    "grupo-pesas-silueta.jpg": (1400, 80),
    "plancha-funcional-grupo.jpg": (1400, 80),
    "hiit-cuerdas-gimnasio.jpg": (1400, 80),
    "funcional-cuerdas-pesas.jpg": (1200, 80),
    "instalaciones-gimnasio.jpg": (1400, 80),
    "decor-piedras-esterilla.webp": (700, 85),
    "decor-piedras-spa.png": (600, 85),
}

for fname, (max_w, q) in PLAN.items():
    src_path = os.path.join(SRC, fname)
    if not os.path.exists(src_path):
        print("MISSING", src_path)
        continue
    im = Image.open(src_path)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    if has_alpha:
        im = im.convert("RGBA")
    else:
        im = im.convert("RGB")
    w, h = im.size
    if w > max_w:
        new_h = round(h * (max_w / w))
        im = im.resize((max_w, new_h), Image.LANCZOS)
    out_name = os.path.splitext(fname)[0] + ".webp"
    out_path = os.path.join(DST, out_name)
    im.save(out_path, "WEBP", quality=q, method=6)
    kb = os.path.getsize(out_path) / 1024
    print(f"{out_name}: {im.size[0]}x{im.size[1]} {kb:.0f}KB")
