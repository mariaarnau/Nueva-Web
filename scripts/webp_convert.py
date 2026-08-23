#!/usr/bin/env python3
"""Convierte imágenes de assets/photos/source a WebP en assets/img, con presupuesto de 350KB."""
import os
import sys
from PIL import Image

SRC_DIR = "assets/photos/source"
OUT_DIR = "assets/img"
MAX_WIDTH = 1920
BUDGET_KB = 350


def convert_one(src_path, dest_name, max_width=MAX_WIDTH, quality=78):
    im = Image.open(src_path).convert("RGB")
    w, h = im.size
    if w > max_width:
        nh = round(h * max_width / w)
        im = im.resize((max_width, nh), Image.LANCZOS)
    dest_path = os.path.join(OUT_DIR, dest_name)
    q = quality
    im.save(dest_path, "WEBP", quality=q, method=6)
    while os.path.getsize(dest_path) > BUDGET_KB * 1024 and q > 40:
        q -= 6
        im.save(dest_path, "WEBP", quality=q, method=6)
    return dest_path, os.path.getsize(dest_path) // 1024


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    if len(sys.argv) == 3:
        dest, size = convert_one(sys.argv[1], sys.argv[2])
        print(dest, size, "KB")
    else:
        print("uso: python3 scripts/webp_convert.py <origen> <nombre-destino.webp>")
