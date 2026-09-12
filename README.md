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

| What                                                    | Where                           |
| ------------------------------------------------------- | ------------------------------- |
| Slide order, sector words, alt text, image focal points | `src/lib/hero-slides.ts`        |
| Timings, keyframes, headline sizing                     | `src/app/globals.css`           |
| Markup and slide state                                  | `src/components/Hero.tsx`       |
| Nav links                                               | `src/components/SiteHeader.tsx` |

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

## Header and the logo

The header is **brand navy on every page and at every scroll position**. It
used to be transparent until the page scrolled, which read well over the hero
photography and left white nav type sitting on a white page everywhere else —
invisible on About, Investors and Products until you scrolled or opened a menu.

The navy lives in one place, `--navy` in `src/app/globals.css`, taken off the
logo artwork by eye. If the brand sheet gives an exact value, that is the one
line to change.

### Fitting the logo

The top-left slot renders the artwork as soon as it is pointed at one, and sets
the wordmark in type until then. To fit it:

1. Save the file into `public/images/` — an **SVG**, or a PNG with a
   **transparent background**. The square navy-backed version would put a navy
   block on a navy bar, and any mismatch between the two navies shows as a
   patch.
2. In `src/lib/brand.ts`, uncomment `src` and set the artwork's real pixel
   `width` and `height` (used for the aspect ratio only).

`LOGO_HEIGHT` in the same file is how tall the mark renders, and with the bar's
padding it is what makes the header 68px — so `--header-h` has to stay in step
with it. Every page's top padding and the sticky sections are measured off that
token.

## Products

`/products` carries one band per product, in the two layouts of the reference:

| Product                    | Layout                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Cold Rolled Strips & Coils | The product name set giant across a deep plate, with one photograph inset low and centre-right, lapping over the name |
| HRPO Steel Coils           | A hairline divider, then four plates hung from one top line, the third lapping over the second                        |

Both bands open on the product name above a short paragraph in the right-hand
column. The braced span in a product's `body` is what gets underlined — as the
product name is in the reference:

```ts
body: "{HRPO steel coils} are hot rolled, pickled and oiled — …",
```

### Photographs

Each image slot is a `plate`. A plate with `src` renders the photograph; a
plate without one renders a frame labelled with its `alt`, so an unfilled slot
reads as pending rather than broken. To fill one, drop the file into
`public/images/` and set `src` in `src/lib/products.ts`.

Cold Rolled currently reuses `hero-2.jpg`; the four HRPO plates are still
placeholders waiting on the shots named in their `alt` text.

### Scroll behaviour

Each plate holds itself blank until it is properly on screen and then arrives —
the inset photograph on the Cold Rolled block lands with an overshoot
(`.pb-pop`), the gallery plates rise in sequence (`.pb-rise`). The trigger line
is pulled up off the bottom of the viewport, so a plate that is merely poking
into view on first paint still waits to be scrolled onto. Both animations are
held still under `prefers-reduced-motion`.

Geometry is expressed as percentages of the block, taken off the reference, so
the composition holds at any width. Below `lg` the overlaps are dropped and the
plates stack — at phone width they collapse into an unreadable pile.

## Investor documents — "Latest Reports"

The document library at the foot of `/investors` mirrors the four categories on
the live mcil.net investor section, each with its real sub-categories:

| Category                            | Sub-categories                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Financials                          | Annual Report & Audited Financial Results, Unaudited Financial Results                                     |
| Stock Exchange Compliance           | Integrated Filing, Shareholding Pattern, Corporate Governance, Secretarial Compliance, AGM, and eight more |
| Letters Sent to Stock Exchange      | Intimation, Outcome, Newspaper Publication, Others                                                         |
| Policies, Code & Unclaimed Dividend | Policies, Code, Unclaimed Dividend, Investor Forms                                                         |

The rows are **placeholders** — titles and dates are shaped like the real
filings, but no file is attached yet. To publish a document:

1. Drop the PDF under `public/`, e.g. `public/docs/annual-report-2026.pdf`.
2. Set `href` on its row in `src/lib/investor-reports.ts`
   (`href: "/docs/annual-report-2026.pdf"`).

A row with an `href` renders a live download; a row without one keeps the same
Download control, inert. Nothing links back to mcil.net.

Rows sort newest-first on `date`, so entries can be added in any order, and
`REPORTS_PAGE_SIZE` sets how many show before "View All" expands the list in
place.

Each category is also an anchor — `/investors#financials`, `#compliance`,
`#letters`, `#policies` — which scrolls to the band and opens that tab.

## Still to do

- Higher-resolution originals for `hero-1` and `hero-4` (above).
- MCIL logo artwork — the header slot is ready for it (see above).
- The rest of the site: Media, Careers, Contact.
- Real PDFs behind the investor document rows (above).
