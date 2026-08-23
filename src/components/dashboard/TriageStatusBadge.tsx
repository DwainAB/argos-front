// Badge indiquant où en est le triage automatique par l'IA locale sur un log
// critical/warning (voir triageStatus côté backend, log-triage.service.ts). N'affiche
// rien une fois le triage terminé ("done") ou pour un log jamais concerné ("none").
export function TriageStatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink-muted/10 px-2 py-0.5 text-xs font-medium text-ink-secondary">
        <span aria-hidden="true">⏳</span>
        En attente de vérification
      </span>
    );
  }

  if (status === "checking") {
    return (
      <span
        aria-hidden="true"
        title="Vérification IA en cours..."
        className="inline-flex shrink-0 animate-pulse items-center"
      >
        👁️
      </span>
    );
  }

  return null;
}
