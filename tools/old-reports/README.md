# Old mcil.net reports

Everything the old site's investor section listed, carried over to the new one.

| File                        | What it is                                                                 |
| --------------------------- | -------------------------------------------------------------------------- |
| `old-site-index.json`       | Every row on the old site: its section, title, link and the date worked out for it |
| `build.py`                  | Turns the index into the three files below                                 |
| `copy-to-bucket.sh`         | Copies the files from mcil.net into the site's bucket. Generated           |
| `CHECK-BY-HAND.md`          | Rows with a missing file or a guessed date. Generated                      |
| `src/lib/investor-report-docs.json` | The rows the site lists. Generated                                 |

## Copying the files into the bucket (once)

1. Open [console.cloud.google.com](https://console.cloud.google.com), pick the
   project the site runs in, and click the **>_** button (Activate Cloud Shell)
   at the top right.
2. In the Cloud Shell window, open the **⋮** menu → **Upload**, and upload
   `copy-to-bucket.sh`.
3. Run it with the site's bucket name (the value of `GCS_BUCKET`):

   ```bash
   bash copy-to-bucket.sh YOUR-BUCKET-NAME
   ```

   If the site also sets `GCS_PREFIX`, add it as a second word.

It downloads about 740 MB from mcil.net into Cloud Shell and uploads it to
`gs://YOUR-BUCKET-NAME/reports/`. If anything fails to download it says so at
the end; running the same command again retries only what is missing.

## How the site uses them

Each row links to `/reports/<sub-category>/<file>`. With `GCS_BUCKET` set, that
route sends the visitor on to the file in the bucket; locally it serves
`content/reports/` instead.

Rows dated before `ARCHIVE_BEFORE` (1 March 2018, in
`src/lib/investor-reports.ts`) show under the **Archives** tab rather than in
their own sub-category.

## Where the dates come from

In order of preference: a full date in the title (`31.03.2015`), one in the
file name, a month and year (`April, 2016`), a year at the end of the title
(`Annual Report 2013`, taken as 31 December), and last the upload stamp the old
site put at the front of every file name. That stamp was written two ways over
the years (`DDMMYYYY` until 2019, unpadded `MDYYYY` after), so where it could
be read either way the row is listed in `CHECK-BY-HAND.md`.

## Changing something

Edit `old-site-index.json` (or `build.py`), then run
`python3 tools/old-reports/build.py`. Once the site is live, correct individual
rows in the admin panel instead.
