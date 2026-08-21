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
                <Link
                  href={`/dashboard/projects/${params.id}/alerts/${alert.id}`}
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
