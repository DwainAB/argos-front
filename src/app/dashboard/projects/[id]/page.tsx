import { notFound } from "next/navigation";
import { mockProjects, mockLogs, mockAlerts } from "@/lib/mock-data";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBanner } from "@/components/dashboard/StatusBanner";

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id);

  if (!project) {
    notFound();
  }

  const projectLogs = mockLogs.filter((l) => l.projectId === project.id);
  const errorCount = projectLogs.filter((l) => l.level === "error").length;
  const warningCount = projectLogs.filter((l) => l.level === "warning").length;
  const activeAlerts = mockAlerts.filter((a) => a.projectId === project.id).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">{project.name}</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {project.githubRepo} · {project.githubBranch}
        </p>
      </div>

      <StatusBanner status={project.status} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dernier déploiement" value={project.lastDeployAt} />
        <StatCard
          label="Erreurs (24h)"
          value={String(errorCount)}
          tone={errorCount > 0 ? "critical" : "good"}
        />
        <StatCard
          label="Avertissements (24h)"
          value={String(warningCount)}
          tone={warningCount > 0 ? "warning" : "good"}
        />
        <StatCard label="Alertes actives" value={String(activeAlerts)} tone={activeAlerts > 0 ? "warning" : "good"} />
      </div>
    </div>
  );
}
