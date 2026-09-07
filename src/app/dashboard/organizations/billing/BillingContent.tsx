"use client";

import Link from "next/link";
import { useCurrentUser } from "@/components/dashboard/UserContext";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { useOrganization } from "@/lib/use-organization";

export function BillingContent() {
  const user = useCurrentUser();
  const { organization, loading, error } = useOrganization();

  if (user.accountType !== "organization") {
    return (
      <div className="p-6">
        <SettingsSection title="Facturation" description="Cette page est réservée aux comptes organisation.">
          <p className="text-sm text-ink-secondary">
            Vous utilisez un compte personnel. La facturation ne concerne que les organisations.
          </p>
        </SettingsSection>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-sm text-ink-secondary">Chargement...</div>;
  }

  if (error || !organization) {
    return (
      <div className="p-6">
        <SettingsSection title="Facturation" description="Impossible de charger votre organisation.">
          <p className="text-sm text-status-critical">{error ?? "Organisation introuvable."}</p>
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href="/dashboard/organizations" className="text-xs text-ink-muted hover:text-ink-primary hover:underline">
          ← {organization.name}
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-ink-primary">Facturation</h1>
        <p className="text-sm text-ink-secondary">Plan actuel et gestion de l'abonnement de votre organisation.</p>
      </div>

      <SettingsSection title="Plan actuel">
        <div className="flex items-center justify-between rounded-lg border border-surface-border/10 bg-surface px-4 py-3">
          <div>
            <p className="text-sm text-ink-primary">Plan Gratuit</p>
            <p className="text-xs text-ink-muted">Facturation à venir.</p>
          </div>
          <button
            type="button"
            disabled
            className="rounded-lg border border-surface-border/10 px-4 py-2 text-sm text-ink-muted disabled:cursor-not-allowed"
          >
            Gérer l'abonnement
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
