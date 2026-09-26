"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-fetch";
import { useProjects } from "@/lib/use-projects";
import { ProjectOwnerBadge } from "@/components/dashboard/ProjectOwnerBadge";

type CodeAnalysisScores = {
  security: number;
  performance: number;
  architecture: number;
  maintainability: number;
};

type ApiCodeAnalysis = {
  id: string;
  status: "running" | "done" | "failed";
  filesScanned: number | null;
  scores: CodeAnalysisScores | null;
  findings: unknown[] | null;
  createdAt: string;
  completedAt: string | null;
};

type Estimate = { filesToAnalyze: number; estimatedSeconds: number };

function formatDuration(seconds: number) {
  if (seconds < 60) return `~${seconds} s`;
  const minutes = Math.round(seconds / 60);
  return `~${minutes} min`;
}

function scoreColorClass(score: number) {
  if (score >= 8) return "text-status-good";
  if (score >= 5) return "text-status-warning";
  return "text-status-critical";
}

function overallScore(scores: CodeAnalysisScores) {
  return Math.round((scores.security + scores.performance + scores.architecture + scores.maintainability) / 4);
}

// Poll actif tant qu'au moins une analyse récente est encore en cours, pour refléter sa fin
// sans que l'utilisateur ait besoin de recharger la page.
const POLL_INTERVAL_MS = 4000;

export default function ProjectCodeAnalysisPage({ params }: { params: { id: string } }) {
  const { projects } = useProjects();
  const project = projects.find((p) => p.id === params.id);

  const [analyses, setAnalyses] = useState<ApiCodeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalyses() {
      try {
        const res = await apiFetch(`/api/projects/${params.id}/code-analysis`);
        const data = await res.json();
        if (!cancelled) setAnalyses(data.analyses ?? []);
      } catch (err) {
        console.error("Erreur lors du chargement des analyses de code :", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalyses();
    const hasRunning = analyses.some((a) => a.status === "running");
    const interval = hasRunning ? setInterval(fetchAnalyses, POLL_INTERVAL_MS) : undefined;

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, analyses.some((a) => a.status === "running")]);

  async function handleEstimate() {
    setEstimating(true);
    setError(null);
    setEstimate(null);

    try {
      const res = await apiFetch(`/api/projects/${params.id}/code-analysis/estimate`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setEstimate(data);
    } catch (err) {
      console.error("Erreur lors de l'estimation :", err);
      setError("Impossible d'estimer l'analyse de ce dépôt.");
    } finally {
      setEstimating(false);
    }
  }

  async function handleLaunch() {
    setLaunching(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/projects/${params.id}/code-analysis`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setAnalyses((prev) => [data.analysis, ...prev]);
      setEstimate(null);
    } catch (err) {
      console.error("Erreur lors du lancement de l'analyse :", err);
      setError(err instanceof Error ? err.message : "Impossible de lancer l'analyse.");
    } finally {
      setLaunching(false);
    }
  }

  const hasGithub = !!project?.githubRepo;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold text-ink-primary">Argos Security</h1>
        {project && <ProjectOwnerBadge project={project} />}
      </div>
      <p className="-mt-4 max-w-2xl text-sm text-ink-secondary">
        Argos analyse votre dépôt pour détecter failles de sécurité, secrets exposés et autres problèmes de code, et
        vous propose une recommandation pour chacun.
      </p>

      {!hasGithub ? (
        <p className="rounded-xl border border-surface-border/10 bg-surface-raised p-4 text-sm text-ink-secondary">
          Ce projet n'a pas de dépôt GitHub connecté — connectez-en un depuis les intégrations pour lancer une
          analyse.
        </p>
      ) : (
        <section className="space-y-3 rounded-xl border border-surface-border/10 bg-surface-raised p-4">
          {!estimate ? (
            <button
              type="button"
              onClick={handleEstimate}
              disabled={estimating}
              className="rounded-lg border border-surface-border/10 bg-surface px-4 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {estimating ? "Estimation..." : "Estimer l'analyse"}
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-primary">
                {estimate.filesToAnalyze} fichier{estimate.filesToAnalyze > 1 ? "s" : ""} à analyser — durée estimée{" "}
                {formatDuration(estimate.estimatedSeconds)}.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEstimate(null)}
                  className="rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-border/5"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={launching}
                  className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {launching ? "Lancement..." : "Lancer l'analyse"}
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-xs text-status-critical">{error}</p>}
        </section>
      )}

      <div className="overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised">
        {loading ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">Chargement de l'historique...</p>
        ) : analyses.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">Aucune analyse pour ce projet pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-surface-border/10">
            {analyses.map((analysis) => (
              <li key={analysis.id}>
                <Link
                  href={`/dashboard/projects/${params.id}/code-analysis/${analysis.id}`}
                  className="flex w-full max-w-full items-center gap-3 overflow-hidden px-4 py-3 text-left text-sm transition hover:bg-surface-border/5"
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-ink-primary">
                      {analysis.status === "running"
                        ? "Analyse en cours..."
                        : analysis.status === "failed"
                          ? "Analyse échouée"
                          : `${analysis.filesScanned ?? 0} fichier(s) analysé(s), ${analysis.findings?.length ?? 0} problème(s) détecté(s)`}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(analysis.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  {analysis.status === "done" && analysis.scores && (
                    <span className={`shrink-0 text-lg font-semibold ${scoreColorClass(overallScore(analysis.scores))}`}>
                      {overallScore(analysis.scores)}/10
                    </span>
                  )}
                  {analysis.status === "running" && (
                    <span className="shrink-0 rounded-full bg-accent-500/10 px-2 py-0.5 text-xs font-medium text-accent-400">
                      En cours
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
