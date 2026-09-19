#!/usr/bin/env python3
"""
Split the MCIL monogram into the four shapes the intro sequence flies in.

The mark is genuinely four separate shapes — the arc over the top, the two
rings under it, and the wedge between them — and nothing in the artwork
touches anything else, so labelling the connected runs of ink finds them
exactly. That is the whole trick: the pieces are the logo's own shapes rather
than a grid laid over it, which is what stops them reading as torn-off crops
while they travel.

Writes public/images/mark-{top,left,right,tri}.png and prints the PIECES table
to paste into src/components/SiteIntro.tsx. Re-run it if the artwork changes.

    python3 tools/split-mark.py

Needs Pillow, numpy and scipy.
"""

from __future__ import annotations

import sys

import numpy as np
from PIL import Image
from scipy import ndimage

SOURCE = "public/images/mcil-mark.png"

# Ink, as opposed to the antialiased fringe around it. The fringe is picked up
# separately below — it is what keeps each shape's edges smooth once it is on
# its own — but including it here would bridge shapes that nearly touch and
# merge them into one.
INK_ALPHA = 110

# How far to grow each shape to collect its own fringe. Two pixels of soft edge
# is what the artwork carries; five is the odd-sized kernel that reaches it.
GROW = 5


def main() -> int:
    try:
        image = Image.open(SOURCE).convert("RGBA")
    except FileNotFoundError:
        print(f"{SOURCE} not found — run this from the repository root.")
        return 1

    rgba = np.asarray(image).copy()
    labels, count = ndimage.label(rgba[..., 3] > INK_ALPHA)

    if count != 4:
        print(
            f"Expected 4 shapes in the mark, found {count}. The artwork has "
            "changed shape — check it before trusting the split."
        )
        return 1

    shapes = []
    for index in range(1, count + 1):
        ys, xs = np.nonzero(labels == index)
        shapes.append(
            {"index": index, "cx": xs.mean(), "cy": ys.mean(), "area": len(xs)}
        )

    # Name them by where they sit, not by the order the labeller found them.
    top = min(shapes, key=lambda s: s["cy"])
    wedge = min(shapes, key=lambda s: s["area"])
    rings = [s for s in shapes if s is not top and s is not wedge]
    left = min(rings, key=lambda s: s["cx"])
    right = max(rings, key=lambda s: s["cx"])

    named = [
        ("top", top, "top"),
        ("left", left, "left"),
        ("right", right, "right"),
        ("tri", wedge, "bottom"),
    ]

    rows = []
    for name, shape, side in named:
        grown = ndimage.binary_dilation(
            labels == shape["index"], np.ones((GROW, GROW), bool)
        )
        piece = np.zeros_like(rgba)
        piece[grown] = rgba[grown]

        ys, xs = np.nonzero(piece[..., 3] > 0)
        x0, x1 = int(xs.min()), int(xs.max()) + 1
        y0, y1 = int(ys.min()), int(ys.max()) + 1

        out = f"public/images/mark-{name}.png"
        Image.fromarray(piece[y0:y1, x0:x1], "RGBA").save(out, optimize=True)
        rows.append((name, side, x0, y0, x1 - x0, y1 - y0))
        print(f"wrote {out}  {x1 - x0}x{y1 - y0} at ({x0}, {y0})")

    print("\nPIECES for src/components/SiteIntro.tsx:\n")
    for name, side, x, y, w, h in rows:
        print(f'  {{ id: "{name}", side: "{side}", x: {x}, y: {y}, w: {w}, h: {h} }},')
    return 0


if __name__ == "__main__":
    sys.exit(main())
