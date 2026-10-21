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
  // Limite le nombre de workers en parallèle : un par fichier de test par défaut (39
  // fichiers ici) sature la machine une fois l'instrumentation v8 coverage activée,
  // provoquant des faux timeouts (tests qui mettent >150s à finir alors qu'ils sont
  // instantanés isolément) — jamais observé avec `npm run test` seul, seulement avec
  // `--coverage`. Top-level (pas sous `test`) depuis Vitest 4+ — voir guide de migration.
  pool: "forks",
  poolOptions: {
    forks: {
      maxForks: 4,
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/app/**/layout.tsx", "src/test/**"],
    },
  },
});
