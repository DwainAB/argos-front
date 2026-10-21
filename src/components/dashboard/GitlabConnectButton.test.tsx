import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GitlabConnectButton } from "./GitlabConnectButton";

vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "@/lib/api-fetch";

const openMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("open", openMock);
  openMock.mockReset();
  vi.mocked(apiFetch).mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GitlabConnectButton", () => {
  it("affiche les connexions existantes et permet d'en choisir une", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: async () => ({ connections: [{ id: "conn-1", gitlabUserLogin: "jdupont" }] }),
    } as Response);
    const onResult = vi.fn();

    render(
      <GitlabConnectButton onResult={onResult}>Connecter GitLab</GitlabConnectButton>
    );

    await userEvent.click(screen.getByRole("button", { name: /connecter gitlab/i }));
    await waitFor(() => expect(screen.getByText("jdupont")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "jdupont" }));

    expect(onResult).toHaveBeenCalledWith({ connectionId: "conn-1", gitlabUserLogin: "jdupont" });
  });

  it("ouvre une popup de connexion si aucune connexion existante", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => ({ connections: [] }) } as Response);

    render(<GitlabConnectButton onResult={vi.fn()}>Connecter GitLab</GitlabConnectButton>);

    await userEvent.click(screen.getByRole("button", { name: /connecter gitlab/i }));
    await waitFor(() => expect(screen.getAllByText(/connecter gitlab/i).length).toBeGreaterThan(1));

    const connectButtons = screen.getAllByRole("button", { name: /connecter gitlab/i });
    await userEvent.click(connectButtons[connectButtons.length - 1]);

    expect(openMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/integrations/gitlab/start"),
      "argos-gitlab-connect",
      expect.stringContaining("width="),
    );
  });

  it("affiche un message d'erreur si le chargement des connexions échoue", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: false, json: async () => ({ error: "Erreur serveur." }) } as Response);

    render(<GitlabConnectButton onResult={vi.fn()}>Connecter GitLab</GitlabConnectButton>);

    await userEvent.click(screen.getByRole("button", { name: /connecter gitlab/i }));

    await waitFor(() => expect(screen.getByText("Erreur serveur.")).toBeInTheDocument());
  });

  it("échange le token reçu par postMessage contre une connexion persistée", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: async () => ({ connectionId: "conn-2", gitlabUserLogin: "nouvelcompte" }),
    } as Response);
    const onResult = vi.fn();

    render(<GitlabConnectButton onResult={onResult}>Connecter GitLab</GitlabConnectButton>);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "http://localhost:4000",
        data: {
          source: "argos-gitlab-connect",
          accessToken: "at",
          refreshToken: "rt",
          expiresIn: 3600,
          gitlabUserId: 42,
          gitlabUserLogin: "nouvelcompte",
        },
      }),
    );

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({ connectionId: "conn-2", gitlabUserLogin: "nouvelcompte" }),
    );
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/gitlab-connections",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("appelle onResult avec l'erreur si le message postMessage en contient une, sans appeler l'API", async () => {
    const onResult = vi.fn();
    render(<GitlabConnectButton onResult={onResult}>Connecter GitLab</GitlabConnectButton>);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "http://localhost:4000",
        data: { source: "argos-gitlab-connect", error: "access_denied" },
      }),
    );

    await waitFor(() => expect(onResult).toHaveBeenCalledWith({ error: "access_denied" }));
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("désactive le bouton déclencheur quand disabled est vrai", () => {
    render(
      <GitlabConnectButton onResult={vi.fn()} disabled>
        Connecter GitLab
      </GitlabConnectButton>
    );

    expect(screen.getByRole("button", { name: /connecter gitlab/i })).toBeDisabled();
  });
});
