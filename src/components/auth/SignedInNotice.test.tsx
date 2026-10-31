import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signOut = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { primaryEmailAddress: { emailAddress: "jean@example.com" } } }),
  useClerk: () => ({ signOut }),
}));

import { SignedInNotice } from "./SignedInNotice";

beforeEach(() => {
  signOut.mockReset().mockResolvedValue(undefined);
  window.history.pushState({}, "", "/login");
});

describe("SignedInNotice", () => {
  it("indique avec quel compte l'utilisateur est connecté et propose de continuer", () => {
    render(<SignedInNotice />);

    expect(screen.getByText("jean@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuer" })).toHaveAttribute("href", "/dashboard");
  });

  it("déconnecte puis revient sur la même page pour se connecter avec un autre compte", async () => {
    render(<SignedInNotice />);

    await userEvent.click(screen.getByRole("button", { name: /utiliser un autre compte/i }));

    expect(signOut).toHaveBeenCalledWith({ redirectUrl: "/login" });
  });
});
