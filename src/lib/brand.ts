/**
 * Brand assets.
 *
 * The header is set on `--navy` (see globals.css), the same ground the logo
 * artwork uses, so the mark sits on its own colour on every page.
 *
 * TO FIT THE LOGO: save the artwork into `public/images/`, then set `src`
 * below along with its real pixel dimensions. Prefer an SVG, or a PNG with a
 * TRANSPARENT background — the square navy-backed version would put a navy
 * block on a navy bar, and any mismatch in the two navies would show as a
 * patch. Until `src` is set the header sets the wordmark in type, as it does
 * today.
 */
export const logo: {
  /** Path under `public/`. Undefined until the artwork is added. */
  src?: string;
  alt: string;
  /** The artwork's own pixel dimensions, for the aspect ratio. */
  width: number;
  height: number;
} = {
  // src: "/images/mcil-logo.svg",
  alt: "Metal Coatings (India) Limited",
  width: 132,
  height: 34,
};

/** Rendered height of the logo in the header, px. Sets the header's height
    together with its padding, so `--header-h` must stay in step with it. */
export const LOGO_HEIGHT = 36;
