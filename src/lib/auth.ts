import { apiFetch } from "./api-fetch";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
};

// Erreur portant le message renvoyé par le backend (ex: "Email déjà utilisé"), pour
// affichage direct dans le formulaire concerné.
export class ApiAuthError extends Error {}

async function parseJsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiAuthError(data.error ?? "Une erreur est survenue.");
  }
  return data;
}

export async function signup(input: { email: string; password: string; firstName: string; lastName: string }) {
  const res = await apiFetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow(res);
  return data.user as CurrentUser;
}

export async function login(input: { email: string; password: string }) {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow(res);
  return data.user as CurrentUser;
}

export async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

// Renvoie l'utilisateur courant, ou null si aucune session valide (401) — distinct d'une
// erreur réseau, qui est propagée à l'appelant.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const res = await apiFetch("/api/auth/me");

  if (res.status === 401) {
    return null;
  }

  const data = await parseJsonOrThrow(res);
  return data.user as CurrentUser;
}
