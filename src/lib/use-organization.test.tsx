import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("./api-fetch", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "./api-fetch";
import { useOrganization } from "./use-organization";

beforeEach(() => {
  vi.mocked(apiFetch).mockReset();
});

describe("useOrganization", () => {
  it("charge l'organisation au montage", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: async () => ({ organization: { id: "org-1", name: "Ma Société" } }),
    } as Response);

    const { result } = renderHook(() => useOrganization());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.organization).toEqual({ id: "org-1", name: "Ma Société" });
    expect(result.current.error).toBeNull();
  });

  it("renvoie organization à null et expose le message d'erreur si la requête échoue", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Vous n'appartenez à aucune organisation." }),
    } as Response);

    const { result } = renderHook(() => useOrganization());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.organization).toBeNull();
    expect(result.current.error).toBe("Vous n'appartenez à aucune organisation.");
  });

  it("recharge via refetch", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: false, json: async () => ({}) } as Response);

    const { result } = renderHook(() => useOrganization());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: async () => ({ organization: { id: "org-2", name: "Autre Société" } }),
    } as Response);
    await result.current.refetch();

    await waitFor(() => expect(result.current.organization).toEqual({ id: "org-2", name: "Autre Société" }));
  });
});
