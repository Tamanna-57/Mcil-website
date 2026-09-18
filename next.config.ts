import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Images uploaded from the admin panel. With a persistent disk they land in
     * `public/uploads/` and need no entry here; on Vercel they go to Blob
     * storage and come back as an absolute URL, which next/image will only
     * optimise for a host it has been told about.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
