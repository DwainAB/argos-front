import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/dashboard/UserContext", () => ({ useCurrentUser: vi.fn() }));
vi.mock("@/lib/use-organization", () => ({ useOrganization: vi.fn() }));
vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));

import { useCurrentUser } from "@/components/dashboard/UserContext";
import { useOrganization } from "@/lib/use-organization";
import { apiFetch } from "@/lib/api-fetch";
import { OrganizationContent } from "./OrganizationContent";
import type { CurrentUser } from "@/lib/auth";
import type { Organization } from "@/lib/use-organization";

function makeUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: "user-1",
    email: "a@b.com",
    firstName: "Jean",
    lastName: "Dupont",
    phone: null,
    accountType: "organization",
    organizationName: "Ma Société",
    createdAt: "2026-01-01T00:00:00.000Z",
    organizationRole: "admin",
    subscriptionStatus: "active",
    hasActiveSubscription: true,
    subscriptionBlocked: false,
    paymentGraceDeadline: null,
    ...overrides,
  };
}

function makeOrganization(overrides: Partial<Organization> = {}): Organization {
  return {
    id: "org-1",
    name: "Ma Société",
    createdAt: "2026-01-01T00:00:00.000Z",
    myRole: "admin",
    members: [
      { userId: "user-1", email: "a@b.com", firstName: "Jean", lastName: "Dupont", role: "admin", joinedAt: "2026-01-01" },
    ],
    invitations: [],
    projects: [],
    ...overrides,
  };
}

function jsonResponse(data: unknown, ok = true) {
  return { ok, json: async () => data } as Response;
}

beforeEach(() => {
  vi.mocked(useCurrentUser).mockReset();
  vi.mocked(useOrganization).mockReset();
  vi.mocked(apiFetch).mockReset();
});

describe("OrganizationContent", () => {
  it("affiche un message réservé si le compte n'est pas de type organisation", () => {
    vi.mocked(useCurrentUser).mockReturnValue(makeUser({ accountType: "personal" }));
    vi.mocked(useOrganization).mockReturnValue({ organization: null, loading: false, error: null, refetch: vi.fn() });

    render(<OrganizationContent />);

    expect(screen.getByText(/réservée aux comptes organisation/i)).toBeInTheDocument();
  });

  it("affiche un indicateur de chargement", () => {
    vi.mocked(useCurrentUser).mockReturnValue(makeUser());
    vi.mocked(useOrganization).mockReturnValue({ organization: null, loading: true, error: null, refetch: vi.fn() });

    render(<OrganizationContent />);

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("affiche le message d'erreur si l'organisation n'a pas pu être chargée", () => {
    vi.mocked(useCurrentUser).mockReturnValue(makeUser());
    vi.mocked(useOrganization).mockReturnValue({
      organization: null,
      loading: false,
      error: "Organisation introuvable.",
      refetch: vi.fn(),
    });

    render(<OrganizationContent />);

    expect(screen.getByText("Organisation introuvable.")).toBeInTheDocument();
  });

  it("affiche le nom de l'organisation et la liste des membres", () => {
    vi.mocked(useCurrentUser).mockReturnValue(makeUser());
    vi.mocked(useOrganization).mockReturnValue({
      organization: makeOrganization(),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<OrganizationContent />);

    expect(screen.getByRole("heading", { name: "Ma Société" })).toBeInTheDocument();
    expect(screen.getByText(/jean dupont/i)).toBeInTheDocument();
    expect(screen.getByText("(vous)")).toBeInTheDocument();
  });

  it("n'affiche pas le formulaire d'ajout de membre pour un membre non-admin", () => {
    vi.mocked(useCurrentUser).mockReturnValue(makeUser({ organizationRole: "user" }));
    vi.mocked(useOrganization).mockReturnValue({
      organization: makeOrganization({ myRole: "user" }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<OrganizationContent />);

    expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument();
  });

  it("ajoute un membre via le formulaire (admin)", async () => {
    const refetch = vi.fn();
    vi.mocked(useCurrentUser).mockReturnValue(makeUser());
    vi.mocked(useOrganization).mockReturnValue({
      organization: makeOrganization(),
      loading: false,
      error: null,
      refetch,
    });
    vi.mocked(apiFetch).mockResolvedValue(jsonResponse({ type: "invitation" }));

    render(<OrganizationContent />);

    await userEvent.type(screen.getByLabelText(/^email$/i), "nouveau@exemple.com");
    await userEvent.click(screen.getByRole("button", { name: /^ajouter$/i }));

    expect(apiFetch).toHaveBeenCalledWith(
      "/api/organizations/members",
      expect.objectContaining({ method: "POST" }),
    );
    const call = vi.mocked(apiFetch).mock.calls[0];
    expect(JSON.parse(call[1]!.body as string)).toEqual({ email: "nouveau@exemple.com", role: "user" });
  });

  it("affiche les invitations en attente pour un admin, avec un bouton pour les annuler", async () => {
    vi.mocked(useCurrentUser).mockReturnValue(makeUser());
    vi.mocked(useOrganization).mockReturnValue({
      organization: makeOrganization({
        invitations: [{ id: "inv-1", email: "attente@exemple.com", role: "user" }],
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(apiFetch).mockResolvedValue(jsonResponse({}));

    render(<OrganizationContent />);

    expect(screen.getByText("attente@exemple.com")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /annuler/i }));

    expect(apiFetch).toHaveBeenCalledWith("/api/organizations/invitations/inv-1", { method: "DELETE" });
  });

  it("n'affiche pas la section des invitations si elle est vide", () => {
    vi.mocked(useCurrentUser).mockReturnValue(makeUser());
    vi.mocked(useOrganization).mockReturnValue({
      organization: makeOrganization({ invitations: [] }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<OrganizationContent />);

    expect(screen.queryByText(/invitations en attente/i)).not.toBeInTheDocument();
  });

  it("retire un membre au clic sur 'Retirer' (admin)", async () => {
    vi.mocked(useCurrentUser).mockReturnValue(makeUser());
    vi.mocked(useOrganization).mockReturnValue({
      organization: makeOrganization({
        members: [
          { userId: "user-1", email: "a@b.com", firstName: "Jean", lastName: "Dupont", role: "admin", joinedAt: "2026-01-01" },
          { userId: "user-2", email: "c@d.com", firstName: "Marie", lastName: "Martin", role: "user", joinedAt: "2026-01-02" },
        ],
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(apiFetch).mockResolvedValue(jsonResponse({}));

    render(<OrganizationContent />);

    await userEvent.click(screen.getByRole("button", { name: /retirer/i }));

    expect(apiFetch).toHaveBeenCalledWith("/api/organizations/members/user-2", { method: "DELETE" });
  });
});
