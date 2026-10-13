"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { GOOGLE_CLIENT_ID } from "@/lib/config";

// Déclaration minimale du SDK Google Identity Services (chargé via <Script> ci-dessous),
// juste ce dont ce composant a besoin — pas de typage officiel disponible sur npm pour ce SDK.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton(props: { onIdToken: (idToken: string) => void; disabled?: boolean }) {
  const { onIdToken, disabled } = props;
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Le <Script> se charge de façon asynchrone : impossible de dessiner le bouton avant que
  // window.google existe réellement.
  const handleScriptReady = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onIdToken(response.credential),
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
    });

    setScriptLoaded(true);
  }, [onIdToken]);

  // next/script n'exécute l'événement de chargement qu'une seule fois par document (premier
  // chargement du tag <script> dans le DOM) : une navigation client-side ultérieure vers une
  // page qui remonte ce composant (ex: accueil -> /login via <Link>, sans rechargement complet)
  // ne redéclenche jamais onLoad, laissant le bouton désactivé indéfiniment. onReady (ci-dessous,
  // sur <Script>) couvre ce cas, mais si le script est déjà chargé AVANT même le premier rendu de
  // ce montage (onReady peut ne pas se déclencher non plus dans ce cas précis selon la version),
  // ce useEffect sert de filet de sécurité en vérifiant directement window.google.
  useEffect(() => {
    if (window.google) handleScriptReady();
  }, [handleScriptReady]);

  if (!GOOGLE_CLIENT_ID) {
    // Pas de Client ID configuré (dev sans .env rempli) : bouton visuel désactivé plutôt
    // que de planter silencieusement.
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border/10 bg-surface py-2 text-sm font-medium text-ink-muted opacity-50"
      >
        <GoogleIcon className="h-4 w-4" />
        Continuer avec Google
      </button>
    );
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={handleScriptReady} />
      <div ref={buttonRef} className={disabled ? "pointer-events-none opacity-50" : ""} />
      {!scriptLoaded && (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border/10 bg-surface py-2 text-sm font-medium text-ink-muted opacity-50"
        >
          <GoogleIcon className="h-4 w-4" />
          Continuer avec Google
        </button>
      )}
    </>
  );
}
