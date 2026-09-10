"""
Drop the description sub-line burned into process-1 and -2 so all four process
photographs carry just a number and a title, as -3 and -4 already do.

Both bars are skewed by the photographs' perspective. Walking the navy edge per
row stalls on the white lettering, so the edges are measured on the two
text-free rows just inside the bar and interpolated between them — the bar is a
straight-sided quad, so a line fits it exactly.
"""
from PIL import Image
import numpy as np
from geom import badge, longest_run

def run(mask_row):
    n, s = longest_run(mask_row)
    return s, s + n - 1

def clusters(nz, join=10, min_width=8):
    if len(nz) == 0: return []
    out, start, prev = [], nz[0], nz[0]
    for v in nz[1:]:
        if v - prev > join:
            if prev - start >= min_width: out.append((start, prev))
            start = v
        prev = v
    if prev - start >= min_width: out.append((start, prev))
    return out

def process(idx, preview=False):
    path = f'/home/user/Mcil-website/public/images/process-{idx}.jpg'
    d = badge(path)
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(int)
    r, g, b = a[...,0], a[...,1], a[...,2]
    navy = (b > r + 10) & (b < 115) & (r < 75) & (g < 90)
    white = (r > 195) & (g > 195) & (b > 195)

    y0, y1 = d['y0'], d['y1']
    barH = y1 - y0 + 1
    yA, yB = y0 + 3, y1 - 3           # text-free rows at the bar's head and foot
    sA, eA = run(navy[yA])
    sB, eB = run(navy[yB])
    edge = lambda y: int(round(eA + (eB - eA) * (y - yA) / (yB - yA)))

    # Number is the first white column cluster, title the second.
    nz = np.where(white[y0:y1+1].sum(axis=0) > 3)[0]
    nz = nz[(nz >= d['x0']) & (nz <= max(eA, eB))]
    cl = clusters(nz)
    if len(cl) < 2:
        print(f"process-{idx}: could not separate number from title, skipped"); return
    cutX = (cl[0][1] + cl[1][0]) // 2

    wr = white[y0:y1+1, cutX:max(eA, eB)].sum(axis=1)
    thr = max(4, wr.max() * 0.08)
    bands, cur = [], None
    for k, v in enumerate(wr):
        if v > thr and cur is None: cur = k
        elif v <= thr and cur is not None:
            if k - cur >= 5: bands.append((cur + y0, k - 1 + y0))
            cur = None
    if cur is not None: bands.append((cur + y0, y1))
    tTop, tBot = bands[0]
    titleH = tBot - tTop + 1

    px = np.asarray(im).copy()
    fallback = np.median(px[y0:y1+1][navy[y0:y1+1]], axis=0).astype(px.dtype)
    lum = a.mean(axis=2)
    navyLum = float(np.median(lum[y0:y1+1][navy[y0:y1+1]]))

    maxEdge = max(eA, eB)
    blockRight = min(edge(y) for y in range(tTop, tBot + 1))
    # Start the title left of its first glyph but right of the rule that
    # separates it from the number, so that rule is not carried down with it.
    blockLeft = max(cutX, cl[1][0] - 12)
    block = px[tTop:tBot+1, blockLeft:blockRight].copy()

    for y in range(y0 + 2, y1 - 1):
        e = edge(y)
        # Catch the anti-aliased skirts of the lettering too, not just the
        # solid white core, or faint ghosts survive at the ends of the line.
        ink = np.where(lum[y, cutX:maxEdge] > navyLum + 30)[0]
        if len(ink):
            e = max(e, int(ink[-1]) + cutX + 6)
        e = min(e, maxEdge)
        row_navy = px[y, cutX:e+1][navy[y, cutX:e+1]]
        fill = np.median(row_navy, axis=0).astype(px.dtype) if len(row_navy) > 10 else fallback
        px[y, cutX:e+1] = fill

    newTop = y0 + (barH - titleH) // 2
    px[newTop:newTop+titleH, blockLeft:blockRight] = block

    print(f"process-{idx}: bar y{y0}..{y1} | edge {eA}->{eB} | number {cl[0]} title {cl[1][0]} "
          f"-> cut x{cutX} | title y{tTop}..{tBot} -> y{newTop} | removed {bands[1:]}")

    out = Image.fromarray(px)
    out.save(path, "JPEG", quality=88, optimize=True, progressive=True)
    if preview:
        out.crop((0, 0, out.width, int(out.height * 0.26))).save(f'after_{idx}.png')

if __name__ == "__main__":
    for i in (1, 2):
        process(i, preview=True)
