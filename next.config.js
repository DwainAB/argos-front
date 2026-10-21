// Content-Security-Policy : liste blanche des origines autorisées pour chaque type de
// ressource chargée par le site. Toute source non listée est bloquée par le navigateur —
// première ligne de défense contre l'injection de scripts malveillants (XSS).
//
// Origines externes réellement utilisées par l'app (vérifié dans le code) :
// - accounts.google.com : SDK Google Identity Services (bouton "Continuer avec Google")
// - avatars.githubusercontent.com : avatars affichés pour les installations/connexions GitHub
// - l'API backend (NEXT_PUBLIC_API_URL) : tous les appels fetch (apiFetch) et les popups
//   OAuth GitHub/GitLab, qui redirigent vers ce domaine avant de revenir
// - va.vercel-scripts.com / vitals.vercel-insights.com : script et envoi des mesures de
//   @vercel/analytics (mesure d'audience, voir layout.tsx)
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' nécessaire pour les styles injectés par Next.js lui-même (CSS-in-JS des
  // styles globaux) ; 'unsafe-eval' pour le hot-reload en développement uniquement.
  "script-src 'self' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://avatars.githubusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self' ${apiUrl} https://accounts.google.com https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
  `frame-src https://accounts.google.com`,
  // Empêche le site d'être affiché dans une <iframe> sur un autre domaine (clickjacking) —
  // équivalent CSP de l'en-tête X-Frame-Options: DENY, plus flexible (frame-ancestors 'self'
  // autoriserait un cadrage par le site lui-même si jamais utile, DENY ici car jamais le cas).
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Filet de sécurité redondant avec frame-ancestors ci-dessus, pour les navigateurs plus
  // anciens qui ne supportent pas encore cette directive CSP.
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le navigateur de réinterpréter un fichier dans un type différent de celui
  // déclaré par le serveur (ex: un fichier uploadé comme image exécuté comme script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // N'envoie l'URL complète de la page d'origine qu'aux liens internes au même site ;
  // seulement l'origine (pas le chemin complet, potentiellement sensible) vers l'extérieur.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS pendant 2 ans, y compris pour les sous-domaines, et accepte l'inclusion dans
  // la liste de préchargement HSTS des navigateurs (jamais de connexion HTTP en clair, même
  // la toute première visite).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Désactive l'accès à la caméra/micro/géolocalisation : aucune fonctionnalité du produit
  // n'en a besoin.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
