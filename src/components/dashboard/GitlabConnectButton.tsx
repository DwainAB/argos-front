"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api-fetch";
import { Modal } from "./Modal";

type GitlabConnectResult = { connectionId: string; gitlabUserLogin: string } | { error: string };

type StoredGitlabConnection = {
  id: string;
  gitlabUserLogin: string;
};

type GitlabConnectButtonProps = {
  disabled?: boolean;
  onResult: (result: GitlabConnectResult) => void;
  children: React.ReactNode;
  className?: string;
};

// Équivalent GitLab de GithubConnectButton.tsx. Différence de fond : GitLab est de l'OAuth2
// utilisateur classique (pas d'"installation" côté GitLab elle-même) — la popup ne renvoie
// donc qu'un token brut par postMessage, jamais persisté tel quel : ce composant l'échange
// immédiatement contre une GitlabConnection en base via POST /api/gitlab-connections, pour
// que le token chiffré ne transite jamais plus loin que cette requête.
export function GitlabConnectButton({ disabled, onResult, children, className }: GitlabConnectButtonProps) {
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [picking, setPicking] = useState(false);
  const [connections, setConnections] = useState<StoredGitlabConnection[] | null>(null);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      // Le popup callback est servi par le backend (API_URL), pas par le frontend — voir
      // GitlabSignInButton.tsx pour le détail de ce correctif.
      if (event.origin !== new URL(API_URL).origin) return;
      if (!event.data || event.data.source !== "argos-gitlab-connect") return;

      const { error, accessToken, refreshToken, expiresIn, gitlabUserId, gitlabUserLogin } = event.data;

      if (error) {
        setConnecting(false);
        onResultRef.current({ error });
        return;
      }

      try {
        const res = await apiFetch("/api/gitlab-connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken, expiresIn, gitlabUserId, gitlabUserLogin }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

        onResultRef.current({ connectionId: data.connectionId, gitlabUserLogin: data.gitlabUserLogin });
      } catch (err) {
        onResultRef.current({ error: err instanceof Error ? err.message : "Erreur inconnue" });
      } finally {
        setConnecting(false);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const openConnectPopup = () => {
    setConnecting(true);
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

  const handleClick = async () => {
    setPicking(true);
    setLoadingConnections(true);
    setPickError(null);

    try {
      const res = await apiFetch("/api/gitlab-connections");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setConnections(data.connections ?? []);
    } catch (err) {
      setPickError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingConnections(false);
    }
  };

  const handlePickConnection = (connection: StoredGitlabConnection) => {
    setPicking(false);
    onResultRef.current({ connectionId: connection.id, gitlabUserLogin: connection.gitlabUserLogin });
  };

  const handleNewConnection = () => {
    setPicking(false);
    openConnectPopup();
  };

  return (
    <>
      <button type="button" onClick={handleClick} disabled={disabled} className={className}>
        {children}
      </button>

      <Modal open={picking} onClose={() => setPicking(false)} title="Connecter GitLab">
        {loadingConnections ? (
          <p className="text-sm text-ink-secondary">Vérification des connexions existantes...</p>
        ) : pickError ? (
          <p className="text-sm text-status-critical">{pickError}</p>
        ) : connecting ? (
          <p className="text-sm text-ink-secondary">Connexion en cours dans la fenêtre GitLab...</p>
        ) : (
          <div className="space-y-4">
            {connections && connections.length > 0 && (
              <div>
                <p className="mb-2 text-sm text-ink-secondary">Comptes GitLab déjà connectés :</p>
                <ul className="space-y-2">
                  {connections.map((connection) => (
                    <li key={connection.id}>
                      <button
                        type="button"
                        onClick={() => handlePickConnection(connection)}
                        className="flex w-full items-center gap-3 rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-left text-sm transition hover:border-accent-500/30 hover:bg-surface-border/5"
                      >
                        <span className="text-ink-primary">{connection.gitlabUserLogin}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleNewConnection}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
            >
              {connections && connections.length > 0 ? "Connecter un autre compte" : "Connecter GitLab"}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
