import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// globals: false dans vitest.config.ts : le nettoyage automatique après chaque test
// (normalement implicite avec globals: true) doit être déclenché explicitement ici, sinon
// les composants rendus par un test précédent restent dans le DOM pour le suivant.
afterEach(() => {
  cleanup();
});
