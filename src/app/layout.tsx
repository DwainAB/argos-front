import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-argos.com";
const TITLE = "Argos AI — Surveillance de logs et détection d'anomalies par IA";
const DESCRIPTION =
  "Connectez vos projets GitHub/GitLab et vos hébergeurs (Railway, Render) : Argos AI collecte vos logs, détecte erreurs et anomalies grâce à l'IA, explique chaque problème en langage clair et vous notifie par SMS ou email.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — Argos AI" },
  description: DESCRIPTION,
  keywords: [
    "surveillance de logs",
    "monitoring applicatif",
    "détection d'anomalies",
    "intelligence artificielle",
    "alertes en temps réel",
    "GitHub",
    "GitLab",
    "Railway",
    "Render",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Argos AI",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("argos-ai-theme");
    var theme = stored === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {}
})();
`;

// Composants Clerk (connexion, inscription, profil) aux couleurs de la marque — les couleurs
// de fond/texte suivent les variables CSS du thème, pour rester lisibles en clair comme en sombre.
const clerkAppearance = {
  variables: {
    colorPrimary: "#3B82F6",
    colorBackground: "rgb(var(--surface-raised))",
    colorInputBackground: "rgb(var(--surface))",
    colorText: "rgb(var(--ink-primary))",
    colorTextSecondary: "rgb(var(--ink-secondary))",
    colorInputText: "rgb(var(--ink-primary))",
    borderRadius: "0.5rem",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      localization={frFR}
      appearance={clerkAppearance}
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
    >
      <html lang="fr" className="dark">
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body>
          <ThemeProvider>{children}</ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
