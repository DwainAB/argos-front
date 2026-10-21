import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));

vi.mock("@/components/dashboard/GithubConnectButton", () => ({
  GithubConnectButton: ({
    onResult,
    disabled,
    children,
  }: {
    onResult: (r: { installationId: string; projectId: string | null } | { error: string }) => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button type="button" disabled={disabled} onClick={() => onResult({ installationId: "inst-1", projectId: null })}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/dashboard/GitlabConnectButton", () => ({
  GitlabConnectButton: ({
    onResult,
    disabled,
    children,
  }: {
    onResult: (r: { connectionId: string; gitlabUserLogin: string } | { error: string }) => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button type="button" disabled={disabled} onClick={() => onResult({ connectionId: "conn-1", gitlabUserLogin: "jdupont" })}>
      {children}
    </button>
  ),
}));

import { apiFetch } from "@/lib/api-fetch";
import { NewProjectContent } from "./NewProjectContent";

function jsonResponse(data: unknown, ok = true) {
  return { ok, json: async () => data } as Response;
}

beforeEach(() => {
  pushMock.mockReset();
  vi.mocked(apiFetch).mockReset();
  // Les boutons Railway/Render n'ont pas besoin d'appel réseau pour ce test, mais
  // RenderConnectForm charge les clés stockées dès son montage (modal "Connecter Render") —
  // réponse vide par défaut pour ne pas laisser de promesse non gérée.
  vi.mocked(apiFetch).mockResolvedValue(jsonResponse({ keys: [] }));
});

describe("NewProjectContent", () => {
  it("désactive les boutons d'hébergeur tant qu'aucun nom de projet n'est saisi", () => {
    render(<NewProjectContent />);

    expect(screen.getByRole("button", { name: /connecter railway/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /connecter render/i })).toBeDisabled();
  });

  it("active les boutons d'hébergeur une fois un nom de projet saisi", async () => {
    render(<NewProjectContent />);

    await userEvent.type(screen.getByLabelText(/nom du projet/i), "Mon API");

    expect(screen.getByRole("button", { name: /connecter railway/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /connecter render/i })).toBeEnabled();
  });

  it("le bouton 'Créer le projet' est désactivé tant qu'aucun hébergeur n'est confirmé", async () => {
    render(<NewProjectContent />);

    await userEvent.type(screen.getByLabelText(/nom du projet/i), "Mon API");

    expect(screen.getByRole("button", { name: /créer le projet/i })).toBeDisabled();
  });

  it("confirme Railway via la modale et active la création du projet", async () => {
    render(<NewProjectContent />);

    await userEvent.type(screen.getByLabelText(/nom du projet/i), "Mon API");
    await userEvent.click(screen.getByRole("button", { name: /connecter railway/i }));

    await userEvent.type(screen.getByLabelText(/project token/i), "tok-123");
    await userEvent.type(screen.getByLabelText(/service id/i), "svc-123");
    await userEvent.type(screen.getByLabelText(/environment id/i), "env-123");
    await userEvent.click(screen.getByRole("button", { name: /valider ces informations/i }));

    expect(await screen.findByRole("button", { name: /railway sélectionné/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /créer le projet/i })).toBeEnabled();
  });

  it("crée le projet avec le payload Railway attendu, sans dépôt de code connecté", async () => {
    render(<NewProjectContent />);

    await userEvent.type(screen.getByLabelText(/nom du projet/i), "Mon API");
    await userEvent.click(screen.getByRole("button", { name: /connecter railway/i }));
    await userEvent.type(screen.getByLabelText(/project token/i), "tok-123");
    await userEvent.type(screen.getByLabelText(/service id/i), "svc-123");
    await userEvent.type(screen.getByLabelText(/environment id/i), "env-123");
    await userEvent.click(screen.getByRole("button", { name: /valider ces informations/i }));

    vi.mocked(apiFetch).mockResolvedValueOnce(jsonResponse({ project: { id: "proj-1" } }));

    await userEvent.click(screen.getByRole("button", { name: /créer le projet/i }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith("/api/projects", expect.objectContaining({ method: "POST" })));

    const call = vi.mocked(apiFetch).mock.calls.find(([path]) => path === "/api/projects");
    const body = JSON.parse(call![1]!.body as string);
    expect(body).toEqual({
      projectName: "Mon API",
      railway: { projectToken: "tok-123", serviceId: "svc-123", environmentId: "env-123" },
      render: undefined,
      github: null,
      gitlab: undefined,
    });
  });

  it("sélectionne un dépôt GitHub via le picker après connexion, jusqu'à GithubSelection", async () => {
    render(<NewProjectContent />);

    await userEvent.type(screen.getByLabelText(/nom du projet/i), "Mon API");
    await userEvent.click(screen.getByRole("button", { name: /connecter railway/i }));
    await userEvent.type(screen.getByLabelText(/project token/i), "tok-123");
    await userEvent.type(screen.getByLabelText(/service id/i), "svc-123");
    await userEvent.type(screen.getByLabelText(/environment id/i), "env-123");
    await userEvent.click(screen.getByRole("button", { name: /valider ces informations/i }));

    vi.mocked(apiFetch).mockResolvedValueOnce(
      jsonResponse({
        repos: [{ id: 1, name: "repo", fullName: "owner/repo", defaultBranch: "main" }],
      }),
    );

    await userEvent.click(screen.getByRole("button", { name: /^connecter github$/i }));

    const repoSelect = await screen.findByLabelText(/^dépôt$/i);
    vi.mocked(apiFetch).mockResolvedValueOnce(jsonResponse({ branches: ["main", "dev"] }));
    await userEvent.selectOptions(repoSelect, "owner/repo");

    await screen.findByLabelText(/^branche$/i);
    await userEvent.click(screen.getByRole("button", { name: /associer ce dépôt/i }));

    expect(await screen.findByRole("button", { name: /github connecté.*owner\/repo/i })).toBeInTheDocument();
  });

  it("affiche l'écran de succès et permet de naviguer vers le projet créé", async () => {
    render(<NewProjectContent />);

    await userEvent.type(screen.getByLabelText(/nom du projet/i), "Mon API");
    await userEvent.click(screen.getByRole("button", { name: /connecter railway/i }));
    await userEvent.type(screen.getByLabelText(/project token/i), "tok-123");
    await userEvent.type(screen.getByLabelText(/service id/i), "svc-123");
    await userEvent.type(screen.getByLabelText(/environment id/i), "env-123");
    await userEvent.click(screen.getByRole("button", { name: /valider ces informations/i }));

    vi.mocked(apiFetch).mockResolvedValueOnce(jsonResponse({ project: { id: "proj-1" } }));
    await userEvent.click(screen.getByRole("button", { name: /créer le projet/i }));

    expect(await screen.findByText(/projet créé/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /aller au projet/i }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/projects/proj-1");
  });

  it("affiche le message d'erreur renvoyé par l'API si la création échoue", async () => {
    render(<NewProjectContent />);

    await userEvent.type(screen.getByLabelText(/nom du projet/i), "Mon API");
    await userEvent.click(screen.getByRole("button", { name: /connecter railway/i }));
    await userEvent.type(screen.getByLabelText(/project token/i), "tok-mauvais");
    await userEvent.type(screen.getByLabelText(/service id/i), "svc-123");
    await userEvent.type(screen.getByLabelText(/environment id/i), "env-123");
    await userEvent.click(screen.getByRole("button", { name: /valider ces informations/i }));

    vi.mocked(apiFetch).mockResolvedValueOnce(
      jsonResponse({ error: "Impossible de récupérer les logs. Vérifiez le token." }, false),
    );
    await userEvent.click(screen.getByRole("button", { name: /créer le projet/i }));

    expect(await screen.findByText(/impossible de récupérer les logs/i)).toBeInTheDocument();
  });

  it("bascule vers l'onglet GitLab et affiche le bouton de connexion correspondant", async () => {
    render(<NewProjectContent />);

    await userEvent.type(screen.getByLabelText(/nom du projet/i), "Mon API");

    await userEvent.click(screen.getByRole("button", { name: "GitLab" }));

    expect(screen.getByRole("button", { name: /^connecter gitlab$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^connecter github$/i })).not.toBeInTheDocument();
  });
});
