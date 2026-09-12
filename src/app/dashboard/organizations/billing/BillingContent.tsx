"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/components/dashboard/UserContext";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { Modal } from "@/components/dashboard/Modal";
import { TextInput } from "@/components/dashboard/FormField";
import { useOrganization } from "@/lib/use-organization";
import {
  type DowngradePreview,
  type PlanChangePreview,
  getDowngradePreview,
  getDowngradeToSoloPortalUrl,
  getUpgradeToBusinessPortalUrl,
  openBillingPortal,
  previewPlanChange,
  useSubscription,
} from "@/lib/subscription";

const PLAN_LABEL = { solo: "Solo", business: "Business" } as const;
const STATUS_LABEL: Record<string, string> = {
  trialing: "Essai gratuit en cours",
  active: "Actif",
  past_due: "Paiement en échec",
  canceled: "Résilié",
  incomplete: "Paiement non finalisé",
};

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

// Montant à payer (upgrade) ou crédit reporté sur la prochaine facture (downgrade) —
// affiché avant toute confirmation, jamais de changement de plan à l'aveugle.
function PriceChangeNotice({ preview, loading }: { preview: PlanChangePreview | null; loading: boolean }) {
  if (loading) {
    return <p className="text-sm text-ink-secondary">Calcul du montant...</p>;
  }

  if (!preview) {
    return null;
  }

  const isCredit = preview.amountDue < 0;

  return (
    <div className="rounded-lg border border-surface-border/10 bg-surface px-4 py-3">
      <p className="text-sm text-ink-primary">
        {isCredit
          ? `Crédit de ${formatAmount(Math.abs(preview.amountDue), preview.currency)}, déduit de votre prochaine facture.`
          : `${formatAmount(preview.amountDue, preview.currency)} seront prélevés immédiatement (prorata de la période en cours).`}
      </p>
    </div>
  );
}

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

// Le portail Stripe ouvre une seule page regroupant plusieurs actions (moyen de paiement,
// factures, résiliation) : ces trois entrées y mènent toutes, présentées séparément pour
// que chacune soit explicite plutôt qu'un bouton générique "Gérer l'abonnement".
const PORTAL_ACTIONS = [
  { label: "Changer le moyen de paiement", description: "Mettre à jour votre carte bancaire enregistrée." },
  { label: "Voir mes factures", description: "Historique et téléchargement de vos factures." },
  { label: "Résilier mon abonnement", description: "Mettre fin à votre abonnement à la fin de la période en cours." },
] as const;

function BillingPortalSection() {
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
    <SettingsSection
      title="Moyen de paiement et factures"
      description="Géré depuis le portail sécurisé Stripe — vous serez redirigé puis ramené ici."
    >
      <ul className="space-y-2">
        {PORTAL_ACTIONS.map((action) => (
          <li key={action.label}>
            <button
              type="button"
              onClick={handleClick}
              disabled={opening}
              className="flex w-full items-center justify-between rounded-lg border border-surface-border/10 bg-surface px-4 py-3 text-left transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div>
                <p className="text-sm text-ink-primary">{action.label}</p>
                <p className="text-xs text-ink-muted">{action.description}</p>
              </div>
              <span className="text-xs text-ink-muted">→</span>
            </button>
          </li>
        ))}
      </ul>
      {opening && <p className="mt-2 text-sm text-ink-secondary">Ouverture du portail Stripe...</p>}
      {error && <p className="mt-2 text-sm text-status-critical">{error}</p>}
    </SettingsSection>
  );
}

function UpgradeToBusinessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [organizationName, setOrganizationName] = useState("");
  const [priceChange, setPriceChange] = useState<PlanChangePreview | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setLoadingPrice(true);
    previewPlanChange("business")
      .then((preview) => !cancelled && setPriceChange(preview))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Erreur inconnue"))
      .finally(() => !cancelled && setLoadingPrice(false));

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const portalUrl = await getUpgradeToBusinessPortalUrl(organizationName);
      window.location.href = portalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de passer au plan Business.");
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Passer au plan Business">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-ink-secondary">
          Une organisation sera créée avec vos projets actuels. Vous en serez administrateur et pourrez inviter des
          membres. Vous allez être redirigé vers Stripe pour finaliser le paiement.
        </p>
        <TextInput
          label="Nom de l'organisation"
          id="organization-name"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
        />
        <PriceChangeNotice preview={priceChange} loading={loadingPrice} />
        {error && <p className="text-sm text-status-critical">{error}</p>}
        <button
          type="submit"
          disabled={submitting || loadingPrice}
          className="w-full rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Redirection vers Stripe..." : "Continuer vers Stripe"}
        </button>
      </form>
    </Modal>
  );
}

function DowngradeToSoloModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [preview, setPreview] = useState<DowngradePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [priceChange, setPriceChange] = useState<PlanChangePreview | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setLoadingPreview(true);
    getDowngradePreview()
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
        setSelected(data.activeProjects.slice(0, 3).map((p) => p.id));
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Erreur inconnue"))
      .finally(() => !cancelled && setLoadingPreview(false));

    setLoadingPrice(true);
    previewPlanChange("solo")
      .then((data) => !cancelled && setPriceChange(data))
      .catch(() => {
        // Le montant est un complément d'information, pas bloquant : si son calcul échoue
        // (ex: abonnement pas encore actif), on laisse simplement le changement de plan
        // continuer sans afficher de chiffre plutôt que de bloquer tout le flux dessus.
      })
      .finally(() => !cancelled && setLoadingPrice(false));

    return () => {
      cancelled = true;
    };
  }, [open]);

  const toggleProject = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((p) => p !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setSubmitting(true);
    setError(null);

    try {
      const portalUrl = await getDowngradeToSoloPortalUrl(preview.requiresProjectSelection ? selected : undefined);
      window.location.href = portalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de passer au plan Solo.");
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Passer au plan Solo">
      {loadingPreview ? (
        <p className="text-sm text-ink-secondary">Chargement...</p>
      ) : preview?.blockedByMembers ? (
        <p className="text-sm text-ink-secondary">
          Retirez les autres membres de votre organisation avant de repasser au plan Solo — le plan Solo ne peut
          avoir qu'un seul utilisateur.
        </p>
      ) : (
        <div className="space-y-4">
          {preview?.requiresProjectSelection ? (
            <>
              <p className="text-sm text-ink-secondary">
                Le plan Solo est limité à 3 projets. Choisissez ceux à garder actifs — les autres seront masqués et
                réapparaîtront automatiquement si vous repassez au plan Business.
              </p>
              <ul className="space-y-2">
                {preview.activeProjects.map((project) => (
                  <li key={project.id}>
                    <label className="flex items-center gap-2 rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary">
                      <input
                        type="checkbox"
                        checked={selected.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                        disabled={!selected.includes(project.id) && selected.length >= 3}
                      />
                      {project.name}
                    </label>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-muted">{selected.length} / 3 sélectionnés</p>
            </>
          ) : (
            <p className="text-sm text-ink-secondary">
              Votre organisation sera dissoute et l'abonnement repassera à votre compte personnel.
            </p>
          )}
          <p className="text-xs text-ink-muted">Vous allez être redirigé vers Stripe pour finaliser le changement.</p>
          <PriceChangeNotice preview={priceChange} loading={loadingPrice} />
          {error && <p className="text-sm text-status-critical">{error}</p>}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || (preview?.requiresProjectSelection && selected.length === 0)}
            className="w-full rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Redirection vers Stripe..." : "Continuer vers Stripe"}
          </button>
        </div>
      )}
    </Modal>
  );
}

function ChangePlanButton({ plan }: { plan: "solo" | "business" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-surface-border/10 px-4 py-2 text-sm text-ink-primary transition hover:bg-surface-border/5"
      >
        {plan === "solo" ? "Passer à Business" : "Passer à Solo"}
      </button>
      {plan === "solo" ? (
        <UpgradeToBusinessModal open={open} onClose={() => setOpen(false)} />
      ) : (
        <DowngradeToSoloModal open={open} onClose={() => setOpen(false)} />
      )}
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
        <ChangePlanButton plan={subscription.plan} />
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
  // Un compte "personal" peut être membre d'une organisation (invité par un admin) : il
  // dépend alors de l'abonnement Business de l'organisation, pas d'un abonnement Solo
  // propre — la facturation suit son rattachement réel (organizationRole), pas son
  // accountType d'origine.
  const isOrganization = user.organizationRole !== null;
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
      <BillingPortalSection />
    </div>
  );
}
