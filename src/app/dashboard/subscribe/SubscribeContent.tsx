"use client";

import { useState } from "react";
import { useCurrentUser } from "@/components/dashboard/UserContext";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { openBillingPortal, startCheckout } from "@/lib/subscription";

const PLAN_LABEL = { solo: "Solo", business: "Business" } as const;
const PLAN_PRICE = { solo: "19€/mois", business: "49€/mois" } as const;

// Un compte bloqué (voir billing-grace-period.job.ts côté backend) a déjà un abonnement en
// échec de paiement depuis plus de 3 jours — ce n'est jamais le cas d'un compte qui n'a
// jamais souscrit. Lui proposer "démarrer un essai"/"s'abonner" serait trompeur et créerait
// un second abonnement au lieu de régulariser celui existant : il doit régler sa facture en
// souffrance via le Customer Portal, pas repasser par un nouveau Checkout.
function BlockedForNonPayment() {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setOpening(true);
    setError(null);
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ouvrir le portail de facturation.");
      setOpening(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-ink-primary">Accès bloqué pour non-paiement</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Le paiement de votre abonnement est en échec depuis plus de 3 jours. Pour retrouver l'accès à vos
          projets existants, réglez la facture en attente — aucun nouvel abonnement n'est nécessaire.
        </p>
      </div>

      <SettingsSection title="Facture en attente">
        <p className="text-sm text-ink-secondary">
          Vous serez redirigé vers Stripe pour mettre à jour votre moyen de paiement et régler le montant dû.
          L'accès à vos projets reprendra automatiquement dès le paiement confirmé.
        </p>
        <button
          type="button"
          onClick={handleClick}
          disabled={opening}
          className="mt-4 w-full rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {opening ? "Ouverture de Stripe..." : "Payer la facture en attente"}
        </button>
        {error && <p className="mt-2 text-sm text-status-critical">{error}</p>}
      </SettingsSection>
    </div>
  );
}

function NeverSubscribed() {
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

export function SubscribeContent() {
  const user = useCurrentUser();
  return user.subscriptionBlocked ? <BlockedForNonPayment /> : <NeverSubscribed />;
}
