"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const CHECKING_MESSAGE = "Une seconde, je dois vérifier certains de vos logs...";
const DONE_MESSAGE = "C'est bon, tout est en ordre !";
const DONE_VISIBLE_MS = 4000;

// Petite mascotte contextuelle pour le dashboard (distincte d'ArgosMascot, propre à la landing
// page) : apparaît pendant que l'IA trie des logs (triageStatus "checking"), puis affiche un
// message de fin bref avant de disparaître automatiquement — ne demande aucune interaction.
export function TriageMascotBubble({ isChecking }: { isChecking: boolean }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(CHECKING_MESSAGE);
  const wasChecking = useRef(false);

  useEffect(() => {
    if (isChecking) {
      wasChecking.current = true;
      setMessage(CHECKING_MESSAGE);
      setVisible(true);
      return;
    }

    if (wasChecking.current) {
      wasChecking.current = false;
      setMessage(DONE_MESSAGE);
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), DONE_VISIBLE_MS);
      return () => clearTimeout(timeout);
    }
  }, [isChecking]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-30 flex items-end gap-2">
      <div className="animate-pop-in rounded-lg border-2 border-ink-primary bg-surface-raised px-3 py-2 text-xs text-ink-primary shadow-[3px_3px_0_0_rgb(var(--ink-primary))]">
        {message}
      </div>
      <div className="animate-float">
        <Image
          src="/robot-avatar.png"
          alt="Argos"
          width={48}
          height={48}
          className="drop-shadow-lg"
        />
      </div>
    </div>
  );
}
