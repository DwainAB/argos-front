"use client";

import { useProjects } from "@/lib/use-projects";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBanner } from "@/components/dashboard/StatusBanner";

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const { projects, loading } = useProjects();
  const project = projects.find((p) => p.id === params.id);

  if (loading) {
    return <p className="text-sm text-ink-secondary">Chargement...</p>;
  }

  if (!project) {
    return <p className="text-sm text-ink-secondary">Projet introuvable.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">{project.name}</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {project.githubRepo ?? "Aucun dépôt GitHub connecté"}
          {project.githubBranch ? ` · ${project.githubBranch}` : ""}
        </p>
      </div>

      {/* Le statut global et les statistiques dépendent de l'analyse IA des logs,
          pas encore implémentée côté backend — affichage neutre en attendant. */}
      <StatusBanner status="good" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dernier déploiement" value="—" />
        <StatCard label="Erreurs (24h)" value="—" />
        <StatCard label="Avertissements (24h)" value="—" />
        <StatCard label="Alertes actives" value="—" />
      </div>

      <p className="text-xs text-ink-muted">
        Les statistiques détaillées seront disponibles une fois l'analyse IA des logs branchée. Consultez la page{" "}
        <span className="text-ink-secondary">Logs</span> pour voir le flux brut en temps réel.
      </p>
    </div>
  );
}
