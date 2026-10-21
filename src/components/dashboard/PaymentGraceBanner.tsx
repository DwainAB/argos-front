"use client";

import { useState } from "react";
import { useCurrentUser } from "./UserContext";
import { openBillingPortal } from "@/lib/subscription";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function UpdatePaymentMethodLink({ children }: { children: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading} className="underline disabled:opacity-60">
      {loading ? "Ouverture de Stripe..." : children}
    </button>
  );
}

// Affiché sur toutes les pages du dashboard (pas seulement la page facturation) : un échec
// de paiement laisse l'accès actif pendant le délai de grâce (voir hasActiveAccess côté
// backend), mais l'utilisateur doit être prévenu partout, pas seulement s'il pense à aller
// consulter sa facturation.
export function PaymentGraceBanner() {
  const user = useCurrentUser();

  if (user.subscriptionBlocked) {
    return (
      <div className="border-b border-status-critical/30 bg-status-critical/10 px-4 py-2 text-center text-sm text-status-critical">
        Accès bloqué : le paiement de votre abonnement est en échec depuis plus de 3 jours. Le streaming de vos
        logs est arrêté —{" "}
        <UpdatePaymentMethodLink>mettez à jour votre moyen de paiement</UpdatePaymentMethodLink>.
      </div>
    );
  }

  if (user.paymentGraceDeadline) {
    return (
      <div className="border-b border-status-warning/30 bg-status-warning/10 px-4 py-2 text-center text-sm text-ink-primary">
        Le dernier paiement de votre abonnement a échoué. Réglez-le avant le{" "}
        {formatDate(user.paymentGraceDeadline)}, sous peine de blocage de l&apos;accès —{" "}
        <UpdatePaymentMethodLink>mettre à jour mon moyen de paiement</UpdatePaymentMethodLink>.
      </div>
    );
  }

  return null;
}
