import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("affiche le label et la valeur", () => {
    render(<StatCard label="Erreurs (24h)" value="12" />);

    expect(screen.getByText("Erreurs (24h)")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("n'affiche pas de hint si non fourni", () => {
    render(<StatCard label="Label" value="0" />);

    expect(screen.queryByText(/hint/i)).not.toBeInTheDocument();
  });

  it("affiche le hint si fourni", () => {
    render(<StatCard label="Label" value="5" hint="depuis hier" />);

    expect(screen.getByText("depuis hier")).toBeInTheDocument();
  });
});
