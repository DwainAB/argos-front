import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, changePassword: vi.fn(), updatePhone: vi.fn() };
});

import { apiFetch } from "@/lib/api-fetch";
import { ApiAuthError, changePassword, updatePhone } from "@/lib/auth";
import { UserProvider } from "@/components/dashboard/UserContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { CurrentUser } from "@/lib/auth";
import AccountSettingsPage from "./page";

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

function renderPage(user = makeUser()) {
  return render(
    <ThemeProvider>
      <UserProvider user={user}>
        <AccountSettingsPage />
      </UserProvider>
    </ThemeProvider>,
  );
}

function jsonResponse(data: unknown, ok = true) {
  return { ok, json: async () => data } as Response;
}

beforeEach(() => {
  vi.mocked(apiFetch).mockReset();
  vi.mocked(changePassword).mockReset();
  vi.mocked(updatePhone).mockReset();
  // Les deux sections (clés Render, connexions GitHub) fetchent au montage : réponse vide par
  // défaut pour ne pas laisser de promesse non résolue dans les tests qui ne les concernent pas.
  vi.mocked(apiFetch).mockImplementation((path: string) => {
    if (path === "/api/render-api-keys") return Promise.resolve(jsonResponse({ keys: [] }));
    if (path === "/api/github-connections") return Promise.resolve(jsonResponse({ connections: [] }));
    return Promise.resolve(jsonResponse({}));
  });
});

describe("AccountSettingsPage", () => {
  it("affiche la section de changement de mot de passe et refuse un mot de passe trop court", async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), "ancien");
    await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), "court");
    await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), "court");
    await userEvent.click(screen.getByRole("button", { name: /mettre à jour le mot de passe/i }));

    expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("met à jour le mot de passe avec succès", async () => {
    vi.mocked(changePassword).mockResolvedValue({} as never);
    renderPage();

    await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), "ancien123");
    await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), "nouveau123");
    await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), "nouveau123");
    await userEvent.click(screen.getByRole("button", { name: /mettre à jour le mot de passe/i }));

    expect(await screen.findByText("Mot de passe mis à jour.")).toBeInTheDocument();
    expect(changePassword).toHaveBeenCalledWith({ currentPassword: "ancien123", newPassword: "nouveau123" });
  });

  it("affiche l'erreur de l'API si le changement de mot de passe échoue", async () => {
    vi.mocked(changePassword).mockRejectedValue(new ApiAuthError("Mot de passe actuel incorrect."));
    renderPage();

    await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), "faux");
    await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), "nouveau123");
    await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), "nouveau123");
    await userEvent.click(screen.getByRole("button", { name: /mettre à jour le mot de passe/i }));

    expect(await screen.findByText("Mot de passe actuel incorrect.")).toBeInTheDocument();
  });

  it("enregistre le numéro de téléphone", async () => {
    vi.mocked(updatePhone).mockResolvedValue({} as never);
    renderPage();

    const phoneInput = screen.getByLabelText(/numéro de téléphone/i);
    await userEvent.type(phoneInput, "+33612345678");
    const saveButtons = screen.getAllByRole("button", { name: /^enregistrer$/i });
    await userEvent.click(saveButtons[saveButtons.length - 1]);

    expect(await screen.findByText("Numéro enregistré.")).toBeInTheDocument();
    expect(updatePhone).toHaveBeenCalledWith("+33612345678");
  });

  it("charge et affiche les clés API Render enregistrées", async () => {
    vi.mocked(apiFetch).mockImplementation((path: string) => {
      if (path === "/api/render-api-keys") {
        return Promise.resolve(
          jsonResponse({ keys: [{ id: "key-1", label: "Ma clé", lastFour: "1234", createdAt: "2026-01-01" }] }),
        );
      }
      if (path === "/api/github-connections") return Promise.resolve(jsonResponse({ connections: [] }));
      return Promise.resolve(jsonResponse({}));
    });

    renderPage();

    expect(await screen.findByText("Ma clé")).toBeInTheDocument();
    expect(screen.getByText("••••1234")).toBeInTheDocument();
  });

  it("affiche un message si aucune clé Render n'est enregistrée", async () => {
    renderPage();

    expect(await screen.findByText(/aucune clé enregistrée/i)).toBeInTheDocument();
  });

  it("affiche un message si aucune connexion GitHub n'existe", async () => {
    renderPage();

    expect(await screen.findByText(/aucun dépôt github connecté/i)).toBeInTheDocument();
  });

  it("ouvre la confirmation de suppression d'une clé Render et la supprime", async () => {
    vi.mocked(apiFetch).mockImplementation((path: string, options?: RequestInit) => {
      if (path === "/api/render-api-keys" && (!options || options.method === undefined)) {
        return Promise.resolve(
          jsonResponse({ keys: [{ id: "key-1", label: "Ma clé", lastFour: "1234", createdAt: "2026-01-01" }] }),
        );
      }
      if (path === "/api/render-api-keys/key-1" && options?.method === "DELETE") {
        return Promise.resolve(jsonResponse({}));
      }
      if (path === "/api/github-connections") return Promise.resolve(jsonResponse({ connections: [] }));
      return Promise.resolve(jsonResponse({}));
    });

    renderPage();

    await userEvent.click(await screen.findByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/supprimer cette clé api/i)).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: /^supprimer$/i })[1]);

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith("/api/render-api-keys/key-1", { method: "DELETE" }),
    );
  });
});
