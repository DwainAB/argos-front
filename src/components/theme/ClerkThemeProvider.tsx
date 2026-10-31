"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import { useTheme } from "./ThemeProvider";

// Couleurs en valeurs explicites (et non en variables CSS) : Clerk calcule lui-même les
// nuances de survol, bordures et textes à partir de ces couleurs, ce qu'il ne sait pas faire
// à partir de `rgb(var(--…))` — d'où des boutons sombres sur fond sombre auparavant.
const palettes = {
  dark: {
    colorPrimary: "#3B82F6",
    colorBackground: "#12151F",
    colorInputBackground: "#0A0D14",
    colorText: "#E5E7EB",
    colorTextSecondary: "#9CA3AF",
    colorInputText: "#E5E7EB",
    colorNeutral: "#E5E7EB",
  },
  light: {
    colorPrimary: "#3B82F6",
    colorBackground: "#F5F7FA",
    colorInputBackground: "#FFFFFF",
    colorText: "#111827",
    colorTextSecondary: "#4B5563",
    colorInputText: "#111827",
    colorNeutral: "#111827",
  },
};

// Suit le thème clair/sombre choisi dans Argos AI pour tous les composants Clerk (connexion,
// inscription, menu compte, fenêtre « Gérer mon compte »).
export function ClerkThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <ClerkProvider
      localization={frFR}
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        variables: { ...palettes[theme], borderRadius: "0.5rem" },
        elements: {
          // Le logo GitHub est noir : illisible sur le fond sombre sans inversion.
          socialButtonsProviderIcon__github: theme === "dark" ? { filter: "invert(1)" } : undefined,
        },
      }}
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
      afterSignOutUrl="/login"
    >
      {children}
    </ClerkProvider>
  );
}
