import { apiFetch } from "./api-fetch";

export type AccountType = "personal" | "organization";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  accountType: AccountType;
  organizationName: string | null;
  createdAt: string;
  organizationRole: "admin" | "user" | null;
  subscriptionStatus: string | null;
  hasActiveSubscription: boolean;
};

export class ApiAuthError extends Error {}

async function parseJsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiAuthError(data.error ?? "Une erreur est survenue.");
  }
  return data;
}

export async function signup(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: AccountType;
  organizationName?: string;
}) {
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

export async function updatePhone(phone: string) {
  const res = await apiFetch("/api/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = await parseJsonOrThrow(res);
  return data.user as CurrentUser;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  const res = await apiFetch("/api/auth/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow(res);
  return data.user as CurrentUser;
}

export async function forgotPassword(email: string) {
  const res = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await parseJsonOrThrow(res);
  return data.message as string;
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  const res = await apiFetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow(res);
  return data.message as string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const res = await apiFetch("/api/auth/me");

  if (res.status === 401) {
    return null;
  }

  const data = await parseJsonOrThrow(res);
  return data.user as CurrentUser;
}
