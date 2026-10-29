import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./config", () => ({ API_URL: "https://api.ai-argos.com" }));

import { apiFetch } from "./api-fetch";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockResolvedValue({ ok: true } as Response);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as unknown as { Clerk?: unknown }).Clerk;
});

function lastCallOptions() {
  return fetchMock.mock.calls[0][1] as RequestInit & { headers: Headers };
}

describe("apiFetch", () => {
  it("préfixe le chemin avec l'URL de l'API et inclut toujours les credentials", async () => {
    await apiFetch("/api/auth/me");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.ai-argos.com/api/auth/me",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("conserve la méthode et les en-têtes fournis", async () => {
    await apiFetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" } });

    expect(lastCallOptions().method).toBe("POST");
    expect(lastCallOptions().headers.get("Content-Type")).toBe("application/json");
  });

  it("n'ajoute pas d'en-tête Authorization sans session Clerk", async () => {
    await apiFetch("/api/auth/me");

    expect(lastCallOptions().headers.has("Authorization")).toBe(false);
  });

  it("ajoute le token de session Clerk en en-tête Authorization", async () => {
    (window as unknown as { Clerk: unknown }).Clerk = { session: { getToken: async () => "clerk-token" } };

    await apiFetch("/api/auth/me");

    expect(lastCallOptions().headers.get("Authorization")).toBe("Bearer clerk-token");
  });
});
