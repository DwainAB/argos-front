"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-fetch";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { ActorLabel, type Actor } from "@/components/dashboard/ActorLabel";

type CodeAnalysisScores = {
  security: number;
  performance: number;
  architecture: number;
  maintainability: number;
};

type FindingStatus = "open" | "resolved" | "ignored";

type CodeFinding = {
  id: string;
  category: string;
  severity: "critical" | "warning" | "info";
  filePath: string;
  title: string;
  description: string;
  recommendation: string;
  status: FindingStatus;
  resolvedBy: Actor;
  resolvedAt: string | null;
};

type ApiCodeAnalysis = {
  id: string;
  status: "running" | "done" | "failed";
  filesScanned: number | null;
  scores: CodeAnalysisScores | null;
  findings: CodeFinding[] | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  startedBy: Actor;
};

const SCORE_LABELS: Record<keyof CodeAnalysisScores, string> = {
  security: "Sécurité",
  performance: "Performance",
  architecture: "Architecture",
  maintainability: "Maintenabilité",
};

const CATEGORY_LABELS: Record<string, string> = {
  secrets: "Secret exposé",
  security: "Sécurité",
  performance: "Performance",
  architecture: "Architecture",
  dependencies: "Dépendances",
  dead_code: "Code mort",
  error_handling: "Gestion d'erreurs",
  tests: "Tests",
};

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 };

const POLL_INTERVAL_MS = 3000;

function scoreBarColor(score: number) {
  if (score >= 8) return "bg-status-good";
  if (score >= 5) return "bg-status-warning";
  return "bg-status-critical";
}

function scoreTextColor(score: number) {
  if (score >= 8) return "text-status-good";
  if (score >= 5) return "text-status-warning";
  return "text-status-critical";
}

function overallScore(scores: CodeAnalysisScores) {
  return Math.round((scores.security + scores.performance + scores.architecture + scores.maintainability) / 4);
}

function FindingRow({
  finding,
  onChangeStatus,
}: {
  finding: CodeFinding;
  onChangeStatus: (findingId: string, status: FindingStatus) => void;
}) {
  const [updating, setUpdating] = useState(false);

  async function handleChange(status: FindingStatus) {
    setUpdating(true);
    try {
      await onChangeStatus(finding.id, status);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <details className="group rounded-xl border border-surface-border/10 bg-surface-raised">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 p-4 [&::-webkit-details-marker]:hidden">
        <span className="text-ink-muted transition group-open:rotate-90">▶</span>
        <SeverityBadge severity={finding.severity} />
        <span className="rounded-full bg-ink-muted/10 px-2 py-0.5 text-xs font-medium text-ink-secondary">
          {CATEGORY_LABELS[finding.category] ?? finding.category}
        </span>
        <span className="font-mono text-xs text-ink-muted">{finding.filePath}</span>
        <span className="flex-1 text-sm font-medium text-ink-primary">{finding.title}</span>
        {finding.status === "resolved" && (
          <span className="shrink-0 rounded-full bg-status-good/10 px-2 py-0.5 text-xs font-medium text-status-good">
            Corrigé
          </span>
        )}
        {finding.status === "ignored" && (
          <span className="shrink-0 rounded-full bg-ink-muted/10 px-2 py-0.5 text-xs font-medium text-ink-muted">
            Ignoré
          </span>
        )}
      </summary>

      <div className="space-y-3 border-t border-surface-border/10 p-4">
        <p className="text-sm text-ink-secondary">{finding.description}</p>
        <p className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-2 text-sm text-ink-primary">
          → {finding.recommendation}
        </p>

        {finding.status === "resolved" && finding.resolvedBy && (
          <p className="text-xs text-ink-muted">
            Corrigé par <ActorLabel actor={finding.resolvedBy} />
            {finding.resolvedAt && ` le ${new Date(finding.resolvedAt).toLocaleString("fr-FR")}`}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {finding.status !== "resolved" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleChange("resolved")}
              className="rounded-lg border border-status-good/20 bg-status-good/10 px-3 py-1.5 text-xs font-medium text-status-good transition hover:bg-status-good/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Marquer comme corrigé
            </button>
          )}
          {finding.status !== "ignored" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleChange("ignored")}
              className="rounded-lg border border-surface-border/10 bg-surface px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ignorer (bénin)
            </button>
          )}
          {finding.status !== "open" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleChange("open")}
              className="rounded-lg border border-surface-border/10 bg-surface px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rouvrir
            </button>
          )}
        </div>
      </div>
    </details>
  );
}

