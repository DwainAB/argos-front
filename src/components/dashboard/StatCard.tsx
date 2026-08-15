import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "default" | "good" | "warning" | "critical";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-ink-secondary",
  good: "text-status-good",
  warning: "text-status-warning",
  critical: "text-status-critical",
};

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-surface-border/10 bg-surface-raised p-4">
      <p className="text-xs text-ink-secondary">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
