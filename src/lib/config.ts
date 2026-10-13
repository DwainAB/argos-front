// Slash final retiré si présent : une variable d'environnement mal configurée avec un "/"
// en fin (ex: "https://api.example.com/") produirait sinon un "//" au début de chaque appel
// (apiFetch, popups OAuth), qui a déjà cassé le login GitLab/GitLab en production.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
