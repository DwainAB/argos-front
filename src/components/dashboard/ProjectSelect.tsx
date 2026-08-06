"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { mockProjects, statusDotClasses, statusLabels } from "@/lib/mock-data";
import { IconChevronDown, IconPlus, IconProjects } from "@/components/icons/NavIcons";

export function ProjectSelect() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  const activeProjectId = projectMatch?.[1];
  const activeProject = mockProjects.find((p) => p.id === activeProjectId);

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
            <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotClasses[activeProject.status]}`} />
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

          <ul className="max-h-64 overflow-y-auto py-1">
            {mockProjects.map((project) => (
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
                  <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotClasses[project.status]}`} />
                  <span className="flex-1 truncate">{project.name}</span>
                  <span className="text-xs text-ink-muted">{statusLabels[project.status]}</span>
                </button>
              </li>
            ))}
          </ul>

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
