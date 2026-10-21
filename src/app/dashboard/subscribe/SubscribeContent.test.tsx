import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/subscription", () => ({ openBillingPortal: vi.fn(), startCheckout: vi.fn() }));

import { openBillingPortal, startCheckout } from "@/lib/subscription";
import { UserProvider } from "@/components/dashboard/UserContext";
import type { CurrentUser } from "@/lib/auth";
import { SubscribeContent } from "./SubscribeContent";

function makeUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: "user-1",
    email: "a@b.com",
    firstName: "Jean",
    lastName: "Dupont",
    phone: null,
    accountType: "personal",
    organizationName: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    organizationRole: null,
    subscriptionStatus: null,
    hasActiveSubscription: false,
    subscriptionBlocked: false,
    paymentGraceDeadline: null,
    ...overrides,
  };
}

function renderWithUser(user: CurrentUser) {
  return render(
    <UserProvider user={user}>
      <SubscribeContent />
    </UserProvider>,
  );
}

function stubLocation() {
  const originalLocation = window.location;
  // @ts-expect-error -- redéfinition volontaire pour intercepter la redirection Stripe
  delete window.location;
  window.location = { ...originalLocation, href: "" } as Location;
  return () => {
    window.location = originalLocation;
  };
}

beforeEach(() => {
  vi.mocked(openBillingPortal).mockReset();
  vi.mocked(startCheckout).mockReset();
});

describe("SubscribeContent", () => {
  it("propose le plan Solo pour un compte personnel jamais abonné", () => {
    renderWithUser(makeUser({ accountType: "personal" }));

    expect(screen.getByText("Plan Solo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /démarrer l'essai gratuit/i })).toBeInTheDocument();
  });

  it("propose le plan Business pour un compte organisation jamais abonné", () => {
    renderWithUser(makeUser({ accountType: "organization" }));

    expect(screen.getByText("Plan Business")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^s'abonner$/i })).toBeInTheDocument();
  });

  it("démarre le checkout Stripe et redirige vers l'url renvoyée", async () => {
    const restore = stubLocation();
    vi.mocked(startCheckout).mockResolvedValue("https://checkout.stripe.com/session-1");

    renderWithUser(makeUser());
    await userEvent.click(screen.getByRole("button", { name: /démarrer l'essai gratuit/i }));

    await waitFor(() => expect(window.location.href).toBe("https://checkout.stripe.com/session-1"));
    restore();
  });

  it("affiche l'écran de blocage si l'utilisateur est bloqué pour non-paiement", () => {
    renderWithUser(makeUser({ subscriptionBlocked: true }));

    expect(screen.getByText(/accès bloqué pour non-paiement/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /payer la facture en attente/i })).toBeInTheDocument();
  });

  it("ouvre le portail Stripe depuis l'écran de blocage", async () => {
    const restore = stubLocation();
    vi.mocked(openBillingPortal).mockResolvedValue("https://billing.stripe.com/portal-1");

    renderWithUser(makeUser({ subscriptionBlocked: true }));
    await userEvent.click(screen.getByRole("button", { name: /payer la facture en attente/i }));

    await waitFor(() => expect(window.location.href).toBe("https://billing.stripe.com/portal-1"));
    restore();
  });

  it("affiche une erreur si l'ouverture du portail échoue", async () => {
    vi.mocked(openBillingPortal).mockRejectedValue(new Error("Stripe indisponible."));

    renderWithUser(makeUser({ subscriptionBlocked: true }));
    await userEvent.click(screen.getByRole("button", { name: /payer la facture en attente/i }));

    expect(await screen.findByText("Stripe indisponible.")).toBeInTheDocument();
  });
});
