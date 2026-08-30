"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api-fetch";
import { Modal } from "./Modal";

type GithubInstallResult = { installationId: string; projectId: string | null } | { error: string };

type GithubInstallation = {
  id: number;
  accountLogin: string;
  accountAvatarUrl: string;
};

type GithubConnectButtonProps = {
  projectId: string;
  disabled?: boolean;
  onResult: (result: GithubInstallResult) => void;
  children: React.ReactNode;
  className?: string;
};

// Ouvre l'installation de la GitHub App dans une fenêtre séparée plutôt que de quitter
// Argos AI : le popup se ferme de lui-même une fois l'installation terminée (voir
// /api/integrations/github/callback côté backend) et transmet le résultat ici via
// postMessage, sans qu'il faille recharger la page d'origine.
//
// Avant d'ouvrir ce popup, propose de réutiliser une installation existante : une fois
// l'app déjà installée sur le compte choisi, GitHub ne redirige jamais vers notre
// callback (il dépose directement sur la page de gestion de l'installation côté GitHub),
// donc repasser systématiquement par le popup bloque l'utilisateur dans ce cas précis.
export function GithubConnectButton({ projectId, disabled, onResult, children, className }: GithubConnectButtonProps) {
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [picking, setPicking] = useState(false);
  const [installations, setInstallations] = useState<GithubInstallation[] | null>(null);
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.source !== "argos-github-install") return;

      const { error, installationId, projectId: returnedProjectId } = event.data;
      if (error) {
        onResultRef.current({ error });
      } else {
        onResultRef.current({ installationId, projectId: returnedProjectId ?? null });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const openInstallPopup = () => {
    const width = 640;
    const height = 720;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${API_URL}/api/integrations/github/start?projectId=${projectId}`,
      "argos-github-install",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleClick = async () => {
    setPicking(true);
    setLoadingInstallations(true);
    setPickError(null);

    try {
      const res = await apiFetch("/api/integrations/github/installations");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setInstallations(data.installations ?? []);
    } catch (err) {
      setPickError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingInstallations(false);
    }
  };

  const handlePickInstallation = (installationId: number) => {
    setPicking(false);
    onResultRef.current({ installationId: String(installationId), projectId });
  };

  const handleNewInstallation = () => {
    setPicking(false);
    openInstallPopup();
  };

  return (
    <>
      <button type="button" onClick={handleClick} disabled={disabled} className={className}>
        {children}
      </button>

      <Modal open={picking} onClose={() => setPicking(false)} title="Connecter GitHub">
        {loadingInstallations ? (
          <p className="text-sm text-ink-secondary">Vérification des installations existantes...</p>
        ) : pickError ? (
          <p className="text-sm text-status-critical">{pickError}</p>
        ) : (
          <div className="space-y-4">
            {installations && installations.length > 0 && (
              <div>
                <p className="mb-2 text-sm text-ink-secondary">
                  L'app GitHub Argos AI est déjà installée sur ces comptes :
                </p>
                <ul className="space-y-2">
                  {installations.map((installation) => (
                    <li key={installation.id}>
                      <button
                        type="button"
                        onClick={() => handlePickInstallation(installation.id)}
                        className="flex w-full items-center gap-3 rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-left text-sm transition hover:border-accent-500/30 hover:bg-surface-border/5"
                      >
                        {installation.accountAvatarUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={installation.accountAvatarUrl} alt="" className="h-6 w-6 rounded-full" />
                        )}
                        <span className="text-ink-primary">{installation.accountLogin}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleNewInstallation}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
            >
              {installations && installations.length > 0 ? "Installer sur un autre compte" : "Installer la GitHub App"}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
