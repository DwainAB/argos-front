import type { MetadataRoute } from "next";

// Uniquement les pages publiques, accessibles sans connexion — le dashboard (derrière
// authentification) n'a pas de sens à être indexé par un moteur de recherche, voir
// robots.ts qui le lui interdit explicitement par ailleurs.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-argos.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/login", "/signup"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.5,
  }));
}
