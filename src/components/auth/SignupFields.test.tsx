import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupFields } from "./SignupFields";

function renderFields(overrides: Partial<Parameters<typeof SignupFields>[0]> = {}) {
  const onFirstNameChange = vi.fn();
  const onLastNameChange = vi.fn();
  const onEmailChange = vi.fn();
  const onPasswordChange = vi.fn();

  render(
    <SignupFields
      firstName=""
      onFirstNameChange={onFirstNameChange}
      lastName=""
      onLastNameChange={onLastNameChange}
      email=""
      onEmailChange={onEmailChange}
      password=""
      onPasswordChange={onPasswordChange}
      {...overrides}
    />,
  );

  return { onFirstNameChange, onLastNameChange, onEmailChange, onPasswordChange };
}

describe("SignupFields", () => {
  it("affiche les 4 champs attendus", () => {
    renderFields();

    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });

  it("appelle onFirstNameChange à la saisie dans le champ prénom", async () => {
    const { onFirstNameChange } = renderFields();

    await userEvent.type(screen.getByLabelText(/prénom/i), "J");

    expect(onFirstNameChange).toHaveBeenCalledWith("J");
  });

  it("appelle onEmailChange à la saisie dans le champ email", async () => {
    const { onEmailChange } = renderFields();

    await userEvent.type(screen.getByLabelText(/email/i), "a");

    expect(onEmailChange).toHaveBeenCalledWith("a");
  });

  it("le champ mot de passe est bien de type password (masqué)", () => {
    renderFields();

    expect(screen.getByLabelText(/mot de passe/i)).toHaveAttribute("type", "password");
  });

  it("affiche les valeurs contrôlées passées en props", () => {
    renderFields({ firstName: "Jean", lastName: "Dupont", email: "jean@example.com" });

    expect(screen.getByLabelText(/prénom/i)).toHaveValue("Jean");
    expect(screen.getByLabelText(/^nom$/i)).toHaveValue("Dupont");
    expect(screen.getByLabelText(/email/i)).toHaveValue("jean@example.com");
  });
});
