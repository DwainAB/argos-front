import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/use-projects", async () => {
  const actual = await vi.importActual<typeof import("@/lib/use-projects")>("@/lib/use-projects");
  return { ...actual, useProjects: vi.fn() };
});
vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/components/dashboard/LogsTimeseriesChart", () => ({
  LogsTimeseriesChart: () => <div data-testid="logs-timeseries-chart" />,
}));

import { useProjects, type ApiProject } from "@/lib/use-projects";
import { apiFetch } from "@/lib/api-fetch";
import ProjectOverviewPage from "./page";

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
  vi.mocked(apiFetch).mockResolvedValue(jsonResponse({ latestDeployment: null, errorCount: 0, warningCount: 0 }));
});

describe("ProjectOverviewPage", () => {
  it("affiche 'Chargement...' pendant le chargement de la liste des projets", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: true, refetch: vi.fn() });

    render(<ProjectOverviewPage params={{ id: "proj-1" }} />);

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("affiche 'Projet introuvable' si l'id ne correspond à aucun projet", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    render(<ProjectOverviewPage params={{ id: "proj-inconnu" }} />);

    expect(screen.getByText("Projet introuvable.")).toBeInTheDocument();
  });

  it("affiche le nom et le dépôt du projet trouvé", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [makeProject()], loading: false, refetch: vi.fn() });

    render(<ProjectOverviewPage params={{ id: "proj-1" }} />);

    expect(screen.getByText("Mon Projet")).toBeInTheDocument();
    expect(screen.getByText(/owner\/repo · main/)).toBeInTheDocument();
  });

  it("affiche 'Aucun déploiement' si aucun déploiement n'a eu lieu", async () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [makeProject()], loading: false, refetch: vi.fn() });

    render(<ProjectOverviewPage params={{ id: "proj-1" }} />);

    expect(await screen.findByText("Aucun déploiement")).toBeInTheDocument();
  });

  it("affiche les compteurs d'erreurs et d'avertissements une fois l'aperçu chargé", async () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [makeProject()], loading: false, refetch: vi.fn() });
    vi.mocked(apiFetch).mockResolvedValue(
      jsonResponse({
        latestDeployment: { id: "d1", status: "SUCCESS", createdAt: "2026-01-01T10:00:00.000Z" },
        errorCount: 3,
        warningCount: 1,
      }),
    );

    render(<ProjectOverviewPage params={{ id: "proj-1" }} />);

    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("SUCCESS")).toBeInTheDocument();
  });

  it("affiche le graphique de la série temporelle des logs", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [makeProject()], loading: false, refetch: vi.fn() });

    render(<ProjectOverviewPage params={{ id: "proj-1" }} />);

    expect(screen.getByTestId("logs-timeseries-chart")).toBeInTheDocument();
  });
});
