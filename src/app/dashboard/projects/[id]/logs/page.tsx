"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import { SidePanel } from "@/components/dashboard/SidePanel";

type ApiLogEntry = {
  id: string;
  rawMessage: string;
  level: string;
  category: string;
  source: string;
  aiSummary: string | null;
  createdAt: string;
};

const POLL_INTERVAL_MS = 5000;

export default function ProjectLogsPage({ params }: { params: { id: string } }) {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        const res = await fetch(`${API_URL}/api/projects/${params.id}/logs`);
        const data = await res.json();
        if (!cancelled) setLogs(data.logs ?? []);
      } catch (err) {
        console.error("Erreur lors du chargement des logs :", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [params.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Logs</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Flux des événements bruts reçus en temps réel. Cliquez sur un log pour plus de détails.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised">
        {loading ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">Chargement des logs...</p>
        ) : logs.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">
            Aucun log reçu pour l'instant. Les nouveaux logs apparaîtront ici automatiquement.
          </p>
        ) : (
          <ul className="divide-y divide-surface-border/10">
            {logs.map((log) => (
              <li key={log.id}>
                <button
                  type="button"
                  onClick={() => setSelectedLog(log)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface-border/5"
                >
                  <CategoryBadge category={log.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-ink-primary">{log.rawMessage}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {log.source} · {log.level} · {new Date(log.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SidePanel open={selectedLog !== null} onClose={() => setSelectedLog(null)} title="Détail du log">
        {selectedLog && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <CategoryBadge category={selectedLog.category} />
              <span className="text-xs text-ink-muted">
                {selectedLog.source} · {selectedLog.level} · {new Date(selectedLog.createdAt).toLocaleString("fr-FR")}
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-ink-secondary">Log brut</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-surface p-3 font-mono text-xs text-ink-primary">
                {selectedLog.rawMessage}
              </pre>
            </div>

            {selectedLog.aiSummary ? (
              <div>
                <p className="mb-1 text-xs font-medium text-ink-secondary">Explication en langage clair</p>
                <p className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-3 text-sm text-ink-primary">
                  {selectedLog.aiSummary}
                </p>
              </div>
            ) : (
              <p className="text-xs text-ink-muted">
                L'explication IA n'est pas encore disponible pour ce log.
              </p>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  );
}
