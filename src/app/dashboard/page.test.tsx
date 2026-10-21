import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/use-projects", async () => {
  const actual = await vi.importActual<typeof import("@/lib/use-projects")>("@/lib/use-projects");
  return { ...actual, useProjects: vi.fn() };
});
vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/components/dashboard/ProjectAlertsSummaryChart", () => ({
  ProjectAlertsSummaryChart: () => <div data-testid="alerts-summary-chart" />,
}));

import { useProjects, type ApiProject } from "@/lib/use-projects";
import { apiFetch } from "@/lib/api-fetch";
import { UserProvider } from "@/components/dashboard/UserContext";
import type { CurrentUser } from "@/lib/auth";
import DashboardOverviewPage from "./page";

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

function makeProject(overrides: Partial<ApiProject> = {}): ApiProject {
  return {
    id: "proj-1",
    name: "Mon Projet",
    githubRepo: "owner/repo",
    githubBranch: "main",
    gitlabRepo: null,
    gitlabBranch: null,
    railwayServiceId: null,
    railwayEnvironmentId: null,
    renderOwnerId: null,
    renderResourceId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: null,
    user: { accountType: "personal", organizationName: null },
    ...overrides,
  };
}

function jsonResponse(data: unknown) {
  return { ok: true, json: async () => data } as Response;
}

function renderPage(user = makeUser()) {
  return render(
    <UserProvider user={user}>
      <DashboardOverviewPage />
    </UserProvider>,
  );
}

beforeEach(() => {
  vi.mocked(useProjects).mockReset();
  vi.mocked(apiFetch).mockReset();
  vi.mocked(apiFetch).mockResolvedValue(jsonResponse({ errorCount: 0, warningCount: 0 }));
});

describe("DashboardOverviewPage", () => {
  it("salue l'utilisateur par son prénom", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    renderPage(makeUser({ firstName: "Marie" }));

    expect(screen.getByText(/Marie/)).toBeInTheDocument();
  });

  it("affiche un message et un bouton d'ajout si aucun projet n'est connecté", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    renderPage();

    expect(screen.getByText(/aucun projet connecté/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ajouter un projet/i })).toHaveAttribute(
      "href",
      "/dashboard/projects/new",
    );
  });

  it("compte les projets critiques et en avertissement une fois les aperçus chargés", async () => {
    vi.mocked(useProjects).mockReturnValue({
      projects: [makeProject({ id: "p1" }), makeProject({ id: "p2" })],
      loading: false,
      refetch: vi.fn(),
    });
    vi.mocked(apiFetch).mockImplementation((path: string) => {
      if (path === "/api/projects/p1/overview") return Promise.resolve(jsonResponse({ errorCount: 2, warningCount: 0 }));
      return Promise.resolve(jsonResponse({ errorCount: 0, warningCount: 1 }));
    });

    renderPage();

    expect(await screen.findByText("Critique")).toBeInTheDocument();
    expect(await screen.findByText("Avertissement")).toBeInTheDocument();
  });

  it("n'affiche pas le lien 'Voir tous les projets' si la liste est vide", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    renderPage();

    expect(screen.queryByRole("link", { name: /voir tous les projets/i })).not.toBeInTheDocument();
  });

  it("affiche le lien 'Voir tous les projets' quand il y a au moins un projet", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [makeProject()], loading: false, refetch: vi.fn() });
    vi.mocked(apiFetch).mockResolvedValue(jsonResponse({ errorCount: 0, warningCount: 0 }));

    renderPage();

    expect(screen.getByRole("link", { name: /voir tous les projets/i })).toHaveAttribute(
      "href",
      "/dashboard/projects",
    );
  });
});
