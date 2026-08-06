"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { mockProjects, mockAlerts, type Alert } from "@/lib/mock-data";
import { LevelBadge } from "@/components/dashboard/LevelBadge";
import { SidePanel } from "@/components/dashboard/SidePanel";

export default function ProjectAlertsPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  if (!project) {
    notFound();
  }

  const projectAlerts = mockAlerts.filter((a) => a.projectId === project.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Alertes</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Problèmes détectés sur {project.name}. Cliquez sur une alerte pour voir le détail et la cause probable.
        </p>
      </div>

      {projectAlerts.length === 0 ? (
        <div className="rounded-xl border border-surface-border/10 bg-surface-raised p-6 text-center text-sm text-ink-secondary">
          Aucune alerte pour ce projet. Tout va bien.
        </div>
      ) : (
        <ul className="space-y-3">
          {projectAlerts.map((alert) => (
            <li key={alert.id}>
              <button
                type="button"
                onClick={() => setSelectedAlert(alert)}
                className="flex w-full items-start gap-3 rounded-xl border border-surface-border/10 bg-surface-raised p-4 text-left transition hover:bg-surface-border/5"
              >
                <LevelBadge level={alert.level} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-primary">{alert.title}</p>
                  <p className="mt-1 truncate text-xs text-ink-muted">{alert.message}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-muted">{alert.time}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <SidePanel open={selectedAlert !== null} onClose={() => setSelectedAlert(null)} title="Détail de l'alerte">
        {selectedAlert && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <LevelBadge level={selectedAlert.level} />
              <span className="text-xs text-ink-muted">{selectedAlert.time}</span>
            </div>

            <div>
              <p className="text-sm font-medium text-ink-primary">{selectedAlert.title}</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-surface p-3 font-mono text-xs text-ink-primary">
                {selectedAlert.message}
              </pre>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-ink-secondary">Pourquoi cette alerte ?</p>
              <p className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-3 text-sm text-ink-primary">
                {selectedAlert.aiExplanation}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-ink-secondary">Suggestion</p>
              <p className="rounded-lg border border-surface-border/10 bg-surface p-3 text-sm text-ink-primary">
                {selectedAlert.suggestion}
              </p>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
