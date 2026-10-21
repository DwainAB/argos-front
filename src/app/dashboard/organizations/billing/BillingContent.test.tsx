import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/use-organization", () => ({ useOrganization: vi.fn() }));
vi.mock("@/lib/subscription", () => ({
  useSubscription: vi.fn(),
  getDowngradePreview: vi.fn(),
  getUpgradeToBusinessPortalUrl: vi.fn(),
  openBillingPortal: vi.fn(),
  previewPlanChange: vi.fn(),
  scheduleDowngradeToSolo: vi.fn(),
}));

import { useOrganization } from "@/lib/use-organization";
import {
  getDowngradePreview,
  getUpgradeToBusinessPortalUrl,
  openBillingPortal,
  previewPlanChange,
  scheduleDowngradeToSolo,
  useSubscription,
} from "@/lib/subscription";
import { UserProvider } from "@/components/dashboard/UserContext";
import type { CurrentUser } from "@/lib/auth";
import { BillingContent } from "./BillingContent";

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

function renderWithUser(user: CurrentUser) {
  return render(
    <UserProvider user={user}>
      <BillingContent />
    </UserProvider>,
  );
}

beforeEach(() => {
  vi.mocked(useOrganization).mockReset();
  vi.mocked(useSubscription).mockReset();
  vi.mocked(getDowngradePreview).mockReset();
  vi.mocked(getUpgradeToBusinessPortalUrl).mockReset();
  vi.mocked(openBillingPortal).mockReset();
  vi.mocked(previewPlanChange).mockReset();
  vi.mocked(scheduleDowngradeToSolo).mockReset();

  vi.mocked(useOrganization).mockReturnValue({
    organization: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
});

describe("BillingContent — compte personnel", () => {
  it("affiche le plan Solo actif avec ses quotas d'usage", async () => {
    vi.mocked(useSubscription).mockReturnValue({
      subscription: {
        plan: "solo",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        blocked: false,
        paymentGraceDeadline: null,
        sms: { used: 3, limit: 10 },
        fixes: { used: 1, limit: 5 },
        codeAnalyses: { used: 0, limit: 5 },
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithUser(makeUser());

    expect(screen.getByText("Plan Solo")).toBeInTheDocument();
    expect(screen.getByText("Actif")).toBeInTheDocument();
    expect(screen.getByText("3 / 10")).toBeInTheDocument();
  });

  it("affiche un message d'erreur si l'abonnement ne peut pas être chargé", () => {
    vi.mocked(useSubscription).mockReturnValue({
      subscription: null,
      loading: false,
      error: "Impossible de récupérer l'abonnement.",
      refetch: vi.fn(),
    });

    renderWithUser(makeUser());

    expect(screen.getByText("Impossible de récupérer l'abonnement.")).toBeInTheDocument();
  });

  it("ouvre le portail de facturation Stripe au clic", async () => {
    vi.mocked(useSubscription).mockReturnValue({
      subscription: {
        plan: "solo",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        blocked: false,
        paymentGraceDeadline: null,
        sms: { used: 0, limit: 10 },
        fixes: { used: 0, limit: 5 },
        codeAnalyses: { used: 0, limit: 5 },
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(openBillingPortal).mockResolvedValue("https://billing.stripe.com/portal-1");
    const originalLocation = window.location;
    // @ts-expect-error -- redéfinition volontaire de window.location pour ce test
    delete window.location;
    window.location = { ...originalLocation, href: "" } as Location;

    renderWithUser(makeUser());
    await userEvent.click(screen.getByText("Changer le moyen de paiement"));

    await waitFor(() => expect(window.location.href).toBe("https://billing.stripe.com/portal-1"));

    window.location = originalLocation;
  });

  it("ouvre la modale d'upgrade vers Business et affiche l'aperçu de prix", async () => {
    vi.mocked(useSubscription).mockReturnValue({
      subscription: {
        plan: "solo",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        blocked: false,
        paymentGraceDeadline: null,
        sms: { used: 0, limit: 10 },
        fixes: { used: 0, limit: 5 },
        codeAnalyses: { used: 0, limit: 5 },
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(previewPlanChange).mockResolvedValue({ amountDue: 3000, currency: "eur" });

    renderWithUser(makeUser());
    await userEvent.click(screen.getByRole("button", { name: /passer à business/i }));

    expect(await screen.findByText(/seront prélevés immédiatement/i)).toBeInTheDocument();
    expect(previewPlanChange).toHaveBeenCalledWith("business");
  });
});

describe("BillingContent — compte organisation", () => {
  it("affiche le chargement pendant la récupération de l'organisation", () => {
    vi.mocked(useOrganization).mockReturnValue({ organization: null, loading: true, error: null, refetch: vi.fn() });
    vi.mocked(useSubscription).mockReturnValue({ subscription: null, loading: true, error: null, refetch: vi.fn() });

    renderWithUser(makeUser({ organizationRole: "admin" }));

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("refuse l'accès à la facturation pour un membre non-admin", () => {
    vi.mocked(useOrganization).mockReturnValue({
      organization: { id: "org-1", name: "Ma Société", createdAt: "", myRole: "user", members: [], invitations: [], projects: [] },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useSubscription).mockReturnValue({ subscription: null, loading: false, error: null, refetch: vi.fn() });

    renderWithUser(makeUser({ organizationRole: "user" }));

    expect(screen.getByText(/réservée aux administrateurs/i)).toBeInTheDocument();
  });

  it("affiche la facturation de l'organisation pour un admin", () => {
    vi.mocked(useOrganization).mockReturnValue({
      organization: { id: "org-1", name: "Ma Société", createdAt: "", myRole: "admin", members: [], invitations: [], projects: [] },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useSubscription).mockReturnValue({
      subscription: {
        plan: "business",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        blocked: false,
        paymentGraceDeadline: null,
        sms: { used: 10, limit: 60 },
        fixes: { used: 5, limit: 30 },
        codeAnalyses: { used: 0, limit: 5 },
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithUser(makeUser({ organizationRole: "admin" }));

    expect(screen.getByText("Plan Business")).toBeInTheDocument();
    expect(screen.getByText(/gestion de l'abonnement de votre organisation/i)).toBeInTheDocument();
  });

  it("limite à 3 projets sélectionnables lors d'un downgrade nécessitant une sélection", async () => {
    vi.mocked(useOrganization).mockReturnValue({
      organization: { id: "org-1", name: "Ma Société", createdAt: "", myRole: "admin", members: [], invitations: [], projects: [] },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useSubscription).mockReturnValue({
      subscription: {
        plan: "business",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        blocked: false,
        paymentGraceDeadline: null,
        sms: { used: 0, limit: 60 },
        fixes: { used: 0, limit: 30 },
        codeAnalyses: { used: 0, limit: 5 },
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(getDowngradePreview).mockResolvedValue({
      memberCount: 1,
      blockedByMembers: false,
      requiresProjectSelection: true,
      activeProjects: [
        { id: "p1", name: "Projet 1" },
        { id: "p2", name: "Projet 2" },
        { id: "p3", name: "Projet 3" },
        { id: "p4", name: "Projet 4" },
      ],
    });

    renderWithUser(makeUser({ organizationRole: "admin" }));
    await userEvent.click(screen.getByRole("button", { name: /passer à solo/i }));

    expect(await screen.findByText("3 / 3 sélectionnés")).toBeInTheDocument();
    const fourthCheckbox = screen.getByRole("checkbox", { name: /projet 4/i });
    expect(fourthCheckbox).toBeDisabled();
  });

  it("empêche le downgrade si l'organisation a plusieurs membres", async () => {
    vi.mocked(useOrganization).mockReturnValue({
      organization: { id: "org-1", name: "Ma Société", createdAt: "", myRole: "admin", members: [], invitations: [], projects: [] },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useSubscription).mockReturnValue({
      subscription: {
        plan: "business",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        blocked: false,
        paymentGraceDeadline: null,
        sms: { used: 0, limit: 60 },
        fixes: { used: 0, limit: 30 },
        codeAnalyses: { used: 0, limit: 5 },
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(getDowngradePreview).mockResolvedValue({
      memberCount: 3,
      blockedByMembers: true,
      requiresProjectSelection: false,
      activeProjects: [],
    });

    renderWithUser(makeUser({ organizationRole: "admin" }));
    await userEvent.click(screen.getByRole("button", { name: /passer à solo/i }));

    expect(await screen.findByText(/retirez les autres membres/i)).toBeInTheDocument();
  });
});
