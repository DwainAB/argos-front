import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={props.alt as string} /> }));

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, login: vi.fn() };
});

import { ApiAuthError, login } from "@/lib/auth";
import LoginPage from "./page";

beforeEach(() => {
  pushMock.mockReset();
  vi.mocked(login).mockReset();
});

describe("LoginPage", () => {
  it("connecte l'utilisateur et redirige vers le dashboard en cas de succès", async () => {
    vi.mocked(login).mockResolvedValue({ id: "u-1" } as never);
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /^connexion$/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith({ email: "a@b.com", password: "secret123" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("affiche le message d'erreur de l'API en cas d'identifiants invalides", async () => {
    vi.mocked(login).mockRejectedValue(new ApiAuthError("Identifiants invalides."));
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "mauvais");
    await userEvent.click(screen.getByRole("button", { name: /^connexion$/i }));

    expect(await screen.findByText("Identifiants invalides.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("affiche un message générique si l'erreur n'est pas une ApiAuthError", async () => {
    vi.mocked(login).mockRejectedValue(new Error("network down"));
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /^connexion$/i }));

    expect(await screen.findByText("Impossible de vous connecter.")).toBeInTheDocument();
  });

  it("désactive le bouton de connexion pendant la soumission", async () => {
    let resolveLogin: (value: unknown) => void = () => {};
    vi.mocked(login).mockReturnValue(new Promise((resolve) => (resolveLogin = resolve)));
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /^connexion$/i }));

    expect(screen.getByRole("button", { name: /connexion\.\.\./i })).toBeDisabled();
    resolveLogin({ id: "u-1" });
  });

  it("affiche un lien vers la page d'inscription", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: /créer un compte/i })).toHaveAttribute("href", "/signup");
  });
});
