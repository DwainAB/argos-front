import type { Config } from "tailwindcss";

// Palette de marque Guardian AI — accent bleu électrique/azur, dark par défaut.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        surface: {
          DEFAULT: "#0A0D14", // fond principal (dark)
          raised: "#12151F", // cartes / panneaux (dark)
          "light-DEFAULT": "#FFFFFF",
          "light-raised": "#F5F7FA",
        },
        // Accent bleu électrique/azur
        accent: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        // Texte
        ink: {
          primary: "#E5E7EB",
          secondary: "#9CA3AF",
          muted: "#6B7280",
          "light-primary": "#111827",
          "light-secondary": "#4B5563",
          "light-muted": "#9CA3AF",
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
