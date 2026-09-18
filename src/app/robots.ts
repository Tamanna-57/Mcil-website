import type { MetadataRoute } from "next";

/**
 * Keep the admin panel out of search results.
 *
 * The pages themselves already carry `robots: noindex`, but a crawler has to
 * fetch a page to read that; this stops it asking at all. It is not a security
 * measure — the panel is protected by the login, not by being unlisted.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
  };
}