export default function CodeAnalysisDetailPage({ params }: { params: { id: string; analysisId: string } }) {
  const [analysis, setAnalysis] = useState<ApiCodeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showIgnored, setShowIgnored] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalysis() {
      try {
        const res = await apiFetch(`/api/code-analysis/${params.analysisId}`);
        if (!res.ok) throw new Error("Réponse non OK");
        const data = await res.json();
        if (!cancelled) setAnalysis(data.analysis);
      } catch (err) {
        console.error("Erreur lors du chargement de l'analyse :", err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalysis();
    const interval = setInterval(() => {
      if (analysis?.status !== "running" && analysis !== null) return;
      fetchAnalysis();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.analysisId, analysis?.status]);

  async function handleChangeStatus(findingId: string, status: FindingStatus) {
    try {
      const res = await apiFetch(`/api/code-analysis/${params.analysisId}/findings/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

      setAnalysis((prev) =>
        prev
          ? {
              ...prev,
              findings: (prev.findings ?? []).map((f) => (f.id === findingId ? data.finding : f)),
            }
          : prev
      );
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du problème ${findingId} :`, err);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-secondary">Chargement de l'analyse...</p>;
  }

  if (loadError || !analysis) {
    return <p className="text-sm text-status-critical">Impossible de charger cette analyse.</p>;
  }

  const allFindings = analysis.findings ?? [];
  const secretFindings = allFindings.filter((f) => f.category === "secrets" && f.status === "open");
  const visibleFindings = allFindings
    .filter((f) => f.category !== "secrets")
    .filter((f) => (showIgnored ? f.status === "ignored" : f.status !== "ignored"))
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3));
  const ignoredCount = allFindings.filter((f) => f.category !== "secrets" && f.status === "ignored").length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/projects/${params.id}/code-analysis`}
          className="text-sm text-ink-secondary transition hover:text-ink-primary"
        >
          ← Retour aux analyses
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-ink-primary">Analyse du {new Date(analysis.createdAt).toLocaleString("fr-FR")}</h1>
        </div>
        {analysis.startedBy && (
          <p className="mt-1 text-xs text-ink-muted">
            Lancée par <ActorLabel actor={analysis.startedBy} />
          </p>
        )}
      </div>

      {analysis.status === "running" && (
        <p className="rounded-xl border border-accent-500/20 bg-accent-500/5 p-4 text-sm text-ink-primary">
          Analyse en cours... cette page se met à jour automatiquement.
        </p>
      )}

      {analysis.status === "failed" && (
        <p className="rounded-xl border border-status-critical/20 bg-status-critical/5 p-4 text-sm text-status-critical">
          L'analyse a échoué{analysis.errorMessage ? ` : ${analysis.errorMessage}` : "."}
        </p>
      )}

      {analysis.status === "done" && (
        <>
          {secretFindings.length > 0 && (
            <section className="space-y-3 rounded-xl border-2 border-status-critical bg-status-critical/10 p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-status-critical">
                ⚠ Secrets exposés détectés — à révoquer en urgence
              </h2>
              {secretFindings.map((finding) => (
                <div key={finding.id} className="rounded-lg border border-status-critical/20 bg-surface-raised p-3">
                  <p className="font-mono text-xs text-ink-muted">{finding.filePath}</p>
                  <p className="mt-1 text-sm font-medium text-ink-primary">{finding.title}</p>
                  <p className="mt-1 text-sm text-ink-secondary">{finding.description}</p>
                  <p className="mt-2 text-sm text-status-critical">→ {finding.recommendation}</p>
                  <button
                    type="button"
                    onClick={() => handleChangeStatus(finding.id, "resolved")}
                    className="mt-2 rounded-lg border border-status-critical/30 bg-surface px-3 py-1.5 text-xs font-medium text-status-critical transition hover:bg-status-critical/10"
                  >
                    Marquer comme corrigé (clé révoquée)
                  </button>
                </div>
              ))}
            </section>
          )}

          {analysis.scores && (
            <section className="rounded-xl border border-surface-border/10 bg-surface-raised p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-ink-secondary">
                  Scores globaux — {analysis.filesScanned ?? 0} fichier(s) analysé(s)
                </h2>
                <div className="text-right">
                  <p className="text-xs text-ink-muted">Note globale</p>
                  <p className={`text-2xl font-semibold ${scoreTextColor(overallScore(analysis.scores))}`}>
                    {overallScore(analysis.scores)}/10
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(Object.keys(SCORE_LABELS) as (keyof CodeAnalysisScores)[]).map((key) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
                      <span>{SCORE_LABELS[key]}</span>
                      <span className="font-medium text-ink-primary">{analysis.scores![key]}/10</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-border/10">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(analysis.scores![key])}`}
                        style={{ width: `${analysis.scores![key] * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-ink-secondary">
                {visibleFindings.length} problème{visibleFindings.length !== 1 ? "s" : ""}
                {showIgnored ? " ignoré(s)" : " détecté(s)"}
              </h2>
              {ignoredCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowIgnored((v) => !v)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    showIgnored
                      ? "border-accent-500/20 bg-accent-500/10 text-accent-400"
                      : "border-surface-border/10 bg-surface text-ink-secondary hover:bg-surface-border/5"
                  }`}
                >
                  {showIgnored ? "← Retour aux problèmes" : `Voir les problèmes ignorés (${ignoredCount})`}
                </button>
              )}
            </div>

            {visibleFindings.length === 0 ? (
              <p className="rounded-xl border border-status-good/20 bg-status-good/5 p-4 text-sm text-ink-primary">
                {showIgnored ? "Aucun problème ignoré." : "Aucun problème notable détecté. Le code de ce dépôt est propre."}
              </p>
            ) : (
              visibleFindings.map((finding) => (
                <FindingRow key={finding.id} finding={finding} onChangeStatus={handleChangeStatus} />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
