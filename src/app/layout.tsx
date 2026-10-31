import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ClerkThemeProvider } from "@/components/theme/ClerkThemeProvider";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ClerkThemeProvider>{children}</ClerkThemeProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
