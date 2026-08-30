import { API_URL } from "./config";

// Wrapper autour de fetch pour tous les appels vers l'API backend : préfixe API_URL et
// inclut systématiquement le cookie de session (credentials: "include"), nécessaire
// depuis que les routes API sont protégées par authentification (voir auth.middleware.ts
// côté backend). path doit commencer par "/" (ex: "/api/projects").
export function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
  });
}
