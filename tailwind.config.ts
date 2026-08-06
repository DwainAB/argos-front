import type { Config } from "tailwindcss";

// Palette de marque Guardian AI — accent ambre/orange, dark par défaut.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        surface: {
          DEFAULT: "#0F0D0A", // fond principal (dark)
          raised: "#18130D", // cartes / panneaux (dark)
          "light-DEFAULT": "#FFFFFF",
          "light-raised": "#F9F5F0",
        },
        // Accent ambre/orange
        accent: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
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
