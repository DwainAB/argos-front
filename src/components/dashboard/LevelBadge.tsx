import type { LogLevel } from "@/lib/mock-data";

const levelLabels: Record<LogLevel, string> = {
  info: "Info",
  warning: "Avertissement",
  error: "Erreur",
};

const levelClasses: Record<LogLevel, string> = {
  info: "bg-status-good/10 text-status-good",
  warning: "bg-status-warning/10 text-status-warning",
  error: "bg-status-critical/10 text-status-critical",
};

export function LevelBadge({ level }: { level: LogLevel }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${levelClasses[level]}`}>
      {levelLabels[level]}
    </span>
  );
}
