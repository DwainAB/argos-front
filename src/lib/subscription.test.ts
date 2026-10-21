import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./api-fetch", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "./api-fetch";
import {
  getDowngradePreview,
  getUpgradeToBusinessPortalUrl,
  openBillingPortal,
  previewPlanChange,
  scheduleDowngradeToSolo,
  startCheckout,
} from "./subscription";

function mockResponse(data: unknown, ok = true) {
  return { ok, json: async () => data } as Response;
}

beforeEach(() => {
  vi.mocked(apiFetch).mockReset();
});

describe("startCheckout", () => {
  it("renvoie l'url de la session Checkout", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ url: "https://checkout.stripe.com/session-1" }));

    await expect(startCheckout()).resolves.toBe("https://checkout.stripe.com/session-1");
    expect(apiFetch).toHaveBeenCalledWith("/api/subscription/checkout", { method: "POST" });
  });

  it("lève une erreur avec le message du serveur en cas d'échec", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ error: "Stripe non configuré." }, false));

    await expect(startCheckout()).rejects.toThrow("Stripe non configuré.");
  });
});

describe("openBillingPortal", () => {
  it("renvoie l'url du portail de facturation", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ url: "https://billing.stripe.com/portal-1" }));

    await expect(openBillingPortal()).resolves.toBe("https://billing.stripe.com/portal-1");
  });
});

describe("getDowngradePreview", () => {
  it("renvoie l'aperçu de downgrade", async () => {
    const preview = { memberCount: 1, activeProjects: [], blockedByMembers: false, requiresProjectSelection: false };
    vi.mocked(apiFetch).mockResolvedValue(mockResponse(preview));

    await expect(getDowngradePreview()).resolves.toEqual(preview);
  });
});

describe("previewPlanChange", () => {
  it("passe le plan demandé en query string", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ amountDue: 1000, currency: "eur" }));

    await previewPlanChange("business");

    expect(apiFetch).toHaveBeenCalledWith("/api/subscription/preview-plan-change?plan=business");
  });
});

describe("getUpgradeToBusinessPortalUrl", () => {
  it("envoie le nom d'organisation et renvoie l'url du portail", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ portalUrl: "https://billing.stripe.com/portal-2" }));

    const url = await getUpgradeToBusinessPortalUrl("Ma Société");

    const [, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(JSON.parse(options!.body as string)).toEqual({ organizationName: "Ma Société" });
    expect(url).toBe("https://billing.stripe.com/portal-2");
  });
});

describe("scheduleDowngradeToSolo", () => {
  it("renvoie la date d'effet du changement", async () => {
    vi.mocked(apiFetch).mockResolvedValue(mockResponse({ effectiveAt: "2026-02-01T00:00:00.000Z" }));

    const result = await scheduleDowngradeToSolo(["p1"]);

    expect(result).toEqual({ effectiveAt: "2026-02-01T00:00:00.000Z" });
  });

  it("lève une erreur même si la réponse d'échec n'est pas du JSON valide", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error("invalid json");
      },
    } as unknown as Response);

    await expect(scheduleDowngradeToSolo()).rejects.toThrow("Impossible de passer au plan Solo.");
  });
});
