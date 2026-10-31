import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const replace = vi.fn();
const push = vi.fn();
const signOut = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push }) }));
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    isLoaded: true,
    user: { firstName: "Jean", lastName: "Dupont", primaryEmailAddress: { emailAddress: "jean@example.com" } },
  }),
  useClerk: () => ({ signOut }),
}));
vi.mock("@/components/landing/CircuitBackground", () => ({ CircuitBackground: () => null }));
vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getCurrentUser: vi.fn(), completeOnboarding: vi.fn() };
});

import { ApiAuthError, completeOnboarding, getCurrentUser, OnboardingRequiredError } from "@/lib/auth";
import OnboardingPage from "./page";

beforeEach(() => {
  replace.mockReset();
  push.mockReset();
  signOut.mockReset();
  vi.mocked(completeOnboarding).mockReset();
  vi.mocked(getCurrentUser).mockReset().mockRejectedValue(new OnboardingRequiredError());
});

describe("OnboardingPage", () => {
  it("redirige vers le dashboard si le compte est déjà configuré", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "u-1" } as never);

    render(<OnboardingPage />);

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("pré-remplit le prénom et le nom depuis Clerk", async () => {
    render(<OnboardingPage />);

    expect(await screen.findByLabelText("Prénom")).toHaveValue("Jean");
    expect(screen.getByLabelText("Nom")).toHaveValue("Dupont");
  });

  it("crée un compte organisation puis redirige vers le dashboard", async () => {
    vi.mocked(completeOnboarding).mockResolvedValue({ id: "u-1" } as never);
    render(<OnboardingPage />);

    await userEvent.click(await screen.findByText("Compte organisation"));
    await userEvent.type(screen.getByLabelText(/nom de l'organisation/i), "Acme");
    await userEvent.click(screen.getByRole("button", { name: /créer mon compte/i }));

    expect(completeOnboarding).toHaveBeenCalledWith({
      firstName: "Jean",
      lastName: "Dupont",
      accountType: "organization",
      organizationName: "Acme",
    });
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("affiche l'erreur renvoyée par l'API", async () => {
    vi.mocked(completeOnboarding).mockRejectedValue(new ApiAuthError("Un compte existe déjà avec cet email."));
    render(<OnboardingPage />);

    await userEvent.click(await screen.findByRole("button", { name: /créer mon compte/i }));

    expect(await screen.findByText("Un compte existe déjà avec cet email.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("affiche le compte connecté et permet de se déconnecter pour changer de compte", async () => {
    render(<OnboardingPage />);

    expect(await screen.findByText("jean@example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /ce n'est pas vous/i }));

    expect(signOut).toHaveBeenCalledWith({ redirectUrl: "/login" });
  });
});
