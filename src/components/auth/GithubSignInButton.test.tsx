import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GithubSignInButton } from "./GithubSignInButton";

const openMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("open", openMock);
  openMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GithubSignInButton", () => {
  it("ouvre une popup vers le endpoint de connexion GitHub au clic", async () => {
    render(<GithubSignInButton onResult={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /continuer avec github/i }));

    expect(openMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/integrations/github-login/start",
      "argos-github-login",
      expect.stringContaining("width="),
    );
  });

  it("appelle onResult avec le résultat quand un message valide arrive", () => {
    const onResult = vi.fn();
    render(<GithubSignInButton onResult={onResult} />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "http://localhost:4000",
        data: { source: "argos-github-login", githubUserId: 7, githubUserEmail: "x@y.com" },
      }),
    );

    expect(onResult).toHaveBeenCalledWith({ githubUserId: 7, githubUserEmail: "x@y.com" });
  });

  it("appelle onResult avec l'erreur si le message en contient une", () => {
    const onResult = vi.fn();
    render(<GithubSignInButton onResult={onResult} />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "http://localhost:4000",
        data: { source: "argos-github-login", error: "access_denied" },
      }),
    );

    expect(onResult).toHaveBeenCalledWith({ error: "access_denied" });
  });

  it("ignore les messages venant d'une autre origine", () => {
    const onResult = vi.fn();
    render(<GithubSignInButton onResult={onResult} />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://site-malveillant.com",
        data: { source: "argos-github-login", githubUserId: 7 },
      }),
    );

    expect(onResult).not.toHaveBeenCalled();
  });

  it("désactive le bouton quand disabled est vrai", () => {
    render(<GithubSignInButton onResult={vi.fn()} disabled />);

    expect(screen.getByRole("button", { name: /continuer avec github/i })).toBeDisabled();
  });
});
