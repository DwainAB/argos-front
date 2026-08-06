import { notFound } from "next/navigation";
import { mockProjects, statusDotClasses, statusLabels } from "@/lib/mock-data";
import { StatCard } from "@/components/dashboard/StatCard";

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClasses[project.status]}`} />
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">{project.name}</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {project.githubRepo} · {project.githubBranch} · {statusLabels[project.status]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Dernier déploiement" value={project.lastDeployAt} />
        <StatCard label="Erreurs (24h)" value="0" tone="good" />
        <StatCard label="Avertissements (24h)" value="0" tone="good" />
      </div>
    </div>
  );
}
