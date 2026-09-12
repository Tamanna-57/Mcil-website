/**
 * Brand assets.
 *
 * The header bar is set on `--navy` (globals.css), the ground the logo artwork
 * itself uses, so the mark sits on its own colour on every page.
 *
 * The mark in the bar is the four letters cropped out of
 * `public/images/mcil-logo.png`. That file is the full lockup — letters over a
 * tagline — and the tagline at a 36px bar height would be a smudge, so the
 * header takes the letters alone. The crop is done in CSS (`.site-logo`) off
 * the same measurements `SiteIntro` uses on the same file, so there is no
 * second asset to keep in step with this one.
 *
 * If the artwork is ever replaced, re-measure in both places.
 */

/**
 * Rendered height of the mark, px. With the bar's padding this is what makes
 * the header 68px, so `--header-h` has to stay in step with it — every page's
 * top padding and the sticky sections are measured off that token.
 */
export const LOGO_HEIGHT = 36;

/** The link's accessible name; the mark itself is a background image. */
export const LOGO_NAME = "Metal Coatings (India) Limited";
