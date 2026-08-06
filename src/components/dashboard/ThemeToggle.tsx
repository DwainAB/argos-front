"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

const options = [
  { value: "dark" as const, label: "Sombre" },
  { value: "light" as const, label: "Clair" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex rounded-lg border border-surface-border/10 bg-surface p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            theme === option.value
              ? "bg-accent-500/10 text-accent-400"
              : "text-ink-secondary hover:text-ink-primary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
