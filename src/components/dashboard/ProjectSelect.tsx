"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProjects, projectOwnerLabel, type ApiProject } from "@/lib/use-projects";
import { IconChevronDown, IconPlus, IconProjects } from "@/components/icons/NavIcons";

// Regroupe les projets par propriétaire (section "Personnel" en premier, puis une
// section par organisation), pour qu'on sache toujours d'un coup d'œil à qui appartient
// chaque projet listé.
function groupByOwner(projects: ApiProject[]) {
  const groups: { label: string; projects: ApiProject[] }[] = [];

  for (const project of projects) {
    const label = projectOwnerLabel(project);
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, projects: [] };
      groups.push(group);
    }
    group.projects.push(project);
  }

  return groups.sort((a, b) => (a.label === "Personnel" ? -1 : b.label === "Personnel" ? 1 : 0));
}

export function ProjectSelect() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { projects } = useProjects();

  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  const activeProjectId = projectMatch?.[1];
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const groupedProjects = groupByOwner(projects);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-surface-border/10 bg-surface-raised px-3 py-1.5 text-sm text-ink-primary transition hover:bg-surface-border/5"
      >
        {activeProject ? (
          <>
            <span className="h-2 w-2 shrink-0 rounded-full bg-status-good" />
            <span className="max-w-[160px] truncate">{activeProject.name}</span>
          </>
        ) : (
          <>
            <IconProjects className="h-4 w-4 text-ink-secondary" />
            <span>Vue globale</span>
          </>
        )}
        <IconChevronDown className="h-4 w-4 text-ink-secondary" />
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-surface-border/10 bg-surface-raised shadow-xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-surface-border/5 ${
              !activeProject ? "text-accent-400" : "text-ink-primary"
            }`}
          >
            <IconProjects className="h-4 w-4" />
            Vue globale
          </button>

          <div className="my-1 h-px bg-surface-border/10" />

          <div className="max-h-64 overflow-y-auto py-1">
            {projects.length === 0 && (
              <p className="px-3 py-2 text-xs text-ink-muted">Aucun projet connecté pour l'instant.</p>
            )}
            {groupedProjects.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  {group.label}
                </p>
                <ul>
                  {group.projects.map((project) => (
                    <li key={project.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          router.push(`/dashboard/projects/${project.id}`);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-surface-border/5 ${
                          activeProjectId === project.id ? "text-accent-400" : "text-ink-primary"
                        }`}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-status-good" />
                        <span className="flex-1 truncate">{project.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="my-1 h-px bg-surface-border/10" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/projects/new");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-accent-400 transition hover:bg-accent-500/10"
          >
            <IconPlus className="h-4 w-4" />
            Ajouter un projet
          </button>
        </div>
      )}
    </div>
  );
}
