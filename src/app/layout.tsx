import type { ReactNode } from "react";

export const metadata = {
  title: "Guardian AI",
  description: "Surveillance de logs et détection d'anomalies assistée par IA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
