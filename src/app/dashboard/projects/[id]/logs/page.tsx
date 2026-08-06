"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { mockProjects, mockLogs, type LogEntry } from "@/lib/mock-data";
import { LevelBadge } from "@/components/dashboard/LevelBadge";
import { SidePanel } from "@/components/dashboard/SidePanel";

export default function ProjectLogsPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  if (!project) {
    notFound();
  }

  const projectLogs = mockLogs.filter((l) => l.projectId === project.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Logs</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Flux des événements bruts remontés par {project.name}. Cliquez sur un log pour son explication en langage clair.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised">
        {projectLogs.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">Aucun log pour ce projet pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-surface-border/10">
            {projectLogs.map((log) => (
              <li key={log.id}>
                <button
                  type="button"
                  onClick={() => setSelectedLog(log)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface-border/5"
                >
                  <LevelBadge level={log.level} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-ink-primary">{log.rawMessage}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {log.source} · {log.time}
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
              <LevelBadge level={selectedLog.level} />
              <span className="text-xs text-ink-muted">
                {selectedLog.source} · {selectedLog.time}
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-ink-secondary">Log brut</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-surface p-3 font-mono text-xs text-ink-primary">
                {selectedLog.rawMessage}
              </pre>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-ink-secondary">Explication en langage clair</p>
              <p className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-3 text-sm text-ink-primary">
                {selectedLog.aiExplanation}
              </p>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
