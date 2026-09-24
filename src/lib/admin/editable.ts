/**
 * Markers for the in-page editor.
 *
 * A component spreads one of these onto the element that renders a piece of
 * editable content, naming where that content lives in `SiteContent` as a dot
 * path ("home.about.title", "about.team.members.2.bio"). For the public the
 * attribute is inert; a signed-in admin's edit bar (components/admin/EditBar)
 * finds the marked elements and makes them editable in place.
 *
 * Nothing here runs any code, so server and client components can both use it.
 */

type EditOptions = {
  /** Paragraphs separated by a blank line — Enter makes a new paragraph. */
  multiline?: boolean;
  /**
   * Edited as source text in a small box rather than in place: for text whose
   * stored form differs from what is shown (the product body's {underline}
   * markers), and for text inside a button, where the browser will not put a
   * caret.
   */
  raw?: boolean;
};

export function edit(path: string, options: EditOptions = {}) {
  return {
    "data-edit": path,
    ...(options.multiline ? { "data-edit-multiline": "" } : {}),
    ...(options.raw ? { "data-edit-raw": "" } : {}),
  };
}

type ImageOptions = {
  /**
   * The picture may be taken away, and the page has something to show in its
   * place (a customer's typeset name, a product plate's placeholder). Removing
   * it deletes the value at `removes` — by default the path itself.
   */
  optional?: boolean;
  /** What "Remove" deletes, when that is more than the `src` itself. */
  removes?: string;
  /** Nothing is there yet: the button offers to add a picture. */
  empty?: boolean;
};

/** Marks an image whose `src` is stored at `path`. */
export function editImage(path: string, options: ImageOptions = {}) {
  return {
    "data-edit-image": path,
    ...(options.optional || options.removes
      ? { "data-edit-image-removes": options.removes ?? path }
      : {}),
    ...(options.empty ? { "data-edit-image-empty": "" } : {}),
  };
}

/**
 * Marks one entry of an editable list — a slide, a team member, a customer.
 * In edit mode, pointing at it brings up its toolbar: move it, add another
 * after it, or delete it. `list` is the list's path; `index` is where this
 * entry sits in it as stored.
 */
export function editItem(list: string, index: number) {
  return { "data-edit-item": list, "data-edit-index": index };
}
