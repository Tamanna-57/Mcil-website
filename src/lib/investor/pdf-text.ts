import "server-only";

/**
 * Pulls the text out of an uploaded PDF, one string per page.
 *
 * pdf.js is loaded through its `legacy` build and only when a report is
 * actually being imported. The legacy build is the one that runs under plain
 * Node without a DOM, and deferring the import keeps roughly ten megabytes of
 * parser out of every other request the server handles.
 *
 * Text only — no rendering, no canvas, no fonts drawn. A scanned report that
 * carries no text layer comes back empty, which `extract.ts` reports as
 * "nothing found" rather than guessing.
 */

/** Guards against a pathological PDF holding the request open indefinitely. */
const MAX_PAGES = 400;

export type PdfText = {
  /** One entry per page, in order. */
  pages: string[];
  /** Every page joined, which is what the label matching runs over. */
  text: string;
  pageCount: number;
};

type TextItem = { str?: string; hasEOL?: boolean };

/**
 * Where pdf.js keeps the fourteen standard PDF fonts.
 *
 * Resolved from the installed package rather than hard-coded, so it survives a
 * bundler moving `node_modules` around. A trailing slash is required — pdf.js
 * appends the font's filename to this directly. Returning undefined on failure
 * costs nothing but a warning.
 */
async function standardFontsDir(): Promise<string | undefined> {
  const { createRequire } = await import("node:module");
  const path = await import("node:path");

  /* This module is bundled into a server chunk, so `import.meta.url` points
     somewhere inside .next rather than at the app — resolving from the working
     directory finds node_modules in both a normal and a standalone build. */
  const bases = [path.join(process.cwd(), "package.json"), import.meta.url];

  for (const base of bases) {
    try {
      const entry = createRequire(base).resolve("pdfjs-dist/package.json");
      /* Under Node pdf.js reads these off disk, so this is a plain path and
         not a file:// URL. The trailing separator is required — pdf.js appends
         the font's filename to it directly. */
      return `${path.join(path.dirname(entry), "standard_fonts")}${path.sep}`;
    } catch {
      /* Try the next base; a miss only costs a warning. */
    }
  }
  return undefined;
}

export async function readPdfText(bytes: Uint8Array): Promise<PdfText> {
  /* The legacy ESM build: Node-compatible, no DOM required. */
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const doc = await pdfjs.getDocument({
    data: bytes,
    /* Nothing is drawn, so neither of these needs to fetch anything. */
    useSystemFonts: false,
    disableFontFace: true,
    /* Never evaluate code embedded in the document. */
    isEvalSupported: false,
    /* Text extraction does not render a glyph, but pdf.js still warns on every
       document that uses a standard font unless it is told where they live. */
    standardFontDataUrl: await standardFontsDir(),
  }).promise;

  const pageCount = Math.min(doc.numPages, MAX_PAGES);
  const pages: string[] = [];

  for (let n = 1; n <= pageCount; n += 1) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    let out = "";
    for (const item of content.items as TextItem[]) {
      if (typeof item.str !== "string") continue;
      out += item.str;
      if (item.hasEOL) out += "\n";
    }
    pages.push(out);
    /* Release the page's operator list rather than holding every page of a
       200-page report in memory at once. */
    page.cleanup();
  }

  await doc.destroy();

  return { pages, text: pages.join("\n"), pageCount };
}
