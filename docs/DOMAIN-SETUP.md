# Putting the site on mcil.net

Plain-English notes on how the running Cloud Run service becomes
`https://mcil.net`, what each option costs, and the exact commands.

Today the site runs here:

```
https://mcil-website-943483190840.asia-south1.run.app
```

`asia-south1` is Google's Mumbai region. That is the fastest place to serve
visitors in India, and it is also the reason the simple domain button in the
console is greyed out.

## The problem in one paragraph

A Cloud Run service is tied to one region. Google's simplest way of attaching a
custom domain — **Cloud Run → Manage custom domains → Add mapping** — is only
offered in a list of regions, and the Indian regions (`asia-south1` Mumbai,
`asia-south2` Delhi) are not on that list. So the easy button is not available
to us where the service currently lives. Nothing is broken; it is just a
feature Google has not switched on for those regions.

There are three honest ways out. They are all normal, supported setups.

---

## The three options

### Option A — Keep the service in Mumbai, put a Load Balancer in front

A Global External Application Load Balancer is a Google-run front door with its
own fixed public IP address. You point `mcil.net` at that IP. The load balancer
holds the SSL certificate (Google renews it for free, forever) and forwards
every request to the Cloud Run service — **in any region, Mumbai included**.

- Fastest for Indian visitors — the site stays in Mumbai.
- No change to the app, the bucket, or the deployment at all.
- Costs money even when idle: roughly **$18–25 a month** for the forwarding
  rule and IP, plus traffic. (Ballpark — confirm on Google's pricing page.)
- Most moving parts to set up (about six console screens).

This is what Google's own documentation recommends for production.

### Option B — Redeploy the service in a US region, use the simple domain mapping

We deploy the exact same container to `us-central1` (Iowa), then use the
greyed-out button, which is available there. You add a few DNS records and
Google issues the certificate.

- Nearly free — no load balancer bill.
- Simplest to set up and to hand over to someone else later.
- **Slower for Indian visitors.** Every page request travels India → Iowa →
  India, which adds roughly a quarter of a second before anything is drawn.
- Needs the content bucket moved too, or the site gets *twice* as slow. See
  "The bucket catch" below — this part is easy to miss.

### Option C — US region + Firebase Hosting in front

Deploy to `us-central1` as in Option B, then let Firebase Hosting serve
`mcil.net` and forward to Cloud Run. Firebase gives a free global CDN, so pages
are cached near the visitor and the India → US distance mostly stops mattering.

- Free tier is generous; likely ₹0 for a site this size.
- Fast for visitors, because of the CDN.
- One more Google product in the stack to understand and maintain.
- Firebase only forwards to Cloud Run in certain regions; `us-central1` is
  supported. Check the current list before relying on it.

### What to pick

**If the budget can carry ~$20/month, pick A.** The audience is in India, the
service is already in India, and nothing in the app has to change. The cost
buys you the shortest path and the fewest surprises.

**If it must be free, pick C** (not plain B) — the CDN buys back the speed that
moving to Iowa costs.

Plain B is the right answer only if you want the absolute simplest thing and
accept a visibly slower site.

---

## The bucket catch (applies to B and C only)

Admin-saved content lives in a Cloud Storage bucket created in `asia-south1`,
and `src/lib/content/store.ts` reads it **on every request** by default
(`CONTENT_CACHE_MS` is `0`).

If the service moves to Iowa while the bucket stays in Mumbai, every single
page view does a round trip back to India just to read the content file. That
is the slow path twice over. So if you move the service, also:

1. Create a bucket in the US (or a multi-region one) and copy the contents
   across.
2. Point `GCS_BUCKET` at the new one.
3. Set `CONTENT_CACHE_MS=30000` so the content file is held for 30 seconds
   instead of being re-fetched every request. An admin edit then shows up
   within half a minute rather than instantly — a fair trade.

Uploaded images are served to browsers directly from `storage.googleapis.com`,
so those are fine either way.

---

## Commands

Run these in Cloud Shell (the `>_` icon in the Cloud Console), from a checkout
of this repository. Replace `PROJECT`, `SA`, `BUCKET` with the real values.

### Option A — Load balancer in front of the Mumbai service

Nothing to redeploy. In the console:

1. **Network Services → Load balancing → Create load balancer**
2. Application Load Balancer → **External** → **Global**
3. **Backend configuration** → create a backend service of type **Serverless
   network endpoint group**, pointing at the Cloud Run service
   `mcil-website` in `asia-south1`. Turn Cloud CDN on while you are there.
4. **Frontend configuration** → protocol HTTPS, reserve a **new static IPv4
   address**, and create a **Google-managed certificate** listing both
   `mcil.net` and `www.mcil.net`.
5. Add a second frontend on HTTP port 80 so plain `http://` visitors get
   redirected up to HTTPS.
6. Create it, then copy the static IP it hands you.

Then at whoever hosts DNS for `mcil.net`:

| Record | Name  | Value                   |
| ------ | ----- | ----------------------- |
| A      | `@`   | the static IP from step 6 |
| A      | `www` | the same static IP        |

The certificate goes from PROVISIONING to ACTIVE once DNS has propagated —
usually under an hour, occasionally up to a day. The site is not reachable on
the domain until it turns ACTIVE. That wait is normal; do not start changing
things.

### Option B / C — redeploy in a US region

```bash
# 1. A US bucket for the content, and a copy of what is already saved.
gcloud storage buckets create gs://NEW_BUCKET --location=us-central1 \
  --uniform-bucket-level-access
gcloud storage buckets add-iam-policy-binding gs://NEW_BUCKET \
  --member=allUsers --role=roles/storage.objectViewer
gcloud storage rsync -r gs://OLD_BUCKET gs://NEW_BUCKET

# 2. Let the service account write to it.
gcloud storage buckets add-iam-policy-binding gs://NEW_BUCKET \
  --member=serviceAccount:SA@PROJECT.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin

# 3. Deploy the same source to Iowa. This creates a SECOND service; the
#    Mumbai one keeps running untouched until you are happy.
gcloud run deploy mcil-website --source . --region us-central1 \
  --service-account SA@PROJECT.iam.gserviceaccount.com \
  --set-env-vars GCS_BUCKET=NEW_BUCKET,CONTENT_CACHE_MS=30000 \
  --set-secrets ADMIN_PASSWORD=mcil-admin-password:latest \
  --allow-unauthenticated
```

Open the new `*.us-central1.run.app` URL it prints and check the site, the
images, and `/admin` before going any further.

**Option B — attach the domain:**

```bash
gcloud beta run domain-mappings create --service mcil-website \
  --domain mcil.net --region us-central1
gcloud beta run domain-mappings create --service mcil-website \
  --domain www.mcil.net --region us-central1
```

Google first asks you to prove you own `mcil.net` (a TXT record, through
[Search Console](https://search.google.com/search-console)). It then prints the
DNS records to add. **Use the records it prints**, not the ones below — these
are only here so you know what to expect:

| Record | Name  | Value                                          |
| ------ | ----- | ---------------------------------------------- |
| A      | `@`   | `216.239.32.21` … `.34.21` … `.36.21` … `.38.21` |
| CNAME  | `www` | `ghs.googlehosted.com.`                        |

**Option C — put Firebase Hosting in front instead:**

```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # pick the same GCP project
```

In the generated `firebase.json`, replace the `hosting` block's rewrites so
everything goes to Cloud Run:

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

Then `firebase deploy --only hosting`, and add `mcil.net` under
**Firebase Console → Hosting → Add custom domain**, which walks you through the
DNS records.

### Afterwards

Once `https://mcil.net` is live and has been fine for a few days:

```bash
gcloud run services delete mcil-website --region asia-south1   # options B/C only
gcloud storage rm -r gs://OLD_BUCKET                           # only after checking the copy
```

Keep the old bucket until you are certain. Deleting it is not reversible.

---

## Things that will trip you up

- **DNS is not instant.** After adding records, wait. Checking every two
  minutes and re-editing the records is the most common way people break this.
- **The certificate must say ACTIVE.** Until then the domain shows a security
  warning. That is the certificate not being ready, not a misconfiguration.
- **Both `mcil.net` and `www.mcil.net`** need setting up. People type both.
- **`mcil.net` is currently serving the old site**, so switching DNS is the
  moment the public sees the new one. Do it when someone is around to look.
- **Cloud Run rejects requests whose Host header it does not recognise**, which
  is why you cannot simply CNAME the domain at the `run.app` URL, and why a
  plain Cloudflare proxy in front of it does not work either.
