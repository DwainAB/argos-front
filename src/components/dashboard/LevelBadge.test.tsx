import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LevelBadge } from "./LevelBadge";
import type { LogLevel } from "@/lib/mock-data";

describe("LevelBadge", () => {
  const cases: [LogLevel, string][] = [
    ["info", "Info"],
    ["warning", "Avertissement"],
    ["error", "Erreur"],
  ];

  cases.forEach(([level, expected]) => {
    it(`affiche '${expected}' pour le niveau '${level}'`, () => {
      render(<LevelBadge level={level} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
