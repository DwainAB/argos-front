import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoogleSignInButton } from "./GoogleSignInButton";

// GOOGLE_CLIENT_ID est vide par défaut en l'absence de NEXT_PUBLIC_GOOGLE_CLIENT_ID (voir
// lib/config.ts) — c'est le cas dans cet environnement de test, donc le composant retombe sur
// son état "non configuré" : un bouton visuel désactivé, sans tenter de charger le SDK Google.
describe("GoogleSignInButton", () => {
  it("affiche un bouton désactivé si aucun Client ID Google n'est configuré", () => {
    render(<GoogleSignInButton onIdToken={vi.fn()} />);

    expect(screen.getByRole("button", { name: /continuer avec google/i })).toBeDisabled();
  });
});
