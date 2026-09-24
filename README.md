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

## The admin panel

`/admin` is a password-protected editor for the site's text and images. Nothing
on it requires touching the code: whoever has the password can rewrite copy,
reorder and add list items (hero slides, team members, products, report rows)
and upload photographs, and the change is live on the next page load.

### Signing in

Set `ADMIN_PASSWORD` on the deployment and go to `/admin`. There are no
per-user accounts — it is one shared password, which is what a small office
actually wants. With no password set the panel refuses every login rather than
falling back to a default, so a deployment that forgot the variable is closed
rather than open.

To run it locally:

```bash
cp .env.example .env.local   # then fill in ADMIN_PASSWORD
npm run dev                  # http://localhost:3000/admin
```

### How editing works

The copy in `src/lib/*.ts` stays the baseline. What an admin saves is stored
separately, as an *override*, and merged over that baseline on every request.
Two things follow:

- A section nobody has edited keeps tracking the repo, so a copy change made in
  code still reaches the site.
- **Restore original** on any section deletes its override and brings back
  exactly what the repo ships. Nothing is lost by experimenting.

Objects merge key by key; lists replace wholesale, because a list is something
an admin curates and a cleverer merge would make deleting an item impossible.

### Adding a new editable field

Two steps, both mechanical:

1. Add the field to `SiteContent` in `src/lib/content/types.ts` and give it a
   baseline in `src/lib/content/defaults.ts`.
2. Describe it in `src/lib/admin/schema.ts`. The dashboard has no hand-written
   forms — it walks that description and renders the right control, so a new
   `{ type: "text", key: "...", label: "..." }` is all a new text box takes.

Available field types: `text`, `textarea`, `number`, `image`, `file`, `url`,
`date`, `select`, `boolean`, `strings` (a list of plain strings), `group` (a
nested object, optionally addable and removable) and `list` (a repeatable row
set with add, delete, duplicate and reorder).

### Uploading filings

Every row under **Investors → Reports & filings** takes a document: open the
category, then the sub-category, then the row, and upload the PDF. The same
control accepts `.doc`, `.docx`, `.xls`, `.xlsx` and `.csv`, and a row left
without one shows its Download greyed out, so a filing can be listed before it
is available. A filing hosted elsewhere — on BSE, say — still works: paste its
URL into the box under the upload button instead.

Adding next year's report is **+ Add document**, a title, a date and the file.

Documents are capped at 32 MB (`MAX_DOCUMENT_MB`) and images at 8 MB.
Downloads are named the way they were uploaded, without the collision-avoiding
token the stored file carries.

Uploads are streamed rather than buffered, so a 30 MB report is not held in
memory in one piece on its way to disk or to the bucket.

### Where content is stored

Two interchangeable backends, chosen by environment, so the whole thing is
testable on a laptop before it touches a cloud account:

| Backend            | Chosen when         | Content             | Uploads                                      |
| ------------------ | ------------------- | ------------------- | -------------------------------------------- |
| **File** (default) | `GCS_BUCKET` unset  | `content/site.json` | `content/uploads/`, served by `/media/[name]` |
| **Cloud Storage**  | `GCS_BUCKET` set    | one bucket object   | `uploads/` in the bucket, as public URLs      |

The file backend needs a **persistent disk**, so it suits local development and
anything with a volume to mount — point `CONTENT_DIR` at it.

Uploads deliberately do not go in `public/`: Next serves that directory as it
stood when the site was built, so a file written there afterwards is a 404.

If the store is ever unreachable or holding bad JSON the site falls back to the
copy in the repo and logs the reason — a broken store degrades the site to its
defaults rather than taking it down.

## Deploying to Cloud Run

The container serves the site and the admin panel; Cloud Storage holds
everything an admin saves, so the container itself stays stateless and a
redeploy never loses an edit.

**1. A bucket for the content.** Uploaded images and filings are served to the
public straight from it, so it needs public read:

```bash
gcloud storage buckets create gs://BUCKET --location=asia-south1 \
  --uniform-bucket-level-access
gcloud storage buckets add-iam-policy-binding gs://BUCKET \
  --member=allUsers --role=roles/storage.objectViewer
```

**2. Build and deploy.** The service account the revision runs as needs
`roles/storage.objectAdmin` on that bucket; credentials are picked up from it
automatically, so there is no key file to manage.

```bash
gcloud run deploy mcil-website --source . --region asia-south1 \
  --service-account SA@PROJECT.iam.gserviceaccount.com \
  --set-env-vars GCS_BUCKET=BUCKET \
  --set-secrets ADMIN_PASSWORD=mcil-admin-password:latest
```

Keep the password in Secret Manager rather than `--set-env-vars`, so it is not
readable from the service description.

Cloud Run will not accept a request body over 32 MB, which is why
`MAX_DOCUMENT_MB` defaults to 32 — a larger filing fails with a clear message
from the panel rather than a platform error. If MCIL ever files something
bigger, the fix is to upload it from the browser straight to the bucket with a
signed URL, which is a change to the upload route alone.

