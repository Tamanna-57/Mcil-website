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

There is no separate admin dashboard: the site is edited where it stands, the
way the KBI site is. Sign in and you land on the website itself with the admin
bar at the foot of the window. Switch on **Edit mode** and:

- **Text** — every outlined piece of text can be clicked and typed into. Text on
  a button (a stage pill, a team plate, a report tab) is edited with a
  double-click, so the button still works on a single click.
- **Images** — every photograph carries **Change image**; where the page has
  something to show without one (a customer's logo, a product plate) there is
  also a red **×** to remove it, and an empty slot offers **Add image**.
- **Lists** — point at a slide, a process stage, a customer, a team member, a
  product, a contact location, a highlight card or a report sub-category and
  its toolbar appears: **◀ ▶** to move it, **+ Add** to add another after it,
  **Delete** to remove it.
- **Reports** — on the investor page every filing shows its date, **Upload
  file** / **Replace file**, and **Delete**; each list opens on **+ Add
  report**. Old filings (before March 2018) move to Archives by their date.
- **Investor figures** — **Import annual report & update figures** (on the
  Annual Report list, or **Investor figures** in the bar) reads the latest
  annual report PDF, shows each figure beside the line it came from for
  checking, and on Apply updates the hero panel, the highlights, the
  performance chart and adds the report to the list.

Nothing is published until **Save changes**, which writes every changed
section and reloads the page. **Discard** throws the draft away. Moving to
another page keeps the draft and edit mode.

### Signing in

Set `ADMIN_PASSWORD` on the deployment and go to `/admin` (or the "Admin" link
in the footer). There are no per-user accounts — it is one shared password,
which is what a small office actually wants. With no password set every login
is refused rather than falling back to a default, so a deployment that forgot
the variable is closed rather than open.

To run it locally:

```bash
cp .env.example .env.local   # then fill in ADMIN_PASSWORD
npm run dev                  # http://localhost:3000/admin
```

### How editing works

The copy in `src/lib/*.ts` stays the baseline. What an admin saves is stored
separately, as an *override*, and merged over that baseline on every request.
A section nobody has edited keeps tracking the repo, so a copy change made in
code still reaches the site. Objects merge key by key; lists replace
wholesale, because a list is something an admin curates.

For a signed-in admin the site is wrapped in the editor
(`src/components/admin/EditBar.tsx`), which holds a draft of the whole
`SiteContent`. Sections read their data through `useDraft(path, value)`
(`src/lib/admin/draft.ts`), so the public get exactly what the server rendered
and an admin sees their unsaved draft.

### Making something editable

Components mark what can be edited with the helpers in
`src/lib/admin/editable.ts`, naming where the value lives in `SiteContent`:

- `edit("home.about.title")` on an element whose only child is the text;
- `editImage("about.team.members.2.image", { optional })` on an image;
- `editItem("about.team.members", i)` on each entry of a list, plus an entry
  in `src/lib/admin/lists.ts` saying what the entry is called and how a new
  one starts.

A new field goes into `SiteContent` in `src/lib/content/types.ts` with a
baseline in `src/lib/content/defaults.ts`; the component then reads it with
`useDraft` and marks it.

Documents are capped at 32 MB (`MAX_DOCUMENT_MB`) and images at 8 MB.

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

Slide order, sector words, photographs and the standfirst are all edited on
the page itself in edit mode — the table below is where their defaults live
(alt text and focal points included), and what the site falls back to when
nothing has been saved.

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
visitor on to the bucket. New filings are added on the investor page itself in
edit mode: see [The admin panel](#the-admin-panel).

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
