import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={props.alt as string} /> }));
vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, forgotPassword: vi.fn() };
});

import { ApiAuthError, forgotPassword } from "@/lib/auth";
import ForgotPasswordPage from "./page";

beforeEach(() => {
  vi.mocked(forgotPassword).mockReset();
});

describe("ForgotPasswordPage", () => {
  it("affiche le message générique de confirmation après envoi réussi", async () => {
    vi.mocked(forgotPassword).mockResolvedValue("Si un compte existe...");
    render(<ForgotPasswordPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.click(screen.getByRole("button", { name: /envoyer le lien/i }));

    expect(await screen.findByText(/vient d'être envoyé/i)).toBeInTheDocument();
    expect(forgotPassword).toHaveBeenCalledWith("a@b.com");
  });

  it("affiche une erreur si la requête échoue", async () => {
    vi.mocked(forgotPassword).mockRejectedValue(new ApiAuthError("Erreur serveur."));
    render(<ForgotPasswordPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.click(screen.getByRole("button", { name: /envoyer le lien/i }));

    expect(await screen.findByText("Erreur serveur.")).toBeInTheDocument();
    expect(screen.queryByText(/vient d'être envoyé/i)).not.toBeInTheDocument();
  });

  it("affiche un lien de retour vers la connexion", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole("link", { name: /retour à la connexion/i })).toHaveAttribute("href", "/login");
  });
});
