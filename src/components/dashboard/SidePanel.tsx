"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type SidePanelProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function SidePanel({ open, onClose, title, children }: SidePanelProps) {
  // Voir Modal.tsx pour le détail : un portail évite qu'un ancêtre sticky/relative (ex:
  // Sidebar.tsx) ne piège ce panneau dans son propre contexte d'empilement.
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
    <div className="fixed inset-0 z-30 flex justify-end">
      <button
        type="button"
        aria-label="Fermer le panneau"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-surface-border/10 bg-surface-raised shadow-2xl">
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
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
