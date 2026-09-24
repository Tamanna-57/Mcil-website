/**
 * Where a filing opens for reading, as opposed to where it downloads from.
 *
 * The stored files are all sent as attachments — a Download click should land
 * in the visitor's downloads — so a title click needs a URL that serves the
 * same file inline instead, for the browser's own PDF viewer:
 *
 * * `/reports/<sub>/<file>.pdf` (the filings carried over from mcil.net) and
 *   uploads in the bucket → `/view/<object path>`, which streams the object
 *   back inline.
 * * `/media/<file>.pdf` (uploads on the file backend) → the same route with
 *   `?view=1`.
 * * A PDF hosted elsewhere, on BSE say, opens where it is.
 *
 * Only PDFs have a view; a Word or Excel file has nothing a browser can show,
 * so its title is left plain and Download is the way to it.
 */
export function viewUrlFor(href: string | undefined): string | null {
  if (!href) return null;

  let path: string;
  let external = false;
  try {
    const url = new URL(href, "http://site.invalid");
    external = url.host !== "site.invalid";
    path = url.pathname;
  } catch {
    return null;
  }
  if (!/\.pdf$/i.test(path)) return null;

  if (!external) {
    if (path.startsWith("/reports/")) return `/view${path}`;
    if (path.startsWith("/media/")) return `${path}?view=1`;
    return null;
  }

  // An upload in our bucket: keep the object path from `uploads/` or
  // `reports/` on, since the route adds the bucket and any prefix itself.
  if (href.startsWith("https://storage.googleapis.com/")) {
    const object = path.match(/\/((?:uploads|reports)\/.+)$/)?.[1];
    if (object) return `/view/${object}`;
  }

  return href;
}
