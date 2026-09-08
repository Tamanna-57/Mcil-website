# Hero imagery — replace these four files

The four JPGs in this folder are **placeholders**. They are procedurally
generated colour plates that match the tone of the intended photographs so the
hero animation can be built and reviewed; they are not the real images.

Drop the real photographs in at these exact filenames and nothing else needs to
change:

| File         | Photograph                                             | Sector word shown |
| ------------ | ------------------------------------------------------ | ----------------- |
| `hero-1.jpg` | Workers grinding/finishing steel sections on the floor  | Precision Strips  |
| `hero-2.jpg` | Blue-lit cold rolled coils stacked down the bay         | Cold Rolled       |
| `hero-3.jpg` | Bundled bar/wire stock staged in the warehouse          | Galvanised        |
| `hero-4.jpg` | Coil warehouse with sun flare down the central aisle    | HRPO Coils        |

## Guidelines

- **Landscape, 1920×1080 or larger.** They are rendered with `object-fit: cover`
  across the full viewport, and the hero applies a slow push-in that scales up
  to 1.16×, so anything smaller will soften.
- **Keep the subject centre-right.** The wordmark sits on the left third under a
  dark scrim; a subject on the left will fight it. Per-slide framing can be
  nudged with the `position` field in `src/lib/hero-slides.ts`.
- **Prefer darker frames.** White type sits directly on the image.
- Optimise before committing (`jpegoptim`/`squoosh`, target under ~400 KB each).

Slide order, alt text and sector words all live in `src/lib/hero-slides.ts`.
