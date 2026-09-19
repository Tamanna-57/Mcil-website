import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Cloud Run serves this behind its own proxy, and the container is built
   * once and run as-is — `standalone` emits a server bundle with only the
   * dependencies it actually needs.
   */
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  /*
   * pdf.js is loaded from node_modules at run time rather than bundled.
   *
   * It resolves its own worker and its standard font files by path, relative
   * to wherever the package itself sits. Bundled into a server chunk those
   * paths point at files the bundler never emitted, and reading an annual
   * report fails with "Setting up fake worker failed". Marking it external
   * leaves the package intact, which is what its own resolution expects.
   */
  serverExternalPackages: ["pdfjs-dist"],
  /*
   * ...and the two things it reaches for by path, which nothing imports.
   *
   * A `standalone` build copies only the files Next can trace through imports.
   * pdf.js loads its worker and its standard font files at run time by building
   * a path, so neither is traced, and the Cloud Run image would ship the parser
   * without the worker it cannot start without — working locally and failing
   * only once deployed. Naming them here puts them in the image.
   */
  outputFileTracingIncludes: {
    "/api/admin/investor/extract": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/pdfjs-dist/standard_fonts/**",
    ],
  },
  images: {
    /*
     * Images uploaded from the admin panel. With a persistent disk they are
     * served from this same origin and need no entry here; on Cloud Storage
     * they come back as an absolute URL, which next/image will only optimise
     * for a host it has been told about.
     */
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "*.storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
