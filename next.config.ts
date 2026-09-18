import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Cloud Run serves this behind its own proxy, and the container is built
   * once and run as-is — `standalone` emits a server bundle with only the
   * dependencies it actually needs.
   */
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
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
