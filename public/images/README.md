# Hero images — drop your four photographs here

The hero cycles through four background images. **The four JPGs currently in
this folder are placeholders**, not the real photographs — they are generated
steel-toned plates so the animation has something to run against.

## To add the real photographs

Save them over these exact filenames. Nothing else needs to change — no code
edit, no rebuild config.

| File         | Photograph                                            | Sector word shown |
| ------------ | ----------------------------------------------------- | ----------------- |
| `hero-1.jpg` | Workers grinding/finishing steel sections on the floor | Precision Strips  |
| `hero-2.jpg` | Blue-lit cold rolled coils stacked down the bay        | Cold Rolled       |
| `hero-3.jpg` | Bundled bar/wire stock staged in the warehouse         | Galvanised        |
| `hero-4.jpg` | Coil warehouse with sun flare down the central aisle   | HRPO Coils        |

The quickest route is GitHub's web UI: open this folder on the branch, choose
**Add file → Upload files**, and drop all four in with those names.

## Guidelines

- **Landscape, 1920×1080 or larger.** They render `object-fit: cover` across the
  full viewport and the hero pushes in to 1.16×, so anything smaller will soften.
- **Keep the subject centre-right.** The wordmark sits on the left third under a
  dark scrim; a subject on the left will fight it. Per-slide framing can be
  nudged with the `position` field in `src/lib/hero-slides.ts`.
- **Prefer darker frames.** White type sits directly on the image.
- Optimise before committing (`jpegoptim`/`squoosh`, target under ~400 KB each).

Slide order, alt text and sector words all live in `src/lib/hero-slides.ts`.
