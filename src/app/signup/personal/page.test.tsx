import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={props.alt as string} /> }));
vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, signup: vi.fn() };
});

import { ApiAuthError, signup } from "@/lib/auth";
import PersonalSignupPage from "./page";

beforeEach(() => {
  pushMock.mockReset();
  vi.mocked(signup).mockReset();
});

describe("PersonalSignupPage", () => {
  it("crée un compte personnel et redirige vers le dashboard", async () => {
    vi.mocked(signup).mockResolvedValue({ id: "u-1" } as never);
    render(<PersonalSignupPage />);

    await userEvent.type(screen.getByLabelText(/prénom/i), "Jean");
    await userEvent.type(screen.getByLabelText(/^nom$/i), "Dupont");
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "motdepasse1");
    await userEvent.click(screen.getByRole("button", { name: /créer mon compte/i }));

    await waitFor(() =>
      expect(signup).toHaveBeenCalledWith({
        firstName: "Jean",
        lastName: "Dupont",
        email: "a@b.com",
        password: "motdepasse1",
        accountType: "personal",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("affiche un message générique si l'erreur n'est pas une ApiAuthError", async () => {
    vi.mocked(signup).mockRejectedValue(new Error("network down"));
    render(<PersonalSignupPage />);

    await userEvent.type(screen.getByLabelText(/prénom/i), "Jean");
    await userEvent.type(screen.getByLabelText(/^nom$/i), "Dupont");
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "motdepasse1");
    await userEvent.click(screen.getByRole("button", { name: /créer mon compte/i }));

    expect(await screen.findByText("Impossible de créer le compte.")).toBeInTheDocument();
  });
});
