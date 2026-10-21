import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GitlabSignInButton } from "./GitlabSignInButton";

const openMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("open", openMock);
  openMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GitlabSignInButton", () => {
  it("ouvre une popup vers le endpoint OAuth GitLab au clic", async () => {
    render(<GitlabSignInButton onResult={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /continuer avec gitlab/i }));

    expect(openMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/integrations/gitlab/start",
      "argos-gitlab-connect",
      expect.stringContaining("width="),
    );
  });

  it("appelle onResult avec le résultat quand un message valide arrive", () => {
    const onResult = vi.fn();
    render(<GitlabSignInButton onResult={onResult} />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "http://localhost:4000",
        data: { source: "argos-gitlab-connect", gitlabUserId: 42, gitlabUserEmail: "x@y.com" },
      }),
    );

    expect(onResult).toHaveBeenCalledWith({ gitlabUserId: 42, gitlabUserEmail: "x@y.com" });
  });

  it("appelle onResult avec l'erreur si le message en contient une", () => {
    const onResult = vi.fn();
    render(<GitlabSignInButton onResult={onResult} />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "http://localhost:4000",
        data: { source: "argos-gitlab-connect", error: "access_denied" },
      }),
    );

    expect(onResult).toHaveBeenCalledWith({ error: "access_denied" });
  });

  it("ignore les messages venant d'une autre origine", () => {
    const onResult = vi.fn();
    render(<GitlabSignInButton onResult={onResult} />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://site-malveillant.com",
        data: { source: "argos-gitlab-connect", gitlabUserId: 42, gitlabUserEmail: null },
      }),
    );

    expect(onResult).not.toHaveBeenCalled();
  });

  it("ignore les messages avec une source différente", () => {
    const onResult = vi.fn();
    render(<GitlabSignInButton onResult={onResult} />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "http://localhost:4000",
        data: { source: "autre-chose", gitlabUserId: 42 },
      }),
    );

    expect(onResult).not.toHaveBeenCalled();
  });

  it("désactive le bouton quand disabled est vrai", () => {
    render(<GitlabSignInButton onResult={vi.fn()} disabled />);

    expect(screen.getByRole("button", { name: /continuer avec gitlab/i })).toBeDisabled();
  });
});
