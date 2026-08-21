"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import { SidePanel } from "@/components/dashboard/SidePanel";

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

const POLL_INTERVAL_MS = 5000;

export default function ProjectAlertsPage({ params }: { params: { id: string } }) {
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<ApiAlert | null>(null);
  const [requestingFix, setRequestingFix] = useState(false);
  const [decidingFix, setDecidingFix] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlerts() {
      try {
        const res = await fetch(`${API_URL}/api/projects/${params.id}/alerts`);
        const data = await res.json();
        if (!cancelled) setAlerts(data.alerts ?? []);
      } catch (err) {
        console.error("Erreur lors du chargement des alertes :", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [params.id]);

  function updateAlert(updated: ApiAlert) {
    setSelectedAlert(updated);
    setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  // Déclenche la proposition de correctif par l'IA distante (exploration du repo GitHub,
  // voir POST /api/alerts/:id/fix/request côté backend). Peut prendre plusieurs dizaines
  // de secondes selon la complexité de l'exploration.
  async function handleRequestFix(alert: ApiAlert) {
    setRequestingFix(true);
    setFixError(null);

    try {
      const res = await fetch(`${API_URL}/api/alerts/${alert.id}/fix/request`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      updateAlert(data.alert);
    } catch (err) {
      console.error("Erreur lors de la demande de correction :", err);
      setFixError("L'IA n'a pas pu proposer de correctif fiable pour cette alerte.");
    } finally {
      setRequestingFix(false);
    }
  }

  async function handleDecideFix(alert: ApiAlert, decision: "accept" | "reject") {
    setDecidingFix(true);
    setFixError(null);

    try {
      const res = await fetch(`${API_URL}/api/alerts/${alert.id}/fix/${decision}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      updateAlert(data.alert);
    } catch (err) {
      console.error(`Erreur lors de la décision (${decision}) :`, err);
      setFixError("Impossible d'enregistrer votre décision. Réessayez.");
    } finally {
      setDecidingFix(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Alertes</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Problèmes confirmés par l'IA dans les logs de ce projet. Cliquez sur une alerte pour voir le détail.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised">
        {loading ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">Chargement des alertes...</p>
        ) : alerts.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">
            Aucune alerte pour ce projet. Tout va bien.
          </p>
        ) : (
          <ul className="divide-y divide-surface-border/10">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAlert(alert);
                    setFixError(null);
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface-border/5"
                >
                  <CategoryBadge category={alert.logEntry.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink-primary">{alert.explanation}</p>
                    <p className="mt-1 truncate font-mono text-xs text-ink-muted">{alert.logEntry.rawMessage}</p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {new Date(alert.createdAt).toLocaleString("fr-FR")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SidePanel open={selectedAlert !== null} onClose={() => setSelectedAlert(null)} title="Détail de l'alerte">
        {selectedAlert && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <CategoryBadge category={selectedAlert.logEntry.category} />
              <span className="text-xs text-ink-muted">
                {new Date(selectedAlert.createdAt).toLocaleString("fr-FR")}
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-ink-secondary">Pourquoi cette alerte ?</p>
              <p className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-3 text-sm text-ink-primary">
                {selectedAlert.explanation}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-ink-secondary">Log brut</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-surface p-3 font-mono text-xs text-ink-primary">
                {selectedAlert.logEntry.rawMessage}
              </pre>
            </div>

            {selectedAlert.status === "open" && (
              <div>
                <button
                  type="button"
                  onClick={() => handleRequestFix(selectedAlert)}
                  disabled={requestingFix}
                  className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {requestingFix ? "Analyse du dépôt en cours..." : "Demander une correction par IA"}
                </button>
                {fixError && <p className="mt-2 text-xs text-status-critical">{fixError}</p>}
              </div>
            )}

            {selectedAlert.status !== "open" && selectedAlert.proposedFilePath && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-ink-secondary">
                  Correctif proposé — {selectedAlert.proposedFilePath}
                </p>

                <div>
                  <p className="mb-1 text-xs text-ink-muted">Code actuel</p>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-status-critical/20 bg-status-critical/5 p-3 font-mono text-xs text-ink-primary">
                    {selectedAlert.proposedOldCode}
                  </pre>
                </div>

                <div>
                  <p className="mb-1 text-xs text-ink-muted">Code proposé</p>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-status-good/20 bg-status-good/5 p-3 font-mono text-xs text-ink-primary">
                    {selectedAlert.proposedNewCode}
                  </pre>
                </div>

                {selectedAlert.status === "fix_proposed" && (
                  <div>
                    <p className="mb-2 text-sm text-ink-primary">Voulez-vous que l'IA fasse une pull request ?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecideFix(selectedAlert, "accept")}
                        disabled={decidingFix}
                        className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecideFix(selectedAlert, "reject")}
                        disabled={decidingFix}
                        className="rounded-lg border border-surface-border/10 bg-surface px-4 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Refuser
                      </button>
                    </div>
                    {fixError && <p className="mt-2 text-xs text-status-critical">{fixError}</p>}
                  </div>
                )}

                {selectedAlert.status === "fix_accepted" && selectedAlert.pullRequestUrl && (
                  <p className="rounded-lg border border-status-good/20 bg-status-good/5 p-3 text-sm text-ink-primary">
                    Accepté — pull request créée :{" "}
                    <a href={selectedAlert.pullRequestUrl} target="_blank" rel="noreferrer" className="underline">
                      {selectedAlert.pullRequestUrl}
                    </a>
                  </p>
                )}

                {selectedAlert.status === "fix_rejected" && (
                  <p className="rounded-lg border border-surface-border/10 bg-surface p-3 text-sm text-ink-secondary">
                    Refusé — aucune pull request n'a été créée.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  );
}
