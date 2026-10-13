"use client";

import { useEffect, useRef } from "react";
import { API_URL } from "@/lib/config";
import { GithubIcon } from "@/components/icons/GithubIcon";

type GithubSignInResult = { githubUserId: number; githubUserEmail: string | null } | { error: string };

type GithubSignInButtonProps = {
  onResult: (result: GithubSignInResult) => void;
  disabled?: boolean;
};

// Même mécanique que GitlabSignInButton.tsx : popup OAuth, résultat transmis par postMessage
// une fois le code échangé côté serveur (voir github-login.route.ts). Distinct du flow
// d'installation de la GitHub App sur un dépôt (GithubConnectButton.tsx) : ici le but est
// uniquement de se connecter à Argos AI.
export function GithubSignInButton({ onResult, disabled }: GithubSignInButtonProps) {
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== new URL(API_URL).origin) return;
      if (!event.data || event.data.source !== "argos-github-login") return;

      const { error, githubUserId, githubUserEmail } = event.data;
      if (error) {
        onResultRef.current({ error });
      } else {
        onResultRef.current({ githubUserId, githubUserEmail: githubUserEmail ?? null });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleClick = () => {
    const width = 640;
    const height = 720;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${API_URL}/api/integrations/github-login/start`,
      "argos-github-login",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border/10 bg-surface py-2 text-sm font-medium text-ink-primary transition hover:border-accent-500/30 hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <GithubIcon className="h-4 w-4" />
      Continuer avec GitHub
    </button>
  );
}
