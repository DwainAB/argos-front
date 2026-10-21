import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TriageStatusBadge } from "./TriageStatusBadge";

describe("TriageStatusBadge", () => {
  it("affiche 'En attente de vérification' pour le statut pending", () => {
    render(<TriageStatusBadge status="pending" />);
    expect(screen.getByText(/en attente de vérification/i)).toBeInTheDocument();
  });

  it("affiche l'indicateur de vérification en cours pour le statut checking", () => {
    render(<TriageStatusBadge status="checking" />);
    expect(screen.getByTitle(/vérification ia en cours/i)).toBeInTheDocument();
  });

  it("n'affiche rien pour tout autre statut", () => {
    const { container } = render(<TriageStatusBadge status="done" />);
    expect(container).toBeEmptyDOMElement();
  });
});
