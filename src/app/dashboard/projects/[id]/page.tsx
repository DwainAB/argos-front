"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { useProjects } from "@/lib/use-projects";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBanner } from "@/components/dashboard/StatusBanner";

type ProjectOverview = {
  latestDeployment: { id: string; status: string; createdAt: string } | null;
  errorCount: number;
  warningCount: number;
};

// Couleur du statut de déploiement tel que renvoyé par Railway (SUCCESS, FAILED, CRASHED...).
function deploymentStatusClass(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "SUCCESS") return "text-status-good";
  if (["FAILED", "CRASHED", "ERROR"].includes(normalized)) return "text-status-critical";
  return "text-ink-muted";
}

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const { projects, loading } = useProjects();
  const project = projects.find((p) => p.id === params.id);

  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/projects/${params.id}/overview`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err) => console.error("Erreur lors du chargement de l'aperçu :", err))
      .finally(() => {
        if (!cancelled) setOverviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-ink-secondary">Chargement...</p>;
  }

  if (!project) {
    return <p className="text-sm text-ink-secondary">Projet introuvable.</p>;
  }

  const deploymentDate = overview?.latestDeployment
    ? new Date(overview.latestDeployment.createdAt)
    : null;

  const deploymentValue = overviewLoading ? "…" : deploymentDate ? deploymentDate.toLocaleDateString("fr-FR") : "Aucun déploiement";

  const deploymentStatus = overview?.latestDeployment?.status;

  const deploymentHint = deploymentDate ? (
    <>
      {deploymentDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      {deploymentStatus && (
        <>
          {" · "}
          <span className={deploymentStatusClass(deploymentStatus)}>{deploymentStatus}</span>
        </>
      )}
    </>
  ) : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">{project.name}</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {project.githubRepo ?? "Aucun dépôt GitHub connecté"}
          {project.githubBranch ? ` · ${project.githubBranch}` : ""}
        </p>
      </div>

      {/* Le statut global dépend de l'analyse IA des logs, pas encore implémentée côté
          backend — affichage neutre en attendant. */}
      <StatusBanner status="good" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dernier déploiement" value={deploymentValue} hint={deploymentHint} />
        <StatCard
          label="Erreurs (24h)"
          value={overviewLoading ? "…" : String(overview?.errorCount ?? 0)}
          tone={overview && overview.errorCount > 0 ? "critical" : "good"}
        />
        <StatCard
          label="Avertissements (24h)"
          value={overviewLoading ? "…" : String(overview?.warningCount ?? 0)}
          tone={overview && overview.warningCount > 0 ? "warning" : "good"}
        />
        <StatCard label="Alertes actives" value="—" />
      </div>

      <p className="text-xs text-ink-muted">
        Les alertes détaillées seront disponibles une fois l'analyse IA des logs branchée. Consultez la page{" "}
        <span className="text-ink-secondary">Logs</span> pour voir le flux brut en temps réel.
      </p>
    </div>
  );
}
