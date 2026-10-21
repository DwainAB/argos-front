import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
let searchParamsValue = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParamsValue,
}));
vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={props.alt as string} /> }));
vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, resetPassword: vi.fn() };
});

import { ApiAuthError, resetPassword } from "@/lib/auth";
import ResetPasswordPage from "./page";

beforeEach(() => {
  pushMock.mockReset();
  vi.mocked(resetPassword).mockReset();
  searchParamsValue = new URLSearchParams();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ResetPasswordPage", () => {
  it("affiche un message d'erreur si aucun token n'est présent dans l'URL", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText(/lien de réinitialisation est invalide/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/nouveau mot de passe/i)).not.toBeInTheDocument();
  });

  it("refuse un mot de passe trop court sans appeler l'API", async () => {
    searchParamsValue = new URLSearchParams("token=tok-123");
    render(<ResetPasswordPage />);

    await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), "court");
    await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), "court");
    await userEvent.click(screen.getByRole("button", { name: /réinitialiser le mot de passe/i }));

    expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("refuse si les deux mots de passe ne correspondent pas", async () => {
    searchParamsValue = new URLSearchParams("token=tok-123");
    render(<ResetPasswordPage />);

    await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), "motdepasse1");
    await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), "motdepasse2");
    await userEvent.click(screen.getByRole("button", { name: /réinitialiser le mot de passe/i }));

    expect(screen.getByText(/ne correspondent pas/i)).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("réinitialise le mot de passe et redirige vers /login après un délai", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    searchParamsValue = new URLSearchParams("token=tok-123");
    vi.mocked(resetPassword).mockResolvedValue("Mot de passe réinitialisé.");
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText(/^nouveau mot de passe$/i), "motdepasse1");
    await user.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), "motdepasse1");
    await user.click(screen.getByRole("button", { name: /réinitialiser le mot de passe/i }));

    expect(await screen.findByText(/redirection vers la connexion/i)).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledWith({ token: "tok-123", newPassword: "motdepasse1" });

    vi.advanceTimersByTime(2000);
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("affiche l'erreur de l'API si la réinitialisation échoue", async () => {
    searchParamsValue = new URLSearchParams("token=tok-expire");
    vi.mocked(resetPassword).mockRejectedValue(new ApiAuthError("Ce lien a expiré."));
    render(<ResetPasswordPage />);

    await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), "motdepasse1");
    await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), "motdepasse1");
    await userEvent.click(screen.getByRole("button", { name: /réinitialiser le mot de passe/i }));

    expect(await screen.findByText("Ce lien a expiré.")).toBeInTheDocument();
  });
});
