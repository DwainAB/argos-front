"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-fetch";
import { useProjects } from "@/lib/use-projects";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import { ProjectOwnerBadge } from "@/components/dashboard/ProjectOwnerBadge";
import { ActorLabel, type Actor } from "@/components/dashboard/ActorLabel";

type ApiAlert = {
  id: string;
  explanation: string;
  fixLocation: "code" | "operational" | "external";
  status: "open" | "fix_proposed" | "fix_accepted" | "fix_rejected";
  resolvedAt: string | null;
  resolvedBy: Actor;
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
const PAGE_SIZE = 10;

export default function ProjectAlertsPage({ params }: { params: { id: string } }) {
  const { projects } = useProjects();
  const project = projects.find((p) => p.id === params.id);

  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [page, setPage] = useState(0);
  const [copiedAlertId, setCopiedAlertId] = useState<string | null>(null);

  async function handleCopyAlert(e: React.MouseEvent, alert: ApiAlert) {
    e.preventDefault();
    e.stopPropagation();

    const text = `${alert.explanation}\n\n${alert.logEntry.rawMessage}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAlertId(alert.id);
      setTimeout(() => setCopiedAlertId((current) => (current === alert.id ? null : current)), 1500);
    } catch (err) {
      console.error("Erreur lors de la copie de l'alerte :", err);
    }
  }

  // Revenir à la première page quand on change de vue (alertes actives / historique).
  useEffect(() => {
    setPage(0);
  }, [showHistory]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlerts() {
      try {
        const res = await apiFetch(
          `/api/projects/${params.id}/alerts?resolved=${showHistory ? "true" : "false"}&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`
        );
        const data = await res.json();
        if (!cancelled) {
          setAlerts(data.alerts ?? []);
          setTotal(data.total ?? 0);
        }
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
  }, [params.id, showHistory, page]);

  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-ink-primary">{showHistory ? "Historique des alertes" : "Alertes"}</h1>
            {project && <ProjectOwnerBadge project={project} />}
          </div>
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
              <li key={alert.id} className="group relative">
                <button
                  type="button"
                  onClick={(e) => handleCopyAlert(e, alert)}
                  className="absolute right-3 top-3 z-10 rounded-lg border border-surface-border/10 bg-surface px-2 py-1 text-xs font-medium text-ink-secondary opacity-0 shadow-sm transition hover:bg-surface-border/5 hover:text-ink-primary group-hover:opacity-100"
                >
                  {copiedAlertId === alert.id ? "Copié !" : "Copier"}
                </button>
                <Link
                  href={`/dashboard/projects/${params.id}/alerts/${alert.id}`}
                  className="flex w-full max-w-full items-start gap-3 overflow-hidden px-4 py-3 text-left text-sm transition hover:bg-surface-border/5"
                >
                  <CategoryBadge category={alert.logEntry.category} />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-ink-primary">{alert.explanation}</p>
                      {alert.fixLocation === "external" && (
                        <span className="shrink-0 rounded-full border border-status-warning/20 bg-status-warning/10 px-2 py-0.5 text-xs font-medium text-status-warning">
                          Action externe requise
                        </span>
                      )}
                      {alert.fixLocation === "operational" && (
                        <span className="shrink-0 rounded-full border border-status-warning/20 bg-status-warning/10 px-2 py-0.5 text-xs font-medium text-status-warning">
                          Incident d&apos;infrastructure
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-ink-muted">{alert.logEntry.rawMessage}</p>
                    {showHistory && alert.resolvedBy && (
                      <p className="mt-1 text-xs text-ink-muted">
                        Traitée par <ActorLabel actor={alert.resolvedBy} />
                      </p>
                    )}
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

      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-ink-secondary">
            Page {page + 1} sur {pageCount} · {total} alerte{total > 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="rounded-lg border border-surface-border/10 bg-surface px-3 py-1.5 text-ink-secondary transition hover:bg-surface-border/5 hover:text-ink-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
              disabled={page >= pageCount - 1}
              className="rounded-lg border border-surface-border/10 bg-surface px-3 py-1.5 text-ink-secondary transition hover:bg-surface-border/5 hover:text-ink-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
