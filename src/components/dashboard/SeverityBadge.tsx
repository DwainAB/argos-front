export type FindingSeverity = "critical" | "warning" | "info";

const severityLabels: Record<FindingSeverity, string> = {
  critical: "Critique",
  warning: "Avertissement",
  info: "Info",
};

const severityClasses: Record<FindingSeverity, string> = {
  critical: "bg-status-critical/10 text-status-critical",
  warning: "bg-status-warning/10 text-status-warning",
  info: "bg-ink-muted/10 text-ink-secondary",
};

export function SeverityBadge({ severity }: { severity: string }) {
  const normalized: FindingSeverity = ["critical", "warning", "info"].includes(severity)
    ? (severity as FindingSeverity)
    : "info";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityClasses[normalized]}`}
    >
      {severityLabels[normalized]}
    </span>
  );
}
