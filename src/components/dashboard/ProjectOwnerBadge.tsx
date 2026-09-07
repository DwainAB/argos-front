import { projectOwnerLabel, type ApiProject } from "@/lib/use-projects";

export function ProjectOwnerBadge({ project }: { project: ApiProject }) {
  return (
    <span className="rounded-full border border-surface-border/10 bg-surface-raised px-2 py-0.5 text-xs text-ink-secondary">
      {projectOwnerLabel(project)}
    </span>
  );
}
