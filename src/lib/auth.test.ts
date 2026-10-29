import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./api-fetch", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "./api-fetch";
import { ApiAuthError, completeOnboarding, getCurrentUser, OnboardingRequiredError, updatePhone } from "./auth";

function mockResponse(data: unknown, ok = true, status = ok ? 200 : 400) {
  return { ok, status, json: async () => data } as Response;
}

beforeEach(() => {
  vi.mocked(apiFetch).mockReset();
});

describe("completeOnboarding", () => {
  it("envoie le type de compte et les noms, et renvoie l'utilisateur créé", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1" } }, true, 201));

    const input = { firstName: "Jean", lastName: "Dupont", accountType: "organization" as const, organizationName: "Acme" };
    const user = await completeOnboarding(input);

    expect(apiFetch).toHaveBeenCalledWith("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(user).toEqual({ id: "u-1" });
  });

  it("lève une ApiAuthError avec le message du serveur en cas d'échec", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ error: "Un compte existe déjà avec cet email." }, false, 409));

    const promise = completeOnboarding({ firstName: "Jean", lastName: "Dupont", accountType: "personal" });
    await expect(promise).rejects.toBeInstanceOf(ApiAuthError);
    await expect(promise).rejects.toThrow("Un compte existe déjà avec cet email.");
  });
});

describe("updatePhone", () => {
  it("met à jour le numéro de téléphone", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1", phone: "+33600000000" } }));

    const user = await updatePhone("+33600000000");

    expect(apiFetch).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({ method: "PATCH" }));
    expect(user.phone).toBe("+33600000000");
  });
});

describe("getCurrentUser", () => {
  it("renvoie null si la réponse est 401 (non connecté)", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({}, false, 401));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("renvoie l'utilisateur courant si connecté", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1" } }));

    await expect(getCurrentUser()).resolves.toEqual({ id: "u-1" });
  });

  it("lève une OnboardingRequiredError si le compte Argos AI n'est pas encore configuré", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ code: "ONBOARDING_REQUIRED" }, false, 403));

    await expect(getCurrentUser()).rejects.toBeInstanceOf(OnboardingRequiredError);
  });

  it("lève une erreur pour tout autre statut d'échec", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ error: "Erreur serveur." }, false, 500));

    await expect(getCurrentUser()).rejects.toThrow("Erreur serveur.");
  });
});
