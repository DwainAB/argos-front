"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-fetch";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";

type ApiAlert = {
  id: string;
  explanation: string;
  status: "open" | "fix_proposed" | "fix_accepted" | "fix_rejected";
  resolvedAt: string | null;
  createdAt: string;
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
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlerts() {
      try {
        const res = await apiFetch(
          `/api/projects/${params.id}/alerts?resolved=${showHistory ? "true" : "false"}`
        );
        const data = await res.json();
        if (!cancelled) setAlerts(data.alerts ?? []);
      } catch (err) {
        console.error("Erreur lors du chargement des alertes :", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [params.id, showHistory]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">{showHistory ? "Historique des alertes" : "Alertes"}</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {showHistory
              ? "Alertes déjà traitées pour ce projet."
              : "Problèmes confirmés par l'IA dans les logs de ce projet. Cliquez sur une alerte pour voir le détail."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition ${
            showHistory
              ? "border-accent-500/20 bg-accent-500/10 text-accent-400"
              : "border-surface-border/10 bg-surface text-ink-secondary hover:bg-surface-border/5 hover:text-ink-primary"
          }`}
        >
          {showHistory ? "← Retour aux alertes" : "Historique"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised">
        {loading ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">Chargement des alertes...</p>
        ) : alerts.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">
            {showHistory ? "Aucune alerte traitée pour l'instant." : "Aucune alerte pour ce projet. Tout va bien."}
          </p>
        ) : (
          <ul className="divide-y divide-surface-border/10">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <Link
                  href={`/dashboard/projects/${params.id}/alerts/${alert.id}`}
                  className="flex w-full max-w-full items-start gap-3 overflow-hidden px-4 py-3 text-left text-sm transition hover:bg-surface-border/5"
                >
                  <CategoryBadge category={alert.logEntry.category} />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-ink-primary">{alert.explanation}</p>
                    <p className="mt-1 truncate font-mono text-xs text-ink-muted">{alert.logEntry.rawMessage}</p>
                  </div>
                  <span className="flex shrink-0 flex-col items-end text-xs text-ink-muted">
                    <span>
                      {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <span>
                      {new Date(alert.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
