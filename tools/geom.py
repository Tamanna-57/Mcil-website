from PIL import Image
import numpy as np

def close_gaps(row, max_gap=90):
    """Bridge short non-navy gaps (the white lettering) so the bar reads as one run."""
    out = row.copy()
    idx = np.where(row)[0]
    if len(idx) < 2: return out
    for a, b in zip(idx[:-1], idx[1:]):
        if 1 < b - a <= max_gap:
            out[a:b] = True
    return out

def longest_run(row):
    best = cur = start = best_start = 0
    for i, v in enumerate(row):
        if v:
            if cur == 0: start = i
            cur += 1
            if cur > best: best, best_start = cur, start
        else:
            cur = 0
    return best, best_start

def badge(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(int)
    h, w, _ = a.shape
    r, g, b = a[...,0], a[...,1], a[...,2]
    navy = (b > r + 10) & (b < 115) & (r < 75) & (g < 90)
    closed = np.array([close_gaps(navy[y]) for y in range(int(h*0.45))])
    runs = [longest_run(closed[y]) for y in range(closed.shape[0])]
    lens = np.array([x[0] for x in runs])
    good = set(np.where(lens > w*0.30)[0].tolist())
    peak = int(lens.argmax())
    y0 = y1 = peak
    while y0-1 in good: y0 -= 1
    while y1+1 in good: y1 += 1
    x0 = runs[peak][1]; x1 = x0 + runs[peak][0]

    white = (r > 195) & (g > 195) & (b > 195)
    wr = white[y0:y1+1, x0:x1].sum(axis=1)
    thr = max(4, wr.max()*0.08)
    bands, cur = [], None
    for k, v in enumerate(wr):
        if v > thr and cur is None: cur = k
        elif v <= thr and cur is not None:
            if k-cur >= 5: bands.append((cur+y0, k-1+y0))
            cur = None
    if cur is not None: bands.append((cur+y0, y1))
    return dict(size=(w,h), y0=y0, y1=y1, x0=x0, x1=x1, bands=bands)

if __name__ == "__main__":
    for i in (1,2,3,4):
        d = badge(f'/home/user/Mcil-website/public/images/process-{i}.jpg')
        print(f"process-{i}: {d['size']}  bar y {d['y0']}..{d['y1']} (h={d['y1']-d['y0']+1})"
              f"  x {d['x0']}..{d['x1']}  text {d['bands']}")
