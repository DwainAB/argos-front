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
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Demande l'explication du log actuellement ouvert dans le panneau à l'IA locale
  // (voir POST /api/logs/:id/explain côté backend). Si déjà en cache, le backend renvoie
  // du JSON classique. Sinon la réponse est streamée en texte brut au fil de la génération
  // par l'IA : on l'affiche au fur et à mesure en mettant à jour aiSummary à chaque chunk,
  // plutôt que d'attendre la fin (qui peut prendre plusieurs secondes).
  async function handleExplain(log: ApiLogEntry) {
    setExplaining(true);
    setExplainError(null);

    try {
      const res = await fetch(`${API_URL}/api/logs/${log.id}/explain`, { method: "POST" });
      if (!res.ok) throw new Error("Réponse non OK");

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        const updated = { ...log, aiSummary: data.explanation as string };
        setSelectedLog(updated);
        setLogs((prev) => prev.map((l) => (l.id === log.id ? updated : l)));
        return;
      }

      if (!res.body) throw new Error("Pas de flux de réponse");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const updated = { ...log, aiSummary: accumulated };
        setSelectedLog(updated);
        setLogs((prev) => prev.map((l) => (l.id === log.id ? updated : l)));
      }
    } catch (err) {
      console.error("Erreur lors de la demande d'explication :", err);
      setExplainError("Impossible d'obtenir une explication pour ce log. Réessayez.");
    } finally {
      setExplaining(false);
    }
  }

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
                  onClick={() => {
                    setSelectedLog(log);
                    setExplainError(null);
                  }}
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
              <div>
                <button
                  type="button"
                  onClick={() => handleExplain(selectedLog)}
                  disabled={explaining}
                  className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {explaining ? "Explication en cours..." : "Explication"}
                </button>
                {explainError && <p className="mt-2 text-xs text-status-critical">{explainError}</p>}
              </div>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  );
}