### Environment variables

| Variable               | Required | What it does                                                    |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `ADMIN_PASSWORD`       | yes      | The shared admin password. Unset, the panel refuses every login. |
| `ADMIN_SESSION_SECRET` | no       | Signs the session cookie. Defaults to `ADMIN_PASSWORD`.          |
| `GCS_BUCKET`           | no       | Set → keep content and uploads in this bucket instead of on disk.|
| `GCS_PREFIX`           | no       | Path prefix inside the bucket. Default: the bucket root.         |
| `CONTENT_DIR`          | no       | File backend directory. Default `./content`.                     |
| `MAX_DOCUMENT_MB`      | no       | Upload ceiling for filings. Default `32`, Cloud Run's own limit. |
| `CONTENT_CACHE_MS`     | no       | Hold the last store read this long. Default `0` — always fresh.  |
| `NEXT_OUTPUT`          | no       | `standalone` for the container build. Set by the Dockerfile.     |

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

Slide order, sector words, alt text, focal points and the standfirst are all
editable from `/admin` — the table below is where their defaults live, and
what the site falls back to when nothing has been saved.

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

### The opening sequence

The landing page opens with `SiteIntro`: M, C, I and L fly in from the four
corners along arcs that all turn the same way, the tagline opens under them,
and then **the whole lockup travels to the top-left and parks exactly on the
header's own mark** — the tagline dropping away on the way, since the header
does not carry it. The ground then fades out from under a logo that is already
sitting where it lives, so the hand-over to the real header mark is a
substitution rather than a dissolve.

The landing has to be exact or the substitution shows. It is measured at
runtime, not computed: `measureDock()` reads the live `.site-logo` rect and the
lockup's, and hands CSS an offset and a scale. The bar's left padding is
viewport-dependent, so a second copy of that sum would be a second thing to
keep right. Verified to land within 0.1px at 390, 768, 1280 and 1440px wide.

Timings live in both places and must stay in step: the constants at the top of
`SiteIntro.tsx` and the animations in the `Opening sequence` block of
`globals.css`.

Two exits, and the difference matters:

- **hand-over** — the normal one. Only `.intro-ground` fades; the logo holds at
  full strength because it is already in position.
- **dissolve** — for a run cut short by a key or a click before the dock
  began, or if there is no `.site-logo` to aim at. Nothing is lined up to hand
  over to, so the whole curtain blooms and blurs out, as it did before the dock
  existed.

The sequence is skipped entirely under `prefers-reduced-motion`, and plays once
per page **load** — navigating back to Home within a session does not replay it.

### The mark

The mark in the bar is the four letters cropped out of
`public/images/mcil-logo.png`. That file is the full lockup — letters over a
tagline — and the tagline at a 36px bar height would be a smudge, so the header
takes the letters alone.

The crop is done in CSS (`.site-logo`), off the same measurements `SiteIntro`
uses on the same file, so there is no second asset to keep in step. The source
geometry is written out in the rule: the file is 2022 x 778, the letters occupy
x 408-1725 at y 178, 328 tall. **Replacing the artwork means re-measuring in
both places.**

`LOGO_HEIGHT` in `src/lib/brand.ts` is how tall the mark renders, and with the
bar's padding it is what makes the header 68px — so `--header-h` has to stay in
step with it. Every page's top padding and the sticky sections are measured off
that token.

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

The rows that ship are **every filing from the old mcil.net** — 720 of them,
from 2012 on — generated into `src/lib/investor-report-docs.json` by
[`tools/old-reports/`](tools/old-reports/README.md). The files themselves live
in the bucket under `reports/`, copied there once by that folder's Cloud Shell
script, and each row links to `/reports/<sub-category>/<file>`, which sends the
visitor on to the bucket. New filings go through the admin panel as before: see
[Uploading filings](#uploading-filings).

**Archives.** Filings dated before 1 March 2018 (`ARCHIVE_BEFORE` in
`src/lib/investor-reports.ts`) are taken out of their sub-category and listed
under a fifth tab, Archives, which keeps the same sub-category chips. The date
alone decides it, so an old filing added from the admin panel files itself.

A row with a document renders a live download; a row without one keeps the same
Download control, inert. Nothing links back to mcil.net.

Rows sort newest-first on `date`, so entries can be added in any order, and
`REPORTS_PAGE_SIZE` sets how many show before "View All" expands the list in
place.

Each category is also an anchor — `/investors#financials`, `#compliance`,
`#letters`, `#policies`, `#archives` — which scrolls to the band and opens that
tab.

## Still to do

- Higher-resolution originals for `hero-1` and `hero-4` (above).
- The rest of the site: Media, Careers, Contact.
- The old reports listed in `tools/old-reports/CHECK-BY-HAND.md`: three whose
  file was missing on mcil.net too, and some dates worth confirming.
