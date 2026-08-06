import Link from "next/link";
import { mockProjects, mockNotifications, statusDotClasses, statusLabels } from "@/lib/mock-data";
import { StatCard } from "@/components/dashboard/StatCard";

const levelClasses = {
  info: "text-status-good",
  warning: "text-status-warning",
  error: "text-status-critical",
} as const;

export default function DashboardOverviewPage() {
  const criticalCount = mockProjects.filter((p) => p.status === "critical").length;
  const warningCount = mockProjects.filter((p) => p.status === "warning").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Vue d'ensemble</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Récapitulatif de tous vos projets connectés.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projets connectés" value={String(mockProjects.length)} />
        <StatCard
          label="Projets critiques"
          value={String(criticalCount)}
          tone={criticalCount > 0 ? "critical" : "good"}
        />
        <StatCard
          label="Avertissements actifs"
          value={String(warningCount)}
          tone={warningCount > 0 ? "warning" : "good"}
        />
        <StatCard label="Notifications (24h)" value={String(mockNotifications.length)} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-primary">Projets</h2>
          <Link href="/dashboard/projects" className="text-xs text-accent-400 hover:text-accent-300">
            Voir tous les projets
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised">
          <ul className="divide-y divide-surface-border/10">
            {mockProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-surface-border/5"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotClasses[project.status]}`} />
                    <div>
                      <p className="text-ink-primary">{project.name}</p>
                      <p className="text-xs text-ink-muted">{project.githubRepo} · {project.githubBranch}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-secondary">{statusLabels[project.status]}</p>
                    <p className="text-xs text-ink-muted">{project.lastDeployAt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-primary">Dernières notifications</h2>
          <Link href="/dashboard/notifications" className="text-xs text-accent-400 hover:text-accent-300">
            Voir tout l'historique
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised">
          <ul className="divide-y divide-surface-border/10">
            {mockNotifications.map((notif) => (
              <li key={notif.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                <span className={`mt-0.5 text-xs font-medium uppercase ${levelClasses[notif.level]}`}>
                  {notif.level}
                </span>
                <div className="flex-1">
                  <p className="text-ink-primary">{notif.message}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {notif.projectName} · {notif.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
