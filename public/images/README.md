# Hero images

The four photographs the hero cycles through. **This is the only images folder
the site can use** — Next.js serves static files from `public/` and nothing
else, so a folder at the repo root cannot be reached by the browser.

| File         | Photograph                                             | Sector word shown | Source size |
| ------------ | ------------------------------------------------------ | ----------------- | ----------- |
| `hero-1.jpg` | Fabricators grinding steel sections on the shop floor   | Precision Strips  | 1080 × 720  |
| `hero-2.jpg` | Blue-lit cold rolled coils down the finished goods bay  | Cold Rolled       | 1672 × 940  |
| `hero-3.jpg` | Bundled galvanised stock across the warehouse floor     | Galvanised        | 1672 × 941  |
| `hero-4.jpg` | Coil warehouse aisle with sun flare                     | HRPO Coils        | 1000 × 667  |

## Replacing one

Save the new photograph over the same filename. No code change needed. Slide
order, sector words, alt text and per-slide framing live in
`src/lib/hero-slides.ts`.

## Resolution

`hero-1` and `hero-4` are only about 1000px wide. They are stretched across the
full viewport, so on a 1440px or wider display they are being upscaled and will
look softer than `hero-2` and `hero-3`. **If higher-resolution originals exist,
they are worth dropping in** — ideally 1920×1080 or larger.

The hero's push-in was reduced (1.02× → 1.12×) to limit how much extra
magnification is applied on top of that; it lives in the `hero-kenburns`
keyframes in `src/app/globals.css`.

## Guidelines for new imagery

- **Landscape, 1920×1080 or larger.**
- **Keep the subject centre-right.** The wordmark sits on the left third under a
  dark scrim; a subject on the left will fight it. Framing can be nudged
  per slide with the `position` field in `src/lib/hero-slides.ts`.
- **Prefer darker frames.** White type sits directly on the image.
- Optimise before committing — these are re-encoded at JPEG quality 86,
  progressive, and kept under ~500 KB each.
