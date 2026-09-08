"use client";

import { useState } from "react";
import { useCurrentUser } from "@/components/dashboard/UserContext";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { startCheckout } from "@/lib/subscription";

const PLAN_LABEL = { solo: "Solo", business: "Business" } as const;
const PLAN_PRICE = { solo: "19€/mois", business: "49€/mois" } as const;

export function SubscribeContent() {
  const user = useCurrentUser();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = user.accountType === "organization" ? "business" : "solo";

  const handleSubscribe = async () => {
    setStarting(true);
    setError(null);
    try {
      const url = await startCheckout();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de démarrer le paiement.");
      setStarting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-ink-primary">Activez votre abonnement</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Un abonnement actif est nécessaire pour accéder à votre tableau de bord.
        </p>
      </div>

      <SettingsSection title={`Plan ${PLAN_LABEL[plan]}`} description={PLAN_PRICE[plan]}>
        <p className="text-sm text-ink-secondary">
          {plan === "solo"
            ? "Jusqu'à 3 projets, 10 SMS et 5 corrections IA inclus par mois. Essai gratuit de 14 jours."
            : "Projets et membres illimités, 60 SMS et 30 corrections IA inclus par mois."}
        </p>
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={starting}
          className="mt-4 w-full rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {starting ? "Redirection..." : plan === "solo" ? "Démarrer l'essai gratuit" : "S'abonner"}
        </button>
        {error && <p className="mt-2 text-sm text-status-critical">{error}</p>}
      </SettingsSection>
    </div>
  );
}
