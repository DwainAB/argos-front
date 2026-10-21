import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActorLabel } from "./ActorLabel";
import { UserProvider } from "./UserContext";
import type { CurrentUser } from "@/lib/auth";

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

describe("ActorLabel", () => {
  it("n'affiche rien si l'acteur est null", () => {
    const { container } = render(
      <UserProvider user={makeUser()}>
        <ActorLabel actor={null} />
      </UserProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("affiche 'vous' si l'acteur est l'utilisateur connecté", () => {
    render(
      <UserProvider user={makeUser({ id: "user-1" })}>
        <ActorLabel actor={{ userId: "user-1", firstName: "Jean", lastName: "Dupont" }} />
      </UserProvider>,
    );

    expect(screen.getByText("vous")).toBeInTheDocument();
  });

  it("affiche le nom complet si l'acteur est quelqu'un d'autre", () => {
    render(
      <UserProvider user={makeUser({ id: "user-1" })}>
        <ActorLabel actor={{ userId: "user-2", firstName: "Marie", lastName: "Martin" }} />
      </UserProvider>,
    );

    expect(screen.getByText("Marie Martin")).toBeInTheDocument();
  });
});
