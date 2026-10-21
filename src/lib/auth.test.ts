import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./api-fetch", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "./api-fetch";
import {
  ApiAuthError,
  changePassword,
  forgotPassword,
  getCurrentUser,
  login,
  loginWithGithub,
  loginWithGitlab,
  loginWithGoogle,
  logout,
  resetPassword,
  signup,
  updatePhone,
} from "./auth";

function mockResponse(data: unknown, ok = true, status = ok ? 200 : 400) {
  return { ok, status, json: async () => data } as Response;
}

beforeEach(() => {
  vi.mocked(apiFetch).mockReset();
});

describe("signup", () => {
  it("envoie les données d'inscription et renvoie l'utilisateur créé", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1", email: "a@b.com" } }));

    const user = await signup({
      email: "a@b.com",
      password: "secret",
      firstName: "Jean",
      lastName: "Dupont",
      accountType: "personal",
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/api/auth/signup",
      expect.objectContaining({ method: "POST" }),
    );
    expect(user).toEqual({ id: "u-1", email: "a@b.com" });
  });

  it("lève une ApiAuthError si l'inscription échoue", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ error: "Email déjà utilisé." }, false, 409));

    await expect(
      signup({ email: "a@b.com", password: "x", firstName: "J", lastName: "D", accountType: "personal" }),
    ).rejects.toThrow(ApiAuthError);
  });
});

describe("login", () => {
  it("connecte l'utilisateur", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1" } }));

    const user = await login({ email: "a@b.com", password: "secret" });

    expect(user).toEqual({ id: "u-1" });
  });

  it("lève une erreur avec le message du serveur si les identifiants sont invalides", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ error: "Identifiants invalides." }, false, 401));

    await expect(login({ email: "a@b.com", password: "mauvais" })).rejects.toThrow("Identifiants invalides.");
  });
});

describe("logout", () => {
  it("appelle la route de déconnexion", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({}));

    await logout();

    expect(apiFetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
  });
});

describe("loginWithGoogle / loginWithGitlab / loginWithGithub", () => {
  it("transmet l'idToken Google tel quel", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1" } }));

    await loginWithGoogle("google-id-token");

    const [, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(JSON.parse(options!.body as string)).toEqual({ idToken: "google-id-token" });
  });

  it("transmet les identifiants GitLab", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1" } }));

    await loginWithGitlab({ gitlabUserId: 42, gitlabUserEmail: "x@y.com" });

    const [, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(JSON.parse(options!.body as string)).toEqual({ gitlabUserId: 42, gitlabUserEmail: "x@y.com" });
  });

  it("transmet les identifiants GitHub", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1" } }));

    await loginWithGithub({ githubUserId: 7, githubUserEmail: null });

    const [, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(JSON.parse(options!.body as string)).toEqual({ githubUserId: 7, githubUserEmail: null });
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

describe("changePassword", () => {
  it("envoie l'ancien et le nouveau mot de passe", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ user: { id: "u-1" } }));

    await changePassword({ currentPassword: "ancien", newPassword: "nouveau" });

    const [, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(JSON.parse(options!.body as string)).toEqual({ currentPassword: "ancien", newPassword: "nouveau" });
  });
});

describe("forgotPassword / resetPassword", () => {
  it("renvoie le message de confirmation pour forgotPassword", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ message: "Email envoyé." }));

    const message = await forgotPassword("a@b.com");

    expect(message).toBe("Email envoyé.");
  });

  it("renvoie le message de confirmation pour resetPassword", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ message: "Mot de passe réinitialisé." }));

    const message = await resetPassword({ token: "tok-1", newPassword: "nouveau" });

    expect(message).toBe("Mot de passe réinitialisé.");
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

  it("lève une erreur pour tout autre statut d'échec", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ error: "Erreur serveur." }, false, 500));

    await expect(getCurrentUser()).rejects.toThrow("Erreur serveur.");
  });
});
