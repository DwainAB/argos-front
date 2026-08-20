export type LogCategory = "critical" | "warning" | "benign" | "info";

const categoryLabels: Record<LogCategory, string> = {
  critical: "Critique",
  warning: "Avertissement",
  benign: "Erreur bénigne",
  info: "Info",
};

const categoryClasses: Record<LogCategory, string> = {
  critical: "bg-status-critical/10 text-status-critical",
  warning: "bg-status-warning/10 text-status-warning",
  benign: "bg-ink-muted/10 text-ink-secondary",
  info: "bg-status-good/10 text-status-good",
};

export function CategoryBadge({ category }: { category: string }) {
  const normalized: LogCategory = ["critical", "warning", "benign", "info"].includes(category)
    ? (category as LogCategory)
    : "info";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryClasses[normalized]}`}
    >
      {categoryLabels[normalized]}
    </span>
  );
}
