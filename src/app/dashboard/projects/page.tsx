import Link from "next/link";
import { mockProjects, statusDotClasses, statusLabels } from "@/lib/mock-data";

export default function AllProjectsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink-primary">Tous les projets</h1>

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
                  <p className="text-ink-primary">{project.name}</p>
                </div>
                <p className="text-xs text-ink-secondary">{statusLabels[project.status]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
