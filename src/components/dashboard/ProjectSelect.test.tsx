import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectSelect } from "./ProjectSelect";

const pushMock = vi.fn();
let pathnameMock = "/dashboard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
}));

vi.mock("@/lib/use-projects", async () => {
  const actual = await vi.importActual<typeof import("@/lib/use-projects")>("@/lib/use-projects");
  return { ...actual, useProjects: vi.fn() };
});

import { useProjects, type ApiProject } from "@/lib/use-projects";

function makeProject(overrides: Partial<ApiProject> = {}): ApiProject {
  return {
    id: "proj-1",
    name: "Mon projet",
    githubRepo: null,
    githubBranch: null,
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

beforeEach(() => {
  pushMock.mockReset();
  pathnameMock = "/dashboard";
  vi.mocked(useProjects).mockReset();
});

describe("ProjectSelect", () => {
  it("affiche 'Vue globale' quand aucun projet actif", () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    render(<ProjectSelect />);

    expect(screen.getByRole("button", { name: /vue globale/i })).toBeInTheDocument();
  });

  it("affiche le nom du projet actif d'après le chemin courant", () => {
    pathnameMock = "/dashboard/projects/proj-1/logs";
    vi.mocked(useProjects).mockReturnValue({
      projects: [makeProject({ id: "proj-1", name: "API Backend" })],
      loading: false,
      refetch: vi.fn(),
    });

    render(<ProjectSelect />);

    expect(screen.getByText("API Backend")).toBeInTheDocument();
  });

  it("ouvre le menu déroulant au clic et affiche le message vide si aucun projet", async () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    render(<ProjectSelect />);
    await userEvent.click(screen.getByRole("button", { name: /vue globale/i }));

    expect(screen.getByText(/aucun projet connecté/i)).toBeInTheDocument();
  });

  it("groupe les projets par propriétaire, Personnel en premier", async () => {
    vi.mocked(useProjects).mockReturnValue({
      projects: [
        makeProject({ id: "p1", name: "Projet Org", user: { accountType: "organization", organizationName: "Ma Société" } }),
        makeProject({ id: "p2", name: "Projet Perso", user: { accountType: "personal", organizationName: null } }),
      ],
      loading: false,
      refetch: vi.fn(),
    });

    render(<ProjectSelect />);
    await userEvent.click(screen.getByRole("button", { name: /vue globale/i }));

    const groupLabels = screen.getAllByText(/personnel|ma société/i).map((el) => el.textContent);
    expect(groupLabels.indexOf("Personnel")).toBeLessThan(groupLabels.indexOf("Ma Société"));
  });

  it("navigue vers le projet cliqué et referme le menu", async () => {
    vi.mocked(useProjects).mockReturnValue({
      projects: [makeProject({ id: "proj-2", name: "Autre projet" })],
      loading: false,
      refetch: vi.fn(),
    });

    render(<ProjectSelect />);
    await userEvent.click(screen.getByRole("button", { name: /vue globale/i }));
    await userEvent.click(screen.getByRole("button", { name: /autre projet/i }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/projects/proj-2");
    expect(screen.queryByText(/ajouter un projet/i)).not.toBeInTheDocument();
  });

  it("navigue vers la page de création au clic sur 'Ajouter un projet'", async () => {
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false, refetch: vi.fn() });

    render(<ProjectSelect />);
    await userEvent.click(screen.getByRole("button", { name: /vue globale/i }));
    await userEvent.click(screen.getByRole("button", { name: /ajouter un projet/i }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/projects/new");
  });
});
