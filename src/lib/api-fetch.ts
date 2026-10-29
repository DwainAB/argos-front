import { API_URL } from "./config";

// Instance Clerk exposée sur window par <ClerkProvider> (voir layout.tsx) : permet de lire le
// token de session depuis une simple fonction, sans passer par le hook useAuth().
type ClerkGlobal = { session?: { getToken: () => Promise<string | null> } | null };

async function getSessionToken() {
  if (typeof window === "undefined") return null;
  const clerk = (window as unknown as { Clerk?: ClerkGlobal }).Clerk;
  return (await clerk?.session?.getToken()) ?? null;
}

// Frontend et backend sont sur deux domaines distincts : le cookie de session Clerk n'est
// pas envoyé au backend, le token est donc transmis explicitement dans l'en-tête Authorization.
export async function apiFetch(path: string, options?: RequestInit) {
  const token = await getSessionToken();
  const headers = new Headers(options?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}
