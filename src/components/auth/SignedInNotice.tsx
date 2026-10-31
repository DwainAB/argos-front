"use client";

import { useState } from "react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";

// Affiché sur /login et /signup quand une session est déjà ouverte : sans ça, Clerk
// redirige sans rien montrer et l'utilisateur ne sait ni avec quel compte il est connecté,
// ni comment en changer (plusieurs comptes sur un même navigateur).
export function SignedInNotice() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress;

  const handleSwitchAccount = async () => {
    setSigningOut(true);
    // Reste sur la page courante : une fois déconnecté, le formulaire Clerk s'affiche.
    await signOut({ redirectUrl: window.location.pathname });
  };

  return (
    <div className="w-full rounded-xl border border-surface-border/10 bg-surface-raised/90 p-6 text-center shadow-2xl shadow-accent-500/5 backdrop-blur">
      <p className="text-sm text-ink-secondary">Vous êtes connecté en tant que</p>
      <p className="mt-1 truncate text-sm font-medium text-ink-primary">{email}</p>

      <div className="mt-5 space-y-2">
        <Link
          href="/dashboard"
          className="block w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-surface shadow-lg shadow-accent-500/20 transition hover:bg-accent-400"
        >
          Continuer
        </Link>
        <button
          type="button"
          onClick={handleSwitchAccount}
          disabled={signingOut}
          className="w-full rounded-lg border border-surface-border/10 bg-surface py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {signingOut ? "Déconnexion..." : "Utiliser un autre compte"}
        </button>
      </div>
    </div>
  );
}
