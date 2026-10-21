import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

beforeEach(() => {
  window.localStorage.clear();
});

describe("ThemeToggle", () => {
  it("affiche les deux options Sombre et Clair", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByRole("button", { name: "Sombre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clair" })).toBeInTheDocument();
  });

  it("passe en thème clair au clic sur 'Clair' et persiste en localStorage", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "Clair" }));

    expect(window.localStorage.getItem("argos-ai-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("repasse en thème sombre au clic sur 'Sombre'", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "Clair" }));
    await userEvent.click(screen.getByRole("button", { name: "Sombre" }));

    expect(window.localStorage.getItem("argos-ai-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
