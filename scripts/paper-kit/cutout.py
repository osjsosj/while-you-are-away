"""
Turns the raw kit images (objects photographed on white) into small web files in public/paper/.
  python scripts/paper-kit/cutout.py <raw dir>
- stamps: the white around the stamp becomes transparent (flood fill from the edges, so the stamp's own
  off-white paper is kept), trimmed and saved as a 360px-wide WebP.
- sheets (tape, pressed flowers): each separate object on the sheet is cut out on its own (tape-1, tape-2, ...).
- paper: center crop, softened to a gentle surface and saved as a small tile.
"""
import sys, os, json
from collections import deque
from PIL import Image, ImageFilter, ImageOps

RAW = sys.argv[1]
OUT = os.path.join('public', 'paper')
os.makedirs(OUT, exist_ok=True)
NAMES = {'tape-sheet': ['tape-masking', 'tape-rose', 'tape-kraft'], 'flower-sheet': ['flower-lavender', 'flower-fern', 'flower-daisy']}


def background_mask(im, tol=26):
    """True where the pixel is the white backdrop, reached from the border through near-white pixels."""
    rgb = im.convert('RGB')
    w, h = rgb.size
    px = rgb.load()
    # the backdrop color, sampled from the corners
    corners = [px[2, 2], px[w - 3, 2], px[2, h - 3], px[w - 3, h - 3]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    near = lambda p: all(abs(p[i] - bg[i]) <= tol for i in range(3))
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i] or not near(px[x, y]):
            continue
        seen[i] = 1
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    return seen, w, h


def cut(im, tol=26):
    im = im.convert('RGBA')
    small = im.copy()
    small.thumbnail((900, 900))
    seen, w, h = background_mask(small, tol)
    alpha = Image.new('L', (w, h))
    alpha.putdata([0 if s else 255 for s in seen])
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    small.putalpha(alpha)
    return small


def components(rgba, min_area=1500):
    """Separate opaque regions (bounding boxes), largest first."""
    a = rgba.split()[3].point(lambda v: 255 if v > 40 else 0)
    w, h = a.size
    px = a.load()
    seen = bytearray(w * h)
    boxes = []
    for sy in range(0, h, 2):
        for sx in range(0, w, 2):
            if px[sx, sy] == 0 or seen[sy * w + sx]:
                continue
            q = deque([(sx, sy)]); seen[sy * w + sx] = 1
            x0 = x1 = sx; y0 = y1 = sy; n = 0
            while q:
                x, y = q.popleft(); n += 1
                x0, x1, y0, y1 = min(x0, x), max(x1, x), min(y0, y), max(y1, y)
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny] and not seen[ny * w + nx]:
                        seen[ny * w + nx] = 1; q.append((nx, ny))
            if n >= min_area:
                boxes.append((n, (x0, y0, x1 + 1, y1 + 1)))
    boxes.sort(key=lambda b: -b[0])
    return [b for _, b in boxes]


def save(rgba, name, width):
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    if rgba.width > width:
        rgba = rgba.resize((width, round(rgba.height * width / rgba.width)), Image.LANCZOS)
    path = os.path.join(OUT, f'{name}.webp')
    rgba.save(path, 'WEBP', quality=86, method=6)
    return {'file': f'/paper/{name}.webp', 'w': rgba.width, 'h': rgba.height, 'bytes': os.path.getsize(path)}


made = {}
for f in sorted(os.listdir(RAW)):
    if not f.endswith('.png'):
        continue
    kid = f[:-4]
    im = Image.open(os.path.join(RAW, f))
    if kid.startswith('stamp-'):
        made[kid] = save(cut(im), kid, 360)
    elif kid in NAMES:
        rgba = cut(im, tol=22)
        boxes = components(rgba)
        # left-to-right, top-to-bottom order of the three objects as asked for in the prompt
        boxes = sorted(boxes[:3], key=lambda b: (b[1] // 120, b[0]))
        for name, b in zip(NAMES[kid], boxes):
            piece = rgba.crop(b)
            if name in ('flower-fern', 'flower-lavender'):
                # white trapped between leaves and stems is backdrop too (these have no white parts of their own;
                # the daisy is left alone, its petals are white)
                px = piece.load()
                for yy in range(piece.height):
                    for xx in range(piece.width):
                        r, g, bl, a = px[xx, yy]
                        if a and min(r, g, bl) > 228:
                            px[xx, yy] = (r, g, bl, 0)
            made[name] = save(piece, name, 520 if name.startswith('tape') else 300)
    elif kid.startswith('paper-'):
        # a grey surface (the sheet keeps its own color through multiply): even out the light, keep the fibers,
        # and mirror it top to bottom so it repeats down a long letter without a seam
        g = ImageOps.grayscale(ImageOps.fit(im.convert('RGB'), (min(im.size), min(im.size))).resize((600, 600), Image.LANCZOS))
        blur = g.filter(ImageFilter.GaussianBlur(40))
        px, bp = g.load(), blur.load()
        flat = Image.new('L', g.size)
        fp = flat.load()
        for y in range(g.height):
            for x in range(g.width):
                # detail around a bright paper tone: 242 plus the fiber contrast, softened
                fp[x, y] = max(0, min(255, int(242 + (px[x, y] - bp[x, y]) * 0.9)))
        tile = Image.new('L', (600, 1200))
        tile.paste(flat, (0, 0))
        tile.paste(ImageOps.flip(flat), (0, 600))
        path = os.path.join(OUT, f'{kid}.webp')
        tile.convert('RGB').save(path, 'WEBP', quality=78, method=6)
        made[kid] = {'file': f'/paper/{kid}.webp', 'w': 600, 'h': 1200, 'bytes': os.path.getsize(path)}

json.dump(made, open(os.path.join(OUT, 'kit.json'), 'w'), indent=1)
for k, v in made.items():
    print(k, v['w'], 'x', v['h'], v['bytes'] // 1024, 'KB')
