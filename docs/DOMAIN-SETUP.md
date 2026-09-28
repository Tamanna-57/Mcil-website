# Moving the site to a US region and attaching mcil.net

The plan, in one line: **deploy the same container again in `us-central1`,
check it, point `mcil.net` at it, then delete the Mumbai one.**

## Why

A Cloud Run service lives in exactly one region, and there is no "move"
button — you deploy it again somewhere else. Ours is in `asia-south1`
(Mumbai), and Google only offers its simple custom-domain mapping in a list of
regions that the Indian ones are not on. `us-central1` (Iowa) is on it.

The cost of moving is speed: every request from an Indian visitor now travels
to Iowa and back, roughly a quarter of a second before anything is drawn. If
that becomes a problem later, the fix is Firebase Hosting in front of the same
US service — its CDN caches pages near the visitor and buys the time back.
That can be added afterwards without redoing any of this.

## What "domain mapping" means

The service today only answers to the address Google generated for it. Domain
mapping is the link between the name and the service, and it has two halves:

- **DNS, at the registrar** — "mcil.net points at Google."
- **The mapping, in Cloud Run** — "a request arriving for mcil.net goes to the
  `mcil-website` service."

Both halves are needed. Google issues the HTTPS certificate as part of it, so
there is no certificate to buy.

## Before you start

You need:

- The Cloud project (number `943483190840`) with Owner or Editor rights.
- **Access to DNS for `mcil.net`** — the registrar login, or someone who has
  it. Everything up to step 5 works without it. Step 5 does not.

Find the values the current service uses:

```bash
gcloud config set project PROJECT_ID

gcloud run services describe mcil-website --region asia-south1 \
  --format='value(spec.template.spec.serviceAccountName)'
gcloud run services describe mcil-website --region asia-south1 \
  --format='value(spec.template.spec.containers[0].env)'
```

The first prints the service account (`SA@PROJECT.iam.gserviceaccount.com`),
the second includes `GCS_BUCKET` — the existing content bucket. Note both.

---

## Step 1 — A US bucket for the content

Admin-saved content and uploads live in a Cloud Storage bucket that is
currently in Mumbai. `src/lib/content/store.ts` reads it **on every request**,
so leaving it behind would put a Mumbai round trip in the path of every single
page view — the slow path twice over. Copy it to the US.

```bash
gcloud storage buckets create gs://NEW_BUCKET --location=us-central1 \
  --uniform-bucket-level-access

# Uploaded images and filings are served straight to browsers.
gcloud storage buckets add-iam-policy-binding gs://NEW_BUCKET \
  --member=allUsers --role=roles/storage.objectViewer

# The service writes to it when an admin saves.
gcloud storage buckets add-iam-policy-binding gs://NEW_BUCKET \
  --member=serviceAccount:SA@PROJECT.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin

# Copy everything across. The old bucket is not touched.
gcloud storage rsync -r gs://OLD_BUCKET gs://NEW_BUCKET
```

## Step 2 — Deploy to us-central1

This creates a **second** service. The Mumbai one keeps serving, untouched,
until you delete it yourself in step 6.

```bash
gcloud run deploy mcil-website --source . --region us-central1 \
  --service-account SA@PROJECT.iam.gserviceaccount.com \
  --set-env-vars GCS_BUCKET=NEW_BUCKET,CONTENT_CACHE_MS=30000 \
  --set-secrets ADMIN_PASSWORD=mcil-admin-password:latest \
  --allow-unauthenticated
```

`CONTENT_CACHE_MS=30000` holds the content file for 30 seconds instead of
re-reading it on every request. An admin edit then appears within half a minute
rather than instantly, which is a fair trade for not fetching the same file
hundreds of times a minute.

## Step 3 — Check the new service

It prints a `https://mcil-website-….us-central1.run.app` URL. Open it and go
through it properly before touching DNS:

- The landing page, and the images on it.
- The investor page — filings open, the PDF viewer works.
- `/admin` — log in, change something small, save, confirm it shows up.

If anything is wrong, fix it here. The live site is still on Mumbai and no
visitor has seen any of this yet.

## Step 4 — Prove you own mcil.net

Google will not map a domain to a service until it knows the domain is yours.

```bash
gcloud domains verify mcil.net
```

This opens [Search Console](https://search.google.com/search-console), which
gives you a **TXT record** to add at the registrar. Add it, come back, click
Verify. This is the first step that needs DNS access.

## Step 5 — Create the mapping, then point DNS

```bash
gcloud beta run domain-mappings create --service mcil-website \
  --domain mcil.net --region us-central1

gcloud beta run domain-mappings create --service mcil-website \
  --domain www.mcil.net --region us-central1
```

Do both. People type both.

Each command prints the DNS records to add. **Use the records it prints.** The
table below is only so you know what to expect:

| Record | Name  | Value                                              |
| ------ | ----- | -------------------------------------------------- |
| A      | `@`   | `216.239.32.21`, `.34.21`, `.36.21`, `.38.21`        |
| AAAA   | `@`   | the four `2001:4860:4802:…` addresses it prints      |
| CNAME  | `www` | `ghs.googlehosted.com.`                             |

**This is the moment the public switches over.** Do it when someone is around
to look at the result.

Then wait. DNS takes anywhere from a few minutes to a day to spread, and the
certificate is only issued once Google can see the records. Until it is issued
the domain shows a security warning — that is the certificate not being ready,
not a mistake. Check with:

```bash
gcloud beta run domain-mappings describe --domain mcil.net --region us-central1
```

Re-editing the DNS records while waiting is the most common way people break
this. Leave them alone.

## Step 6 — Clean up, once it has been fine for a few days

```bash
gcloud run services delete mcil-website --region asia-south1
gcloud storage rm -r gs://OLD_BUCKET
```

Keep the old bucket until you are certain the copy is complete and the admin
panel has been saving to the new one. Deleting it cannot be undone.

---

## If the site feels slow afterwards

That is the Iowa distance, and it is expected. Put Firebase Hosting in front of
the same service — it adds a CDN that caches pages near the visitor:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # same GCP project
```

In `firebase.json`, send everything to Cloud Run:

```json
{
  "hosting": {
    "public": "firebase-public",
    "rewrites": [
      { "source": "**", "run": { "serviceId": "mcil-website", "region": "us-central1" } }
    ]
  }
}
```

Then `firebase deploy --only hosting`, and move the domain over under
**Firebase Console → Hosting → Add custom domain**.

## Notes

- Cloud Run refuses requests whose Host header it does not recognise. That is
  why you cannot just point a CNAME at the `run.app` URL, and why putting
  Cloudflare in front of it does not work on the normal plans either.
- Keeping the service in Mumbai is possible — it needs a Global External
  Application Load Balancer instead of this mapping, which works from any
  region but costs roughly $18–25 a month whether anyone visits or not.
