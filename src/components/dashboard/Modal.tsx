"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  // Rendu via portail dans document.body plutôt qu'à l'endroit où <Modal> est appelé dans
  // l'arbre React : un ancêtre en position sticky/relative (ex: Sidebar.tsx) crée son propre
  // contexte d'empilement, dans lequel le z-index du modal n'est comparé qu'aux autres
  // enfants de cet ancêtre — un graphique ou tout autre élément positionné ailleurs dans la
  // page peut alors passer au-dessus malgré un z-index plus élevé ici. document.body n'existe
  // pas côté serveur, d'où ce mounted pour ne monter le portail qu'après l'hydratation.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer la fenêtre"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative w-full max-w-md rounded-xl border border-surface-border/10 bg-surface-raised shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border/10 px-5 py-4">
          <h2 className="text-sm font-medium text-ink-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-secondary transition hover:bg-surface-border/5 hover:text-ink-primary"
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
