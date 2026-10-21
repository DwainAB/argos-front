import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectField, TextInput } from "./FormField";

describe("TextInput", () => {
  it("associe le label au champ via htmlFor/id", () => {
    render(<TextInput label="Nom du projet" id="project-name" value="" onChange={() => {}} />);

    expect(screen.getByLabelText("Nom du projet")).toBeInTheDocument();
  });

  it("transmet les props HTML standard (placeholder, value) à l'input", () => {
    render(<TextInput label="Nom" id="name" placeholder="Mon projet" value="valeur" onChange={() => {}} />);

    const input = screen.getByLabelText("Nom") as HTMLInputElement;
    expect(input.placeholder).toBe("Mon projet");
    expect(input.value).toBe("valeur");
  });

  it("appelle onChange à la saisie", async () => {
    const onChange = vi.fn();
    render(<TextInput label="Nom" id="name" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Nom"), "a");

    expect(onChange).toHaveBeenCalled();
  });
});

describe("SelectField", () => {
  it("associe le label au champ select et affiche les options", () => {
    render(
      <SelectField label="Branche" id="branch" value="main" onChange={() => {}}>
        <option value="main">main</option>
        <option value="dev">dev</option>
      </SelectField>
    );

    const select = screen.getByLabelText("Branche") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("main");
    expect(screen.getByRole("option", { name: "dev" })).toBeInTheDocument();
  });

  it("appelle onChange à la sélection d'une autre option", async () => {
    const onChange = vi.fn();
    render(
      <SelectField label="Branche" id="branch" value="main" onChange={onChange}>
        <option value="main">main</option>
        <option value="dev">dev</option>
      </SelectField>
    );

    await userEvent.selectOptions(screen.getByLabelText("Branche"), "dev");

    expect(onChange).toHaveBeenCalled();
  });
});
