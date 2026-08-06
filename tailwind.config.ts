import type { Config } from "tailwindcss";

// Palette de marque Guardian AI — accent bleu électrique/azur, dark par défaut.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces — pilotées par des variables CSS (voir globals.css), s'adaptent
        // automatiquement selon la présence de la classe "dark" sur <html>.
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          raised: "rgb(var(--surface-raised) / <alpha-value>)",
          border: "rgb(var(--surface-border) / <alpha-value>)",
        },
        // Accent bleu électrique/azur (identique dans les deux thèmes)
        accent: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        // Texte — piloté par variables CSS, cf. globals.css
        ink: {
          primary: "rgb(var(--ink-primary) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
        },
        // Statuts
        status: {
          good: "#34D399",
          warning: "#FBBF24",
          serious: "#FB923C",
          critical: "#F87171",
        },
      },
    },
  },
  plugins: [],
};

export default config;
