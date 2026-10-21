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
import OrganizationSignupPage from "./page";

beforeEach(() => {
  pushMock.mockReset();
  vi.mocked(signup).mockReset();
});

describe("OrganizationSignupPage", () => {
  it("crée un compte organisation avec accountType et organizationName, puis redirige", async () => {
    vi.mocked(signup).mockResolvedValue({ id: "u-1" } as never);
    render(<OrganizationSignupPage />);

    await userEvent.type(screen.getByLabelText(/nom de l'organisation/i), "Ma Société");
    await userEvent.type(screen.getByLabelText(/prénom/i), "Jean");
    await userEvent.type(screen.getByLabelText(/^nom$/i), "Dupont");
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "motdepasse1");
    await userEvent.click(screen.getByRole("button", { name: /créer le compte organisation/i }));

    await waitFor(() =>
      expect(signup).toHaveBeenCalledWith({
        firstName: "Jean",
        lastName: "Dupont",
        email: "a@b.com",
        password: "motdepasse1",
        accountType: "organization",
        organizationName: "Ma Société",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("affiche l'erreur de l'API si l'inscription échoue", async () => {
    vi.mocked(signup).mockRejectedValue(new ApiAuthError("Email déjà utilisé."));
    render(<OrganizationSignupPage />);

    await userEvent.type(screen.getByLabelText(/nom de l'organisation/i), "Ma Société");
    await userEvent.type(screen.getByLabelText(/prénom/i), "Jean");
    await userEvent.type(screen.getByLabelText(/^nom$/i), "Dupont");
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "motdepasse1");
    await userEvent.click(screen.getByRole("button", { name: /créer le compte organisation/i }));

    expect(await screen.findByText("Email déjà utilisé.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
