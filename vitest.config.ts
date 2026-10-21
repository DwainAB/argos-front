import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    // Limite le nombre de workers en parallèle : un par fichier de test par défaut (39
    // fichiers ici) sature la machine une fois l'instrumentation v8 coverage activée,
    // provoquant des faux timeouts (tests qui mettent >150s à finir alors qu'ils sont
    // instantanés isolément) — jamais observé avec `npm run test` seul, seulement avec
    // `--coverage`. Placé ici (sous `test`) car c'est le seul emplacement reconnu par le
    // typage de `defineConfig` dans cette version de vitest/config — le runtime accepte
    // aussi bien ici qu'au niveau racine, seul le typage TypeScript diffère.
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 4,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/app/**/layout.tsx", "src/test/**"],
    },
  },
});
