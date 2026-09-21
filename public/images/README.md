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

## Sustainability hero

`sustainability-hero.jpg` is the photograph behind the heading on
`/sustainability`. **It is currently a copy of `hero-4.jpg` standing in for an
environmental photograph** — greenery, the site seen from outside, planting at
the works. Save the real one over the same filename; nothing in the code needs
to change. Landscape, 1920×1080 or larger, and dark enough for white type to
sit on the left third.

The five photographs in the Sustainability Foundations cards are likewise
existing site imagery standing in for pictures of their own subjects. Their
paths live in `src/lib/sustainability.ts`.

## Works photographs

Four photographs of the works, used away from the hero and the process
walkthrough. They were uploaded as `image 1 mcil.jpg`, `mcil imqge 2.jpg`,
`mcil4 image.jpg` and `hot rolled steel coil imge.jpg`, and renamed to these
so the paths carry no spaces.

| File                  | Photograph                                  | Where it is used                                          | Source size |
| --------------------- | ------------------------------------------- | --------------------------------------------------------- | ----------- |
| `works-coil-bay.jpg`  | Finished coils stacked down the bay          | Sustainability hero; Latest News card 3                   | 1200 × 1200 |
| `works-inspection.jpg`| An engineer checking a coil on the line      | Sustainability People & Safety; Latest News card 2        | 1200 × 1200 |
| `works-coil-line.jpg` | The coil line down the length of the works   | Sustainability "The works" band; Latest News card 1; Products, HRPO gallery wipe | 800 × 800   |
| `hrpo-coils.jpg`      | Hot rolled coils in stock                    | Products, HRPO gallery; Sustainability "Material" band    | 1200 × 1600 |
| `hrpo-coils-banded.jpg` | Banded hot rolled coils, close up          | Products, HRPO gallery                                    | 1200 × 630  |

## process-1..4

**Used by the process walkthrough and nothing else.** Each carries its step
number and caption burned into the top-left corner, so anywhere else on the
site they read as a numbered stage of something the reader is not looking at.
The unlabelled originals are the four `ChatGPT Image …png` files.

## Still wanted

Four slots on the Sustainability page are hero slides standing in for
photographs that do not exist yet, each marked `PLACEHOLDER` in
`src/lib/sustainability.ts`: planting or the site from outside (Environment),
the board or the works from the gate (Governance), the BIS or a test
certificate (Certification), and the works team (Community). The hero there
wants an environmental photograph too.
