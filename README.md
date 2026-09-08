# MCIL — Metal Coatings (India) Ltd

Revamp of [mcil.net](https://www.mcil.net/). Next.js (App Router) + TypeScript +
Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## What is built so far

The hero section, modelled on the Aditya Birla Group homepage:

- **Crossfading background plates** with a slow push-in (Ken Burns) that
  restarts on each slide, driven through the Web Animations API so the
  `<Image>` never remounts.
- **Wordmark lockup** — `METAL` light / `COATINGS INDIA` under a black
  highlight bar / `|` / the sector word in extra-bold.
- **Highlight sweep** — the bar wipes in from the left, holds, wipes off to the
  right, rests, and loops on a 4.4s cycle independent of the slide timer.
- **Sector word roll** — the outgoing word lifts and fades while the incoming
  word rises into place.
- **Slide indicators** that fill over the slide duration and are clickable.
- Transparent nav that goes solid on scroll, with a mobile panel.
- Full `prefers-reduced-motion` support: every animation is held still and the
  indicator reads as full, but the crossfade between slides is preserved.

## Editing the hero

| What                                  | Where                          |
| ------------------------------------- | ------------------------------ |
| Slide order, sector words, alt text, image focal points | `src/lib/hero-slides.ts` |
| Timings, keyframes, headline sizing   | `src/app/globals.css`          |
| Markup and slide state                | `src/components/Hero.tsx`      |
| Nav links                             | `src/components/SiteHeader.tsx`|

Slide duration lives in two places that must stay in sync:
`HERO_SLIDE_DURATION` in `src/lib/hero-slides.ts` and `--hero-slide-duration`
in `src/app/globals.css`.

### Headline sizing

The longest lockup — `METAL COATINGS INDIA | PRECISION STRIPS` — measures about
22.4em in Montserrat. At 1024px and above the type is sized off the viewport
(`min(3.9vw, 4.5rem)`) so the whole line stays on one row like the reference.
Below that the sector word drops to a second line, the pipe is hidden, and the
type grows back to a readable size. If you lengthen a sector word past
"Precision Strips", re-check the desktop line for overflow.

## Hero images

The four photographs live in [`public/images/`](public/images/README.md) as
`hero-1..4.jpg`. That is the only images folder the site can use — Next.js
serves static files from `public/` and nothing else. To replace one, save over
the same filename; no code change is needed.

`hero-1` and `hero-4` are roughly 1000px wide, so they are upscaled on wide
displays and look softer than the other two. Higher-resolution originals are
worth dropping in if they exist.

## Still to do

- Higher-resolution originals for `hero-1` and `hero-4` (above).
- MCIL logo asset — the header currently sets the wordmark in type.
- The rest of the site: About, Products, MCIL Advantage, Investors, Media,
  Careers, Contact.
