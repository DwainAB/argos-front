"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api-fetch";

export type SubscriptionInfo = {
  plan: "solo" | "business";
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  // true une fois le délai de grâce de paiement écoulé (voir billing-grace-period.job.ts
  // côté backend) — à ce stade, le streaming de logs est arrêté, pas seulement le statut
  // affiché. paymentGraceDeadline est la date limite tant que blocked est encore false.
  blocked: boolean;
  paymentGraceDeadline: string | null;
  sms: { used: number; limit: number };
  fixes: { used: number; limit: number };
  codeAnalyses: { used: number; limit: number };
};

export async function startCheckout(): Promise<string> {
  const res = await apiFetch("/api/subscription/checkout", { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Impossible de démarrer le paiement.");
  return data.url as string;
}

export async function openBillingPortal(): Promise<string> {
  const res = await apiFetch("/api/subscription/portal", { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Impossible d'ouvrir le portail de facturation.");
  return data.url as string;
}

export type DowngradePreview = {
  memberCount: number;
  activeProjects: { id: string; name: string }[];
  blockedByMembers: boolean;
  requiresProjectSelection: boolean;
};

export async function getDowngradePreview(): Promise<DowngradePreview> {
  const res = await apiFetch("/api/subscription/downgrade-preview");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Impossible de préparer le changement de plan.");
  return data as DowngradePreview;
}

export type PlanChangePreview = { amountDue: number; currency: string };

export async function previewPlanChange(newPlan: "solo" | "business"): Promise<PlanChangePreview> {
  const res = await apiFetch(`/api/subscription/preview-plan-change?plan=${newPlan}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Impossible de calculer le montant du changement de plan.");
  return data as PlanChangePreview;
}

export async function getUpgradeToBusinessPortalUrl(organizationName: string): Promise<string> {
  const res = await apiFetch("/api/subscription/upgrade-to-business", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Impossible de passer au plan Business.");
  return data.portalUrl as string;
}

// Le downgrade est programmé pour la fin de la période de facturation en cours, sans
// proration (voir plan-change.service.ts côté backend) : pas de redirection vers Stripe, la
// date à laquelle le changement prendra effet est renvoyée directement.
export async function scheduleDowngradeToSolo(keepProjectIds?: string[]): Promise<{ effectiveAt: string }> {
  const res = await apiFetch("/api/subscription/downgrade-to-solo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keepProjectIds }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Impossible de passer au plan Solo.");
  return data as { effectiveAt: string };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    return apiFetch("/api/subscription/me")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error ?? "Impossible de récupérer l'abonnement.");
          return;
        }
        setSubscription(data.subscription);
        setError(null);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement de l'abonnement :", err);
        setError("Impossible de récupérer l'abonnement.");
      });
  };

  useEffect(() => {
    let cancelled = false;

    refetch().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { subscription, loading, error, refetch };
}
