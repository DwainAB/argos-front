"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProjects } from "@/lib/use-projects";
import { apiFetch } from "@/lib/api-fetch";
import { ProjectOwnerBadge } from "@/components/dashboard/ProjectOwnerBadge";

type ProjectOverview = { errorCount: number; warningCount: number };

export default function AllProjectsPage() {
  const { projects, loading } = useProjects();

  const [overviews, setOverviews] = useState<Record<string, ProjectOverview>>({});

  useEffect(() => {
    if (projects.length === 0) {
      setOverviews({});
      return;
    }

    let cancelled = false;

    Promise.all(
      projects.map((project) =>
        apiFetch(`/api/projects/${project.id}/overview`)
          .then((res) => res.json())
          .then((data) => [project.id, { errorCount: data.errorCount ?? 0, warningCount: data.warningCount ?? 0 }] as const)
          .catch((err) => {
            console.error(`Erreur lors du chargement de l'aperçu du projet ${project.id} :`, err);
            return [project.id, { errorCount: 0, warningCount: 0 }] as const;
          })
      )
    ).then((entries) => {
      if (!cancelled) setOverviews(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink-primary">Tous les projets</h1>

      <div className="overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised">
        {loading ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">Chargement des projets...</p>
        ) : projects.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-ink-secondary">Vous n'avez actuellement aucun projet connecté.</p>
            <Link
              href="/dashboard/projects/new"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
            >
              Ajouter un projet
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-surface-border/10">
            {projects.map((project) => {
              const overview = overviews[project.id];
              const status = (overview?.errorCount ?? 0) > 0 ? "critical" : (overview?.warningCount ?? 0) > 0 ? "warning" : "good";
              return (
                <li key={project.id}>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-surface-border/5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          status === "critical" ? "bg-status-critical" : status === "warning" ? "bg-status-warning" : "bg-status-good"
                        }`}
                      />
                      <div>
                        <p className="text-ink-primary">{project.name}</p>
                        <p className="text-xs text-ink-muted">
                          {project.githubRepo ?? "Aucun dépôt GitHub connecté"}
                          {project.githubBranch ? ` · ${project.githubBranch}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ProjectOwnerBadge project={project} />
                      <p className="text-xs text-ink-secondary">
                        {status === "critical" ? "Critique" : status === "warning" ? "Avertissement" : "Opérationnel"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
