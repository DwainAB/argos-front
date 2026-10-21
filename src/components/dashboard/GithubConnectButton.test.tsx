import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GithubConnectButton } from "./GithubConnectButton";

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

describe("GithubConnectButton", () => {
  it("ouvre la modale et affiche un message de chargement au clic", async () => {
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {})); // ne résout jamais

    render(
      <GithubConnectButton projectId={null} onResult={vi.fn()}>
        Connecter GitHub
      </GithubConnectButton>
    );

    await userEvent.click(screen.getByRole("button", { name: /connecter github/i }));

    await waitFor(() => expect(screen.getByText(/vérification des installations existantes/i)).toBeInTheDocument());
  });

  it("affiche les installations existantes et propose d'en choisir une", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        installations: [{ id: 1, accountLogin: "DwainAB", accountAvatarUrl: "" }],
      }),
    } as Response);
    const onResult = vi.fn();

    render(
      <GithubConnectButton projectId="proj-1" onResult={onResult}>
        Connecter GitHub
      </GithubConnectButton>
    );

    await userEvent.click(screen.getByRole("button", { name: /connecter github/i }));
    await waitFor(() => expect(screen.getByText("DwainAB")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "DwainAB" }));

    expect(onResult).toHaveBeenCalledWith({ installationId: "1", projectId: "proj-1" });
  });

  it("ouvre une popup d'installation si aucune installation existante", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => ({ installations: [] }) } as Response);

    render(
      <GithubConnectButton projectId="proj-1" onResult={vi.fn()}>
        Connecter GitHub
      </GithubConnectButton>
    );

    await userEvent.click(screen.getByRole("button", { name: /connecter github/i }));
    await waitFor(() => expect(screen.getByText(/installer la github app/i)).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /installer la github app/i }));

    expect(openMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/integrations/github/start?projectId=proj-1"),
      "argos-github-install",
      expect.stringContaining("width="),
    );
  });

  it("affiche un message d'erreur si le chargement des installations échoue", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: false, json: async () => ({ error: "Erreur serveur." }) } as Response);

    render(
      <GithubConnectButton projectId={null} onResult={vi.fn()}>
        Connecter GitHub
      </GithubConnectButton>
    );

    await userEvent.click(screen.getByRole("button", { name: /connecter github/i }));

    await waitFor(() => expect(screen.getByText("Erreur serveur.")).toBeInTheDocument());
  });

  it("appelle onResult avec le résultat quand un message valide arrive", () => {
    const onResult = vi.fn();
    render(
      <GithubConnectButton projectId="proj-1" onResult={onResult}>
        Connecter GitHub
      </GithubConnectButton>
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "http://localhost:4000",
        data: { source: "argos-github-install", installationId: "42", projectId: "proj-1" },
      }),
    );

    expect(onResult).toHaveBeenCalledWith({ installationId: "42", projectId: "proj-1" });
  });

  it("désactive le bouton déclencheur quand disabled est vrai", () => {
    render(
      <GithubConnectButton projectId={null} onResult={vi.fn()} disabled>
        Connecter GitHub
      </GithubConnectButton>
    );

    expect(screen.getByRole("button", { name: /connecter github/i })).toBeDisabled();
  });
});
