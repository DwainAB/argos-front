import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/components/dashboard/GithubConnectButton", () => ({
  GithubConnectButton: ({ onResult }: { onResult: (r: unknown) => void }) => (
    <button type="button" onClick={() => onResult({ installationId: "install-1", projectId: null })}>
      Connecter GitHub
    </button>
  ),
}));
vi.mock("@/components/dashboard/GitlabConnectButton", () => ({
  GitlabConnectButton: ({ onResult }: { onResult: (r: unknown) => void }) => (
    <button type="button" onClick={() => onResult({ connectionId: "conn-1", gitlabUserLogin: "jdupont" })}>
      Connecter GitLab
    </button>
  ),
}));
vi.mock("@/components/dashboard/ProjectSharesSection", () => ({
  ProjectSharesSection: () => <div data-testid="project-shares-section" />,
}));

import { apiFetch } from "@/lib/api-fetch";
import { UserProvider } from "@/components/dashboard/UserContext";
import type { CurrentUser } from "@/lib/auth";
import type { ApiProject } from "@/lib/use-projects";
import { ProjectSettingsContent } from "./ProjectSettingsContent";

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

function jsonResponse(data: unknown, ok = true) {
  return { ok, json: async () => data } as Response;
}

function renderWithProject(project: ApiProject | null, user = makeUser()) {
  vi.mocked(apiFetch).mockImplementation((path: string) => {
    if (path === "/api/projects") {
      return Promise.resolve(jsonResponse({ projects: project ? [project] : [] }));
    }
    return Promise.resolve(jsonResponse({}));
  });

  return render(
    <UserProvider user={user}>
      <ProjectSettingsContent projectId="proj-1" />
    </UserProvider>,
  );
}

beforeEach(() => {
  vi.mocked(apiFetch).mockReset();
  push.mockReset();
});

describe("ProjectSettingsContent", () => {
  it("affiche 'Projet introuvable' si le projet n'existe pas dans la liste", async () => {
    renderWithProject(null);

    expect(await screen.findByText("Projet introuvable.")).toBeInTheDocument();
  });

  it("affiche le nom du projet et le bouton de connexion GitHub si aucun dépôt n'est connecté", async () => {
    renderWithProject(makeProject());

    expect(await screen.findByText(/configuration de mon projet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /connecter github/i })).toBeInTheDocument();
  });

  it("affiche le dépôt GitHub déjà connecté sans redemander une connexion", async () => {
    renderWithProject(makeProject({ githubRepo: "owner/repo", githubBranch: "main" }));

    expect(await screen.findByText("owner/repo")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /connecter github/i })).not.toBeInTheDocument();
  });

  it("charge les dépôts GitHub disponibles après connexion et permet d'en sélectionner un", async () => {
    vi.mocked(apiFetch).mockImplementation((path: string) => {
      if (path === "/api/projects") return Promise.resolve(jsonResponse({ projects: [makeProject()] }));
      if (path.startsWith("/api/integrations/github/repos")) {
        return Promise.resolve(
          jsonResponse({ repos: [{ id: 1, name: "repo", fullName: "owner/repo", defaultBranch: "main" }] }),
        );
      }
      if (path.startsWith("/api/integrations/github/branches")) {
        return Promise.resolve(jsonResponse({ branches: ["main", "dev"] }));
      }
      return Promise.resolve(jsonResponse({}));
    });

    render(
      <UserProvider user={makeUser()}>
        <ProjectSettingsContent projectId="proj-1" />
      </UserProvider>,
    );

    await userEvent.click(await screen.findByRole("button", { name: /connecter github/i }));

    expect(await screen.findByLabelText(/^dépôt$/i)).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText(/^dépôt$/i), "owner/repo");

    expect(await screen.findByRole("button", { name: /associer ce dépôt/i })).toBeInTheDocument();
  });

  it("renomme le projet et appelle PATCH avec le nouveau nom", async () => {
    vi.mocked(apiFetch).mockImplementation((path: string, options?: RequestInit) => {
      if (path === "/api/projects" && !options) return Promise.resolve(jsonResponse({ projects: [makeProject()] }));
      if (path === "/api/projects/proj-1" && options?.method === "PATCH") {
        return Promise.resolve(jsonResponse({ project: makeProject({ name: "Nouveau nom" }) }));
      }
      return Promise.resolve(jsonResponse({}));
    });

    render(
      <UserProvider user={makeUser()}>
        <ProjectSettingsContent projectId="proj-1" />
      </UserProvider>,
    );

    const nameInput = await screen.findByLabelText(/nom du projet/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Nouveau nom");
    await userEvent.click(screen.getByRole("button", { name: /^enregistrer$/i }));

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/projects/proj-1",
        expect.objectContaining({ method: "PATCH", body: JSON.stringify({ name: "Nouveau nom" }) }),
      ),
    );
    expect(await screen.findByText("Nom du projet mis à jour.")).toBeInTheDocument();
  });

  it("affiche la section de partage uniquement pour un compte organisation", async () => {
    renderWithProject(makeProject(), makeUser({ accountType: "organization" }));

    expect(await screen.findByTestId("project-shares-section")).toBeInTheDocument();
  });

  it("n'affiche pas la section de partage pour un compte personnel", async () => {
    renderWithProject(makeProject(), makeUser({ accountType: "personal" }));

    await screen.findByText(/configuration de mon projet/i);
    expect(screen.queryByTestId("project-shares-section")).not.toBeInTheDocument();
  });

  function mockDeleteResponse(response: Response) {
    vi.mocked(apiFetch).mockImplementation((path: string, options?: RequestInit) => {
      if (options?.method === "DELETE") return Promise.resolve(response);
      if (path === "/api/projects") return Promise.resolve(jsonResponse({ projects: [makeProject()] }));
      return Promise.resolve(jsonResponse({}));
    });

    return render(
      <UserProvider user={makeUser()}>
        <ProjectSettingsContent projectId="proj-1" />
      </UserProvider>,
    );
  }

  it("ne supprime rien tant que la suppression n'est pas confirmée", async () => {
    mockDeleteResponse(jsonResponse({}));

    await userEvent.click(await screen.findByRole("button", { name: "Supprimer le projet" }));
    await userEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(apiFetch).not.toHaveBeenCalledWith("/api/projects/proj-1", expect.objectContaining({ method: "DELETE" }));
  });

  it("supprime le projet après confirmation puis revient à la liste", async () => {
    mockDeleteResponse(jsonResponse({}));

    await userEvent.click(await screen.findByRole("button", { name: "Supprimer le projet" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmer la suppression" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard/projects"));
    expect(apiFetch).toHaveBeenCalledWith("/api/projects/proj-1", { method: "DELETE" });
  });

  it("affiche l'erreur du serveur si la suppression échoue", async () => {
    mockDeleteResponse(jsonResponse({ error: "Accès refusé." }, false));

    await userEvent.click(await screen.findByRole("button", { name: "Supprimer le projet" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmer la suppression" }));

    expect(await screen.findByText("Accès refusé.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
