import type { ProjectStatus } from "@/lib/mock-data";
import { statusLabels, statusSummaries } from "@/lib/mock-data";

const bannerStyles: Record<ProjectStatus, string> = {
  good: "border-status-good/30 bg-status-good/10",
  warning: "border-status-warning/30 bg-status-warning/10",
  critical: "border-status-critical/30 bg-status-critical/10",
};

const dotStyles: Record<ProjectStatus, string> = {
  good: "bg-status-good",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
};

const textStyles: Record<ProjectStatus, string> = {
  good: "text-status-good",
  warning: "text-status-warning",
  critical: "text-status-critical",
};

export function StatusBanner({ status }: { status: ProjectStatus }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${bannerStyles[status]}`}>
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotStyles[status]}`} />
      <div>
        <p className={`text-sm font-medium ${textStyles[status]}`}>{statusLabels[status]}</p>
        <p className="mt-1 text-sm text-ink-secondary">{statusSummaries[status]}</p>
      </div>
    </div>
  );
}
