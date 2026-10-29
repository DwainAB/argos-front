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
  subscriptionBlocked: boolean;
  paymentGraceDeadline: string | null;
};

export class ApiAuthError extends Error {}

// Session Clerk valide mais compte Argos AI pas encore configuré : le backend répond 403
// avec ce code tant que l'onboarding n'a pas été terminé.
export class OnboardingRequiredError extends Error {}

const ONBOARDING_REQUIRED = "ONBOARDING_REQUIRED";

async function parseJsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiAuthError(data.error ?? "Une erreur est survenue.");
  }
  return data;
}

// Crée le compte Argos AI d'un utilisateur déjà inscrit chez Clerk (type de compte,
// organisation). L'email n'est jamais envoyé : le backend le lit directement chez Clerk.
export async function completeOnboarding(input: {
  firstName: string;
  lastName: string;
  accountType: AccountType;
  organizationName?: string;
}) {
  const res = await apiFetch("/api/auth/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow(res);
  return data.user as CurrentUser;
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

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const res = await apiFetch("/api/auth/me");

  if (res.status === 401) {
    return null;
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 403 && data.code === ONBOARDING_REQUIRED) {
    throw new OnboardingRequiredError();
  }
  if (!res.ok) {
    throw new ApiAuthError(data.error ?? "Une erreur est survenue.");
  }
  return data.user as CurrentUser;
}
