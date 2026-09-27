"use client";

import { useEffect, useRef } from "react";
import { API_URL } from "@/lib/config";

type GitlabSignInResult = { gitlabUserId: number; gitlabUserEmail: string | null } | { error: string };

type GitlabSignInButtonProps = {
  onResult: (result: GitlabSignInResult) => void;
  disabled?: boolean;
};

// Réutilise la même popup OAuth que GitlabConnectButton.tsx (connexion d'un dépôt à un
// projet) — mais ici sans projectId, et le résultat sert à se connecter à Argos AI lui-même
// plutôt qu'à associer un dépôt. Contrairement à Google (Identity Services, id_token obtenu
// sans jamais quitter la page), GitLab impose un vrai flow OAuth2 par redirection : d'où la
// popup, absente du bouton Google.
export function GitlabSignInButton({ onResult, disabled }: GitlabSignInButtonProps) {
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Le popup callback est servi par le backend (API_URL, ex: localhost:4000 en dev),
      // pas par le frontend (window.location.origin) — comparer contre ce dernier rejetait
      // à tort le message, empêchant toute connexion de se terminer.
      if (event.origin !== new URL(API_URL).origin) return;
      if (!event.data || event.data.source !== "argos-gitlab-connect") return;

      const { error, gitlabUserId, gitlabUserEmail } = event.data;
      if (error) {
        onResultRef.current({ error });
      } else {
        onResultRef.current({ gitlabUserId, gitlabUserEmail: gitlabUserEmail ?? null });
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
      `${API_URL}/api/integrations/gitlab/start`,
      "argos-gitlab-connect",
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
      <GitlabIcon className="h-4 w-4" />
      Continuer avec GitLab
    </button>
  );
}

function GitlabIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m21.94 13.11-1.05-3.22-2.08-6.41a.44.44 0 0 0-.17-.22.47.47 0 0 0-.54 0 .44.44 0 0 0-.17.22L16.04 9.5H7.96L6.07 3.48a.44.44 0 0 0-.17-.22.47.47 0 0 0-.54 0 .44.44 0 0 0-.17.22L3.11 9.89l-1.05 3.22a.79.79 0 0 0 .29.88l9.65 7.01 9.65-7.01a.79.79 0 0 0 .29-.88Z" />
    </svg>
  );
}
