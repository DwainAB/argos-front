import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Guardian AI",
  description: "Surveillance de logs et détection d'anomalies assistée par IA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Mode sombre par défaut. Le mode clair sera activé en retirant la classe "dark".
  return (
    <html lang="fr" className="dark">
      <body>{children}</body>
    </html>
  );
}
