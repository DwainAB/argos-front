import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentGraceBanner } from "./PaymentGraceBanner";
import { UserProvider } from "./UserContext";
import type { CurrentUser } from "@/lib/auth";

vi.mock("@/lib/subscription", () => ({ openBillingPortal: vi.fn() }));

import { openBillingPortal } from "@/lib/subscription";

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
    subscriptionStatus: "active",
    hasActiveSubscription: true,
    subscriptionBlocked: false,
    paymentGraceDeadline: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(openBillingPortal).mockReset();
});

describe("PaymentGraceBanner", () => {
  it("n'affiche rien si l'abonnement n'est ni bloqué ni en délai de grâce", () => {
    const { container } = render(
      <UserProvider user={makeUser()}>
        <PaymentGraceBanner />
      </UserProvider>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("affiche le message de blocage si subscriptionBlocked est vrai", () => {
    render(
      <UserProvider user={makeUser({ subscriptionBlocked: true })}>
        <PaymentGraceBanner />
      </UserProvider>
    );

    expect(screen.getByText(/accès bloqué/i)).toBeInTheDocument();
  });

  it("affiche le message de délai de grâce avec la date formatée si paymentGraceDeadline est renseigné", () => {
    render(
      <UserProvider user={makeUser({ paymentGraceDeadline: "2026-03-15T00:00:00.000Z" })}>
        <PaymentGraceBanner />
      </UserProvider>
    );

    expect(screen.getByText(/dernier paiement de votre abonnement a échoué/i)).toBeInTheDocument();
    expect(screen.getByText(/15 mars 2026/i)).toBeInTheDocument();
  });

  it("priorise le message de blocage si les deux conditions sont vraies", () => {
    render(
      <UserProvider
        user={makeUser({ subscriptionBlocked: true, paymentGraceDeadline: "2026-03-15T00:00:00.000Z" })}
      >
        <PaymentGraceBanner />
      </UserProvider>
    );

    expect(screen.getByText(/accès bloqué/i)).toBeInTheDocument();
    expect(screen.queryByText(/dernier paiement de votre abonnement a échoué/i)).not.toBeInTheDocument();
  });

  it("redirige vers le portail Stripe au clic sur le lien de mise à jour", async () => {
    vi.mocked(openBillingPortal).mockResolvedValue("https://billing.stripe.com/portal-1");
    // jsdom lève une erreur "Not implemented: navigation" si on assigne réellement
    // window.location.href ; on neutralise l'assignation pour isoler le test de l'appel API.
    const originalLocation = window.location;
    // @ts-expect-error -- remplacement volontaire pour le test
    delete window.location;
    window.location = { ...originalLocation, href: "" } as Location;

    render(
      <UserProvider user={makeUser({ subscriptionBlocked: true })}>
        <PaymentGraceBanner />
      </UserProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /mettez à jour votre moyen de paiement/i }));

    expect(openBillingPortal).toHaveBeenCalledTimes(1);

    window.location = originalLocation;
  });
});
