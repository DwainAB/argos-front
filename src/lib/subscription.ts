"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api-fetch";

export type SubscriptionInfo = {
  plan: "solo" | "business";
  status: string;
  currentPeriodEnd: string | null;
  sms: { used: number; limit: number };
  fixes: { used: number; limit: number };
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

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/subscription/me")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data.error ?? "Impossible de récupérer l'abonnement.");
          return;
        }
        setSubscription(data.subscription);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement de l'abonnement :", err);
        if (!cancelled) setError("Impossible de récupérer l'abonnement.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { subscription, loading, error };
}
