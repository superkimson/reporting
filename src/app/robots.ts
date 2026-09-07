import type { MetadataRoute } from "next";

// Outil interne : on bloque toute indexation par les moteurs de recherche.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
