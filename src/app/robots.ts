import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-argos.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Le dashboard est une zone privée (derrière connexion) : aucun intérêt à ce qu'un
      // moteur de recherche l'indexe, et ça éviterait au passage qu'une page interne
      // apparaisse par erreur dans des résultats de recherche avant que l'auth ne la bloque.
      disallow: "/dashboard",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
