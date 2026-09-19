/**
 * Brand assets.
 *
 * The header bar and the footer are both set on `--navy` (globals.css), the
 * ground the logo artwork itself uses, so the mark sits on its own colour
 * wherever it appears.
 *
 * The mark is `public/images/mcil-mark.png`: the monogram alone, white on
 * transparent. It is cut from the supplied artwork rather than used as
 * supplied, because that file carries its own navy background — a shade off
 * the bar's own — which would show as a patch behind the mark. With a
 * transparent mark the same file serves the navy bar, the navy footer and
 * anything else it is ever set on.
 *
 * The company name under it is real text, not part of the image: at this size
 * type set by the browser stays crisp where a scaled-down raster goes soft,
 * and it can be read aloud, selected and translated.
 */

/**
 * Rendered height of the mark, px.
 *
 * The mark and the line under it together set the bar's height, so
 * `--header-h` in globals.css has to stay in step with this: every page's
 * top padding and every sticky section is measured from that token, and a
 * bar taller than it slides over the top of the page. See `.site-logo` and
 * `.site-wordmark` there.
 */
export const LOGO_HEIGHT = 58;

/** Set small under the mark, and the link's accessible name. */
export const LOGO_NAME = "Metal Coatings (India) Limited";
export const LOGO_LINE = "Metal Coatings (India) Ltd";
