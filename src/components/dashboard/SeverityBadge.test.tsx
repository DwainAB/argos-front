import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeverityBadge } from "./SeverityBadge";

describe("SeverityBadge", () => {
  it("affiche 'Critique' pour la sévérité critical", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("Critique")).toBeInTheDocument();
  });

  it("affiche 'Avertissement' pour la sévérité warning", () => {
    render(<SeverityBadge severity="warning" />);
    expect(screen.getByText("Avertissement")).toBeInTheDocument();
  });

  it("affiche 'Info' pour la sévérité info", () => {
    render(<SeverityBadge severity="info" />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("retombe sur 'Info' pour une sévérité inconnue", () => {
    render(<SeverityBadge severity="inconnue" />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });
});
