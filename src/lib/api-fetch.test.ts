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
});

describe("apiFetch", () => {
  it("préfixe le chemin avec l'URL de l'API", async () => {
    await apiFetch("/api/auth/me");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.ai-argos.com/api/auth/me",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("inclut toujours les credentials même si des options sont fournies", async () => {
    await apiFetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" } });

    expect(fetchMock).toHaveBeenCalledWith("https://api.ai-argos.com/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  });
});
