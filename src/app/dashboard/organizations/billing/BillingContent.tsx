"use client";

import { useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/components/dashboard/UserContext";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { useOrganization } from "@/lib/use-organization";
import { openBillingPortal, useSubscription } from "@/lib/subscription";

const PLAN_LABEL = { solo: "Solo", business: "Business" } as const;
const STATUS_LABEL: Record<string, string> = {
  trialing: "Essai gratuit en cours",
  active: "Actif",
  past_due: "Paiement en échec",
  canceled: "Résilié",
  incomplete: "Paiement non finalisé",
};

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const ratio = limit > 0 ? Math.min(used / limit, 1) : 0;
  const isFull = used >= limit;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-ink-secondary">{label}</span>
        <span className={isFull ? "text-status-critical" : "text-ink-muted"}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-border/10">
        <div
          className={`h-full rounded-full ${isFull ? "bg-status-critical" : "bg-accent-500"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function ManageSubscriptionButton() {
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
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={opening}
        className="rounded-lg border border-surface-border/10 px-4 py-2 text-sm text-ink-primary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {opening ? "Ouverture..." : "Gérer l'abonnement"}
      </button>
      {error && <p className="mt-2 text-sm text-status-critical">{error}</p>}
    </>
  );
}

function PlanSection() {
  const { subscription, loading, error } = useSubscription();

  if (loading) {
    return (
      <SettingsSection title="Plan actuel">
        <p className="text-sm text-ink-secondary">Chargement...</p>
      </SettingsSection>
    );
  }

  if (error || !subscription) {
    return (
      <SettingsSection title="Plan actuel">
        <p className="text-sm text-status-critical">{error ?? "Aucun abonnement trouvé."}</p>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title="Plan actuel">
      <div className="flex items-center justify-between rounded-lg border border-surface-border/10 bg-surface px-4 py-3">
        <div>
          <p className="text-sm text-ink-primary">Plan {PLAN_LABEL[subscription.plan]}</p>
          <p className="text-xs text-ink-muted">{STATUS_LABEL[subscription.status] ?? subscription.status}</p>
        </div>
        <ManageSubscriptionButton />
      </div>

      <div className="mt-4 space-y-3">
        <UsageBar label="SMS ce mois-ci" used={subscription.sms.used} limit={subscription.sms.limit} />
        <UsageBar label="Corrections IA ce mois-ci" used={subscription.fixes.used} limit={subscription.fixes.limit} />
      </div>
    </SettingsSection>
  );
}

export function BillingContent() {
  const user = useCurrentUser();
  const isOrganization = user.accountType === "organization";
  const { organization, loading: orgLoading, error: orgError } = useOrganization();

  if (isOrganization) {
    if (orgLoading) {
      return <div className="p-6 text-sm text-ink-secondary">Chargement...</div>;
    }

    if (orgError || !organization) {
      return (
        <div className="p-6">
          <SettingsSection title="Facturation" description="Impossible de charger votre organisation.">
            <p className="text-sm text-status-critical">{orgError ?? "Organisation introuvable."}</p>
          </SettingsSection>
        </div>
      );
    }

    if (organization.myRole !== "admin") {
      return (
        <div className="p-6">
          <SettingsSection title="Facturation" description="Cette page est réservée aux administrateurs de l'organisation.">
            <p className="text-sm text-ink-secondary">
              Seul un administrateur de {organization.name} peut consulter et gérer la facturation.
            </p>
          </SettingsSection>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        {isOrganization && (
          <Link href="/dashboard/organizations" className="text-xs text-ink-muted hover:text-ink-primary hover:underline">
            ← {organization?.name}
          </Link>
        )}
        <h1 className="mt-1 text-lg font-semibold text-ink-primary">Facturation</h1>
        <p className="text-sm text-ink-secondary">
          {isOrganization
            ? "Plan actuel et gestion de l'abonnement de votre organisation."
            : "Plan actuel et gestion de votre abonnement."}
        </p>
      </div>

      <PlanSection />
    </div>
  );
}
