"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";

type ApiAlert = {
  id: string;
  explanation: string;
  status: "open" | "fix_proposed" | "fix_accepted" | "fix_rejected";
  createdAt: string;
  proposedFilePath: string | null;
  proposedOldCode: string | null;
  proposedNewCode: string | null;
  pullRequestUrl: string | null;
  logEntry: {
    id: string;
    rawMessage: string;
    level: string;
    category: string;
    source: string;
    createdAt: string;
  };
};

export default function AlertDetailPage({ params }: { params: { id: string; alertId: string } }) {
  const [alert, setAlert] = useState<ApiAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [requestingFix, setRequestingFix] = useState(false);
  const [decidingFix, setDecidingFix] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlert() {
      try {
        const res = await fetch(`${API_URL}/api/alerts/${params.alertId}`);
        if (!res.ok) throw new Error("Réponse non OK");
        const data = await res.json();
        if (!cancelled) setAlert(data.alert);
      } catch (err) {
        console.error("Erreur lors du chargement de l'alerte :", err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAlert();
  }, [params.alertId]);

  // Déclenche la proposition de correctif par l'IA distante (exploration du repo GitHub,
  // voir POST /api/alerts/:id/fix/request côté backend). Peut prendre plusieurs dizaines
  // de secondes selon la complexité de l'exploration.
  async function handleRequestFix() {
    if (!alert) return;
    setRequestingFix(true);
    setFixError(null);

    try {
      const res = await fetch(`${API_URL}/api/alerts/${alert.id}/fix/request`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setAlert(data.alert);
    } catch (err) {
      console.error("Erreur lors de la demande de correction :", err);
      setFixError("L'IA n'a pas pu proposer de correctif fiable pour cette alerte.");
    } finally {
      setRequestingFix(false);
    }
  }

  async function handleDecideFix(decision: "accept" | "reject") {
    if (!alert) return;
    setDecidingFix(true);
    setFixError(null);

    try {
      const res = await fetch(`${API_URL}/api/alerts/${alert.id}/fix/${decision}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setAlert(data.alert);
    } catch (err) {
      console.error(`Erreur lors de la décision (${decision}) :`, err);
      setFixError("Impossible d'enregistrer votre décision. Réessayez.");
    } finally {
      setDecidingFix(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-secondary">Chargement de l'alerte...</p>;
  }

  if (loadError || !alert) {
    return <p className="text-sm text-status-critical">Impossible de charger cette alerte.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/projects/${params.id}/alerts`}
          className="text-sm text-ink-secondary transition hover:text-ink-primary"
        >
          ← Retour aux alertes
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <CategoryBadge category={alert.logEntry.category} />
          <span className="text-xs text-ink-muted">{new Date(alert.createdAt).toLocaleString("fr-FR")}</span>
        </div>
      </div>

      <section className="rounded-xl border border-surface-border/10 bg-surface-raised p-4">
        <h2 className="mb-2 text-sm font-medium text-ink-secondary">Erreur</h2>
        <pre className="max-h-80 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-surface p-3 font-mono text-xs text-ink-primary">
          {alert.logEntry.rawMessage}
        </pre>
      </section>

      <section className="rounded-xl border border-surface-border/10 bg-surface-raised p-4">
        <h2 className="mb-2 text-sm font-medium text-ink-secondary">Pourquoi cette alerte ?</h2>
        <p className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-3 text-sm text-ink-primary">
          {alert.explanation}
        </p>
      </section>

      {alert.status === "open" && (
        <section className="rounded-xl border border-surface-border/10 bg-surface-raised p-4">
          <button
            type="button"
            onClick={handleRequestFix}
            disabled={requestingFix}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {requestingFix ? "Analyse du dépôt en cours..." : "Demander une correction par IA"}
          </button>
          {fixError && <p className="mt-2 text-xs text-status-critical">{fixError}</p>}
        </section>
      )}

      {alert.status !== "open" && alert.proposedFilePath && (
        <section className="space-y-3 rounded-xl border border-surface-border/10 bg-surface-raised p-4">
          <h2 className="text-sm font-medium text-ink-secondary">Correctif proposé — {alert.proposedFilePath}</h2>

          <div>
            <p className="mb-1 text-xs text-ink-muted">Code actuel</p>
            <pre className="max-h-80 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-status-critical/20 bg-status-critical/5 p-3 font-mono text-xs text-ink-primary">
              {alert.proposedOldCode}
            </pre>
          </div>

          <div>
            <p className="mb-1 text-xs text-ink-muted">Code proposé</p>
            <pre className="max-h-80 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-status-good/20 bg-status-good/5 p-3 font-mono text-xs text-ink-primary">
              {alert.proposedNewCode}
            </pre>
          </div>

          {alert.status === "fix_proposed" && (
            <div>
              <p className="mb-2 text-sm text-ink-primary">Voulez-vous que l'IA fasse une pull request ?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDecideFix("accept")}
                  disabled={decidingFix}
                  className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Accepter
                </button>
                <button
                  type="button"
                  onClick={() => handleDecideFix("reject")}
                  disabled={decidingFix}
                  className="rounded-lg border border-surface-border/10 bg-surface px-4 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Refuser
                </button>
              </div>
              {fixError && <p className="mt-2 text-xs text-status-critical">{fixError}</p>}
            </div>
          )}

          {alert.status === "fix_accepted" && alert.pullRequestUrl && (
            <p className="rounded-lg border border-status-good/20 bg-status-good/5 p-3 text-sm text-ink-primary">
              Accepté — pull request créée :{" "}
              <a href={alert.pullRequestUrl} target="_blank" rel="noreferrer" className="underline">
                {alert.pullRequestUrl}
              </a>
            </p>
          )}

          {alert.status === "fix_rejected" && (
            <p className="rounded-lg border border-surface-border/10 bg-surface p-3 text-sm text-ink-secondary">
              Refusé — aucune pull request n'a été créée.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
