import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/use-projects", async () => {
  const actual = await vi.importActual<typeof import("@/lib/use-projects")>("@/lib/use-projects");
  return { ...actual, useProjects: vi.fn() };
});
vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));

import { useProjects, type ApiProject } from "@/lib/use-projects";
import { apiFetch } from "@/lib/api-fetch";
import AllProjectsPage from "./page";

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

beforeEach(() => {
  vi.mocked(useProjects).mockReset();
  vi.mocked(apiFetch).mockReset();
});

describe("AllProjectsPage", () => {
  it("affiche un message de chargement pendant le chargement des projets", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: true, refetch: vi.fn() });

    render(<AllProjectsPage />);

    expect(screen.getByText(/chargement des projets/i)).toBeInTheDocument();
  });

  it("affiche un message si l'utilisateur n'a aucun projet", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    render(<AllProjectsPage />);

    expect(screen.getByText(/aucun projet connecté/i)).toBeInTheDocument();
  });

  it("affiche le statut 'Opérationnel' si aucune erreur ni avertissement", async () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [makeProject()], loading: false, refetch: vi.fn() });
    vi.mocked(apiFetch).mockResolvedValue(jsonResponse({ errorCount: 0, warningCount: 0 }));

    render(<AllProjectsPage />);

    expect(await screen.findByText("Opérationnel")).toBeInTheDocument();
  });

  it("affiche le statut 'Critique' si le projet a des erreurs", async () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [makeProject()], loading: false, refetch: vi.fn() });
    vi.mocked(apiFetch).mockResolvedValue(jsonResponse({ errorCount: 2, warningCount: 0 }));

    render(<AllProjectsPage />);

    expect(await screen.findByText("Critique")).toBeInTheDocument();
  });

  it("affiche le dépôt GitHub et la branche du projet", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [makeProject()], loading: false, refetch: vi.fn() });
    vi.mocked(apiFetch).mockResolvedValue(jsonResponse({ errorCount: 0, warningCount: 0 }));

    render(<AllProjectsPage />);

    expect(screen.getByText(/owner\/repo · main/)).toBeInTheDocument();
  });

  it("affiche un lien vers la création d'un nouveau projet", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    render(<AllProjectsPage />);

    expect(screen.getByRole("link", { name: /ajouter un projet/i })).toHaveAttribute(
      "href",
      "/dashboard/projects/new",
    );
  });
});
