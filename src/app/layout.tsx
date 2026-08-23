import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata = {
  title: "Argos AI",
  description: "Surveillance de logs et détection d'anomalies assistée par IA",
};

// Applique le thème stocké avant l'hydratation React, pour éviter un flash visuel.
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
  // Mode sombre par défaut. Le mode clair est activé via le ThemeProvider (voir composant).
  return (
    <html lang="fr" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
